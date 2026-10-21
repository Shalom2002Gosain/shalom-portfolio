// js = r'''// Footer year
const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Accessible mobile navigation
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle?.addEventListener("click", () => {
    const open = siteNav?.classList.toggle("open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(open));
    const label = menuToggle.querySelector(".menu-label");
    const symbol = menuToggle.querySelector(".menu-symbol");
    if (label) label.textContent = open ? "CLOSE" : "MENU";
    if (symbol) symbol.textContent = open ? "×" : "＋";
});

siteNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
        const label = menuToggle?.querySelector(".menu-label");
        const symbol = menuToggle?.querySelector(".menu-symbol");
        if (label) label.textContent = "MENU";
        if (symbol) symbol.textContent = "＋";
    });
});

// Filter project cards
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        filterButtons.forEach((item) => item.classList.toggle("active", item === button));
        projectCards.forEach((card) => {
            card.hidden = !(filter === "all" || card.dataset.category === filter);
        });
    });
});

// Reveal sections as they enter the viewport
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("visible"));
}

// Scroll progress indicator
const progress = document.getElementById("scrollProgress");
function updateScrollProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${value}%`;
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

// Highlight the current navigation section
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");
if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: "-25% 0px -60% 0px" });
    sections.forEach((section) => sectionObserver.observe(section));
}

// Animated neural network canvas. It pauses off-screen and respects reduced motion.
const canvas = document.getElementById("neuralCanvas");
if (canvas) {
    const ctx = canvas.getContext("2d");
    const stage = canvas.parentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, particles = [], frameId = null;
    let visible = false, lastFrame = 0;

    function resizeCanvas() {
        const rect = stage.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.max(35, Math.min(85, Math.floor(width / 8)));
        particles = Array.from({ length: count }, (_, index) => ({
            baseX: Math.random() * width,
            baseY: Math.random() * height,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.7,
            radius: index % 7 === 0 ? 2 : 1 + Math.random() * 0.5,
            x: 0, y: 0
        }));
    }

    function draw(time = 0) {
        if (!visible) return;
        if (!reducedMotion.matches && time - lastFrame < 30) {
            frameId = requestAnimationFrame(draw);
            return;
        }
        lastFrame = time;
        ctx.clearRect(0, 0, width, height);
        const t = time * 0.00035;

        particles.forEach((p) => {
            p.x = p.baseX + Math.sin(t * p.speed + p.phase) * 12;
            p.y = p.baseY + Math.cos(t * p.speed + p.phase) * 12;
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);
                if (distance < 105) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(82, 216, 255, ${(1 - distance / 105) * 0.34})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }

        particles.forEach((p, index) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = index % 7 === 0 ? "#52d8ff" : "#b6c9e3";
            ctx.shadowColor = index % 7 === 0 ? "#3984ff" : "transparent";
            ctx.shadowBlur = index % 7 === 0 ? 11 : 0;
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        if (!reducedMotion.matches) frameId = requestAnimationFrame(draw);
        else frameId = null;
    }

    function start() {
        cancelAnimationFrame(frameId);
        resizeCanvas();
        lastFrame = 0;
        draw(0);
    }
    function stop() {
        cancelAnimationFrame(frameId);
        frameId = null;
    }

    if ("IntersectionObserver" in window) {
        const canvasObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                visible = entry.isIntersecting;
                if (visible) start();
                else stop();
            });
        }, { threshold: 0.05 });
        canvasObserver.observe(stage);
    } else {
        visible = true;
        start();
    }

    window.addEventListener("resize", () => {
        if (visible) start();
    });
    reducedMotion.addEventListener?.("change", () => {
        if (visible) start();
    });
}
