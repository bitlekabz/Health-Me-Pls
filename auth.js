/* =========================================================
   AUTH.JS  — สมัคร/เข้าสู่ระบบด้วย Google เท่านั้น
   หมายเหตุสำคัญ: เว็บนี้เป็น static site ไม่มีฐานข้อมูล/เซิร์ฟเวอร์
   - ข้อมูลผู้ใช้ทั้งหมด (ทะเบียนผู้ใช้ + สถานะล็อกอิน) เก็บใน
     localStorage ของเบราว์เซอร์เครื่องนั้นๆ เท่านั้น ไม่ได้แชร์
     ข้ามอุปกรณ์หรือข้ามเบราว์เซอร์ (โหมดทดลอง/เดโม)
   - เมื่อมีคนสมัครสมาชิกสำเร็จ ระบบจะส่งข้อมูล (ชื่อ/อีเมล/รูป/วันที่)
     ไปบันทึกไว้ใน Google Sheet กลางด้วย ดูวิธีตั้งค่าได้ในไฟล์
     AppsScript-Code.gs ที่แนบมาด้วย
   - ต้องตั้งค่า GOOGLE_CLIENT_ID ก่อนปุ่มถึงจะใช้งานได้ ดูวิธีได้ที่
     คอมเมนต์ด้านล่าง
   ========================================================= */

const AUTH_KEY = "hmp_current_user";      // ผู้ใช้ที่ล็อกอินอยู่ตอนนี้
const USERS_KEY = "hmp_users";            // ทะเบียนผู้ใช้ทั้งหมดที่เคยสมัคร (เบราว์เซอร์นี้)

/* ---- ใส่ Google Client ID ของโปรเจกต์ตัวเองตรงนี้ ----
   วิธีขอ (ฟรี): https://console.cloud.google.com/apis/credentials
   -> Create Credentials -> OAuth client ID -> Web application
   -> Authorized JavaScript origins ใส่โดเมนที่เว็บรันจริง เช่น
      https://ชื่อคุณ.github.io (ห้ามมี path ต่อท้าย)
   ต้องเปิดเว็บผ่าน http:// หรือ https:// เท่านั้น เปิดแบบ file://
   (ดับเบิลคลิกไฟล์ตรงๆ) ปุ่ม Google จะใช้งานไม่ได้
------------------------------------------------------------ */
const GOOGLE_CLIENT_ID = "705168161398-isthlev3pjl74na4ucp7ihg4htba7ljg.apps.googleusercontent.com";

/* ---- ใส่ "Web app URL" ที่ได้จากการ Deploy Apps Script ตรงนี้ ----
   วิธีได้ URL: ดูขั้นตอนในไฟล์ AppsScript-Code.gs (คอมเมนต์ด้านบนไฟล์)
   ถ้ายังไม่ได้ตั้งค่า (เว้นว่างไว้) ระบบจะสมัครได้ตามปกติ แค่จะไม่
   บันทึกลง Google Sheet เท่านั้น (จะไม่มี error ใดๆ)
------------------------------------------------------------ */
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwbPOO10ElKHDlLb4b4pQEhlzuQUNyuUiMUX24GlghnkcUG8QX8uWSl8GGwMCJLsoo/exec"; // เช่น "https://script.google.com/macros/s/xxxxxxxx/exec"

/* ---------------- ทะเบียนผู้ใช้ ---------------- */
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function findUserByEmail(email) {
  return getUsers().find((u) => u.email === email) || null;
}

function registerUser(user) {
  const users = getUsers();
  users.push({ ...user, createdAt: new Date().toISOString() });
  saveUsers(users);
  sendSignupToSheet(user);
}

/* ---------------- ส่งข้อมูลผู้สมัครไปบันทึกที่ Google Sheet ---------------- */
function sendSignupToSheet(user) {
  if (!SHEET_WEBHOOK_URL) return; // ยังไม่ได้ตั้งค่า URL ก็ข้ามไปเฉยๆ

  // ใช้ mode: "no-cors" เพราะ Apps Script web app ไม่ส่ง CORS header กลับมา
  // (เราไม่ต้องอ่าน response กลับมาอยู่แล้ว แค่ต้องการให้ข้อมูลไปถึงชีต)
  fetch(SHEET_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      photo: user.photo,
    }),
  }).catch((err) => {
    // ถ้าเน็ตหลุดหรือ URL ผิด อย่างน้อยก็ไม่ให้กระทบการสมัครฝั่งผู้ใช้
    console.warn("ส่งข้อมูลไป Google Sheet ไม่สำเร็จ:", err);
  });
}

