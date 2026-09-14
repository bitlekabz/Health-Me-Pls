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

/* ================= LESSON SIDEBAR NAV ================= */
const lessonNav = document.querySelector(".lesson-nav");

if (lessonNav) {
    const toggle = lessonNav.querySelector(".lesson-nav__toggle");

    toggle.addEventListener("click", () => {
        const isOpen = lessonNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });
}