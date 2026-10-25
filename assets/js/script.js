const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

function closeMenu() {
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu navigasi");
}

menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
    );
});

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        closeMenu();
    });
});

// Tutup menu jika pengguna menekan tombol Escape.
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeMenu();
    }
});

/* =========================
   STATS COUNT-UP ANIMATION
========================= */

const countElements = document.querySelectorAll(".count-up");

function animateCount(element) {
    const target = Number(element.dataset.target);

    if (!Number.isFinite(target) || target < 0) {
        element.textContent = "0";
        return;
    }

    const duration = 1800;
    const startTime = performance.now();
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
        element.textContent = target.toLocaleString("id-ID");
        return;
    }

    function updateCount(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Ease-out: awal cepat, lalu melambat.
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(target * easedProgress);

        element.textContent = currentValue.toLocaleString("id-ID");

        if (progress < 1) {
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = target.toLocaleString("id-ID");
        }
    }

    requestAnimationFrame(updateCount);
}

if ("IntersectionObserver" in window) {
    const statsObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.4
        }
    );

    countElements.forEach(element => {
        statsObserver.observe(element);
    });
} else {
    countElements.forEach(animateCount);
}

/* =========================
   KATALOG TEMA FILTER
========================= */

const mainCategoryButtons = document.querySelectorAll(".catalog-main-tab");

const packageButtons = document.querySelectorAll(".catalog-sub-tab");

const weddingSubTabs = document.getElementById("weddingSubTabs");

const themeCards = document.querySelectorAll(".theme-card");

let activeMainCategory = "wedding";
let activePackage = "Motion";

function filterThemes() {
    themeCards.forEach(card => {
        const category = card.dataset.category;
        const packageName = card.dataset.package;

        const matchesCategory = category === activeMainCategory;

        const matchesPackage =
            activeMainCategory === "other" || packageName === activePackage;

        card.hidden = !(matchesCategory && matchesPackage);
    });
}

mainCategoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeMainCategory = button.dataset.mainCategory;

        // Update tombol kategori utama
        mainCategoryButtons.forEach(item => {
            const isActive = item === button;

            item.classList.toggle("active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
        });

        // Sembunyikan subbutton untuk Acara Lain
        // Tampilkan kembali untuk Pernikahan
        weddingSubTabs.hidden = activeMainCategory !== "wedding";

        filterThemes();
    });
});

packageButtons.forEach(button => {
    button.addEventListener("click", () => {
        activePackage = button.dataset.package;

        packageButtons.forEach(item => {
            item.classList.toggle("active", item === button);
        });

        filterThemes();
    });
});

// Tampilkan kategori default ketika halaman dibuka.
filterThemes();

/* FAQ: hanya satu pertanyaan terbuka */
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(currentItem => {
    currentItem.addEventListener("toggle", () => {
        if (!currentItem.open) return;

        faqItems.forEach(otherItem => {
            if (otherItem !== currentItem) {
                otherItem.open = false;
            }
        });
    });
});


/* Footer: tahun copyright otomatis */
const footerYear = document.getElementById("footerYear");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}