/* ---------------- สถานะล็อกอินปัจจุบัน ---------------- */
function saveCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = pathTo("index.html");
}

/* ---------------- helper: คำนวณ path ให้ถูกไม่ว่าจะอยู่โฟลเดอร์ไหน ---------------- */
function pathTo(file) {
  // หน้าใน /lessons/ ต้องใช้ ../ นำหน้า ไฟล์อื่นอยู่ที่ root อยู่แล้ว
  const inLessons = window.location.pathname.includes("/lessons/");
  return inLessons ? `../${file}` : file;
}

/* ---------------- render login state into .site-nav ---------------- */
function renderNavAuthState() {
  const actions = document.querySelector(".site-nav__actions");
  if (!actions) return;
  const user = getUser();
  if (!user) return; // ค่าเริ่มต้น = ปุ่ม เข้าสู่ระบบ/สมัคร ตามที่มีอยู่ใน HTML

  actions.innerHTML = `
    <span class="site-nav__user">
      <img class="site-nav__avatar" src="${user.photo}" alt="">
      ${user.name}
    </span>
    <button class="site-nav__logout" type="button" id="logoutBtn">ออกจากระบบ</button>
  `;
  document.getElementById("logoutBtn").addEventListener("click", logout);
}

/* ---------------- แสดงข้อความแจ้งเตือนใต้ปุ่ม Google ---------------- */
function showAuthMessage(containerId, text, kind = "error") {
  const container = document.getElementById(containerId);
  if (!container) return;
  const wrap = container.closest(".auth-google-wrap") || container.parentElement;
  let msg = wrap.querySelector(".auth-inline-msg");
  if (!msg) {
    msg = document.createElement("p");
    msg.className = "auth-inline-msg";
    msg.style.marginTop = "1rem";
    msg.style.fontFamily = "'Kanit', sans-serif";
    msg.style.fontSize = ".85rem";
    wrap.appendChild(msg);
  }
  msg.style.color = kind === "error" ? "#C0392B" : "#2E7D32";
  msg.textContent = text;
}

/* ---------------- Google Identity Services ---------------- */
function decodeJwt(token) {
  const payload = token.split(".")[1];
  return JSON.parse(decodeURIComponent(escape(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))));
}

function onGoogleCredential(response, mode, containerId) {
  const data = decodeJwt(response.credential);
  const profile = {
    name: data.name,
    email: data.email,
    photo: data.picture, // รูปโปรไฟล์จริงจากบัญชี Google
  };
  const existing = findUserByEmail(profile.email);

  if (mode === "signup") {
    if (existing) {
      // อีเมลนี้สมัครไปแล้ว -> ไม่สร้างซ้ำ พาไปหน้าล็อกอินแทน
      showAuthMessage(containerId, "อีเมลนี้มีบัญชีอยู่แล้ว กำลังพาไปหน้าเข้าสู่ระบบ...", "info");
      setTimeout(() => {
        window.location.href = pathTo("login.html");
      }, 1500);
      return;
    }
    registerUser(profile);
    saveCurrentUser(profile);
    window.location.href = pathTo("index.html");
    return;
  }

  if (mode === "login") {
    if (!existing) {
      // อีเมลนี้ยังไม่เคยสมัคร -> ไม่ให้เข้า ต้องไปสมัครก่อน
      showAuthMessage(
        containerId,
        "ยังไม่มีบัญชีนี้ในระบบ กรุณาสมัครสมาชิกก่อน",
        "error"
      );
      return;
    }
    saveCurrentUser(existing);
    window.location.href = pathTo("index.html");
    return;
  }
}

function setupGoogleButton(containerId, mode) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!GOOGLE_CLIENT_ID) {
    el.style.display = "none";
    const msg = document.getElementById("googleUnavailableMsg");
    if (msg) msg.style.display = "block";
    return;
  }

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.onload = () => {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onGoogleCredential(response, mode, containerId),
    });
    google.accounts.id.renderButton(el, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: 320,
      locale: "th",
    });
  };
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavAuthState();
  setupGoogleButton("googleSignupBtn", "signup");
  setupGoogleButton("googleLoginBtn", "login");
});