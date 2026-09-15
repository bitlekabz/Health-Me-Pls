const slides = document.querySelectorAll(".hero__slide");
const dots = document.querySelectorAll(".hero__dot");

let current = 0;
let timer;

function goToSlide(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");

    current = index;

    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
}

function nextSlide() {
    goToSlide((current + 1) % slides.length);
}

function startAutoplay() {
    timer = setInterval(nextSlide, 4000);
}

if (slides.length) {
    startAutoplay();
}

dots.forEach((dot) => {
    dot.addEventListener("click", () => {
        clearInterval(timer);
        goToSlide(Number(dot.dataset.index));
        startAutoplay();
    });
});

/* ================= LESSON NAV DATA (แหล่งข้อมูลเดียว ห้ามพิมพ์ซ้ำที่อื่น) =================
   ต้องการเพิ่ม/แก้ชื่อบท หรือสลับลำดับ ให้แก้ตรงนี้ที่เดียว
   ทุกหน้า (index.html และ lessons/lesson-XX.html) จะอัปเดตตามอัตโนมัติ */
const LESSONS = [
    { num: "01", title: "โภชนาการพื้นฐาน: กินอย่างไรให้สมดุล", file: "lesson-01.html" },
    { num: "02", title: "เริ่มออกกำลังกายแบบไม่ฝืนตัวเอง", file: "lesson-02.html" },
    { num: "03", title: "นอนหลับให้มีคุณภาพ ไม่ใช่แค่ให้ครบชั่วโมง", file: "lesson-03.html" },
    { num: "04", title: "จัดการความเครียดในชีวิตประจำวัน", file: "lesson-04.html" },
    { num: "05", title: "ดูแลสุขภาพจิตและอารมณ์", file: "lesson-05.html" },
];

/* ================= LESSON SIDEBAR NAV ================= */
function renderLessonNav() {
    const list = document.querySelector(".lesson-nav__list");
    if (!list) return;

    // หน้าที่อยู่ในโฟลเดอร์ lessons/ ให้ลิงก์กันเองแบบไม่มี prefix
    // หน้า index.html ที่อยู่นอกโฟลเดอร์ ต้องลิงก์ผ่าน "lessons/"
    const inLessonsFolder = window.location.pathname.includes("/lessons/");
    const prefix = inLessonsFolder ? "" : "lessons/";
    const currentFile = window.location.pathname.split("/").pop();

    list.innerHTML = LESSONS.map((lesson) => {
        const isCurrent = lesson.file === currentFile;
        return (
            '<li><a class="lesson-nav__link' + (isCurrent ? " is-current" : "") + '"' +
            ' href="' + prefix + lesson.file + '"' +
            (isCurrent ? ' aria-current="page"' : "") + '>' +
            '<span class="lesson-nav__num">' + lesson.num + '</span>' +
            '<span>' + lesson.title + '</span>' +
            '</a></li>'
        );
    }).join("");
}

renderLessonNav();

const lessonNav = document.querySelector(".lesson-nav");

if (lessonNav) {
    const toggle = lessonNav.querySelector(".lesson-nav__toggle");

    toggle.addEventListener("click", () => {
        const isOpen = lessonNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });
}