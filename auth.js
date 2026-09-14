/* =========================================================
   AUTH.JS  — สมัคร/เข้าสู่ระบบด้วย Google เท่านั้น
   หมายเหตุสำคัญ: เว็บนี้เป็น static site ไม่มีฐานข้อมูล/เซิร์ฟเวอร์
   - เมื่อผู้ใช้กดปุ่ม Google แล้วยินยอม ระบบจะได้ชื่อ อีเมล และ
     "รูปโปรไฟล์จริง" จากบัญชี Google มาเก็บไว้ใน localStorage ของ
     เบราว์เซอร์เครื่องนั้นๆ (โหมดทดลอง/เดโม ไม่มีฐานข้อมูลกลาง)
   - ต้องตั้งค่า GOOGLE_CLIENT_ID ก่อนปุ่มถึงจะใช้งานได้ ดูวิธีได้ที่
     คอมเมนต์ด้านล่าง
   ========================================================= */

const AUTH_KEY = "hmp_current_user";

/* ---- ใส่ Google Client ID ของโปรเจกต์ตัวเองตรงนี้ ----
   วิธีขอ (ฟรี): https://console.cloud.google.com/apis/credentials
   -> Create Credentials -> OAuth client ID -> Web application
   -> Authorized JavaScript origins ใส่โดเมนที่เว็บรันจริง เช่น
      https://ชื่อคุณ.github.io (ห้ามมี path ต่อท้าย)
   ต้องเปิดเว็บผ่าน http:// หรือ https:// เท่านั้น เปิดแบบ file://
   (ดับเบิลคลิกไฟล์ตรงๆ) ปุ่ม Google จะใช้งานไม่ได้
------------------------------------------------------------ */
const GOOGLE_CLIENT_ID = "705168161398-isthlev3pjl74na4ucp7ihg4htba7ljg.apps.googleusercontent.com";

function saveUser(user) {
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
  window.location.href = "index.html";
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

/* ---------------- Google Identity Services ---------------- */
function decodeJwt(token) {
  const payload = token.split(".")[1];
  return JSON.parse(decodeURIComponent(escape(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))));
}

function onGoogleCredential(response) {
  const data = decodeJwt(response.credential);
  saveUser({
    name: data.name,
    email: data.email,
    photo: data.picture, // รูปโปรไฟล์จริงจากบัญชี Google
  });
  window.location.href = "index.html";
}

function setupGoogleButton(containerId) {
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
      callback: onGoogleCredential,
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
  setupGoogleButton("googleSignupBtn");
  setupGoogleButton("googleLoginBtn");
});