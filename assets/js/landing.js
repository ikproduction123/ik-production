/* =========================================================
IK-Pro.My.Id
LANDING PAGE JAVASCRIPT
========================================================= */


/* =========================================================
PACKAGE DATA
========================================================= */

const packageData = {

    basic: {
        name: "Basic",
        price: 59000
    },

    premium: {
        name: "Premium",
        price: 99000
    },

    luxury: {
        name: "Luxury",
        price: 180000
    },

    motion: {
        name: "Motion",
        price: 250000
    }

};


/* =========================================================
THEME DATA
========================================================= */

const themeData = {

    /* =====================================================
    PERNIKAHAN
    ====================================================== */

    pernikahan: [

        /* =========================
        MOTION
        ========================== */

        {
            slug: "vintage-brown",
            name: "Vintage Brown",
            package: "motion"
        },

        {
            slug: "cinematic-love",
            name: "Cinematic Love",
            package: "motion"
        },

        {
            slug: "luxury-motion",
            name: "Luxury Motion",
            package: "motion"
        },

        {
            slug: "parallax-flower",
            name: "Parallax Flower",
            package: "motion"
        },

        {
            slug: "cinematic-black",
            name: "Cinematic Black",
            package: "motion"
        },


        /* =========================
        LUXURY
        ========================== */

        {
            slug: "velvet-garden",
            name: "Velvet Garden",
            package: "luxury"
        },

        {
            slug: "royal-black",
            name: "Royal Black",
            package: "luxury"
        },

        {
            slug: "luxury-marble",
            name: "Luxury Marble",
            package: "luxury"
        },

        {
            slug: "golden-night",
            name: "Golden Night",
            package: "luxury"
        },

        {
            slug: "luxury-emerald",
            name: "Luxury Emerald",
            package: "luxury"
        },

        {
            slug: "premium-floral",
            name: "Premium Floral",
            package: "luxury"
        },


        /* =========================
        PREMIUM
        ========================== */

        {
            slug: "romantic-garden",
            name: "Romantic Garden",
            package: "premium"
        },

        {
            slug: "soft-pink",
            name: "Soft Pink",
            package: "premium"
        },

        {
            slug: "modern-gold",
            name: "Modern Gold",
            package: "premium"
        },

        {
            slug: "botanical-green",
            name: "Botanical Green",
            package: "premium"
        },

        {
            slug: "cream-luxury",
            name: "Cream Luxury",
            package: "premium"
        },


        /* =========================
        BASIC
        ========================== */

        {
            slug: "simple-white",
            name: "Simple White",
            package: "basic"
        },

        {
            slug: "floral-basic",
            name: "Floral Basic",
            package: "basic"
        },

        {
            slug: "elegant-basic",
            name: "Elegant Basic",
            package: "basic"
        }

    ],


    /* =====================================================
    ACARA LAIN
    ====================================================== */

    acaraLain: [

        {
            slug: "khitanan",
            name: "Khitanan",
            package: null
        },

        {
            slug: "aqiqah",
            name: "Aqiqah",
            package: null
        },

        {
            slug: "ulang-tahun",
            name: "Ulang Tahun",
            package: null
        },

        {
            slug: "wisuda",
            name: "Wisuda",
            package: null
        },

        {
            slug: "gathering",
            name: "Gathering",
            package: null
        }

    ],


    /* =====================================================
    UNDANGAN CETAK
    ====================================================== */

    undanganCetak: [

        {
            slug: "cetak-premium",
            name: "Cetak Premium",
            package: null
        }

    ]

};


/* =========================================================
STATE
========================================================= */

let currentCategory = "pernikahan";

let currentPackage = "all";


/* =========================================================
DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initThemeSystem();

        initNavigation();

        initSmoothScroll();

        initMobileNavigation();

        initCurrentYear();

        initHashNavigation();

    }
);


/* =========================================================
THEME SYSTEM
========================================================= */

function initThemeSystem() {

    const mainCategoryButtons =
        document.querySelectorAll(
            "[data-main-category]"
        );

    const packageButtons =
        document.querySelectorAll(
            "[data-package]"
        );


    /* =====================================================
    MAIN CATEGORY BUTTON
    ====================================================== */

    mainCategoryButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.dataset.mainCategory;

                    selectMainCategory(
                        category
                    );

                }
            );

        }
    );


    /* =====================================================
    PACKAGE BUTTON
    ====================================================== */

    packageButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const packageName =
                        button.dataset.package;

                    selectPackage(
                        packageName
                    );

                }
            );

        }
    );


    /* =====================================================
    INITIAL STATE
    ====================================================== */

    selectMainCategory(
        currentCategory,
        false
    );

}


/* =========================================================
SELECT MAIN CATEGORY
========================================================= */

function selectMainCategory(
    category,
    updateHash = true
) {

    /* =====================================================
    VALIDATE CATEGORY
    ====================================================== */

    if (
        !Object.prototype.hasOwnProperty.call(
            themeData,
            category
        )
    ) {

        console.warn(
            "Kategori tidak ditemukan:",
            category
        );

        return;
    }


    /* =====================================================
    UPDATE STATE
    ====================================================== */

    currentCategory = category;


    /* =====================================================
    PERNIKAHAN
    ====================================================== */

    if (
        currentCategory === "pernikahan"
    ) {

        currentPackage = "all";

    } else {

        /*
        Acara Lain dan Undangan Cetak
        tidak memiliki package filter.
        */

        currentPackage = "all";

    }


    /* =====================================================
    UPDATE UI
    ====================================================== */

    updateMainCategoryButtons();

    updatePackageButtons();

    updateSubCategory();


    /* =====================================================
    RENDER
    ====================================================== */

    renderThemes();


    /* =====================================================
    HASH
    ====================================================== */

    if (updateHash) {

        history.replaceState(
            null,
            "",
            "#tema"
        );

    }

}


/* =========================================================
SELECT PACKAGE
========================================================= */

function selectPackage(
    packageName
) {

    /* =====================================================
    PACKAGE HANYA UNTUK PERNIKAHAN
    ====================================================== */

    if (
        currentCategory !== "pernikahan"
    ) {

        return;
    }


    /* =====================================================
    VALID PACKAGE
    ====================================================== */

    const validPackages = [
        "all",
        "motion",
        "luxury",
        "premium",
        "basic"
    ];


    if (
        !validPackages.includes(
            packageName
        )
    ) {

        return;
    }


    /* =====================================================
    UPDATE STATE
    ====================================================== */

    currentPackage = packageName;


    /* =====================================================
    UPDATE UI
    ====================================================== */

    updatePackageButtons();


    /* =====================================================
    RENDER
    ====================================================== */

    renderThemes();

}


/* =========================================================
UPDATE MAIN CATEGORY BUTTONS
========================================================= */

function updateMainCategoryButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-main-category]"
        );


    buttons.forEach(
        button => {

            const isActive =
                button.dataset.mainCategory ===
                currentCategory;


            button.classList.toggle(
                "active",
                isActive
            );


            button.setAttribute(
                "aria-selected",
                String(isActive)
            );

        }
    );

}


/* =========================================================
UPDATE PACKAGE BUTTONS
========================================================= */

function updatePackageButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-package]"
        );


    buttons.forEach(
        button => {

            const isActive =
                currentPackage ===
                button.dataset.package;


            button.classList.toggle(
                "active",
                isActive
            );


            button.setAttribute(
                "aria-selected",
                String(isActive)
            );

        }
    );

}


/* =========================================================
UPDATE SUB CATEGORY
========================================================= */

function updateSubCategory() {

    const subTabs =
        document.querySelector(
            '[data-sub-tabs="pernikahan"]'
        );


    if (!subTabs) {
        return;
    }


    /* =====================================================
    PERNIKAHAN
    ====================================================== */

    if (
        currentCategory === "pernikahan"
    ) {

        subTabs.hidden = false;

        subTabs.setAttribute(
            "aria-hidden",
            "false"
        );

        subTabs.classList.add(
            "is-visible"
        );

        return;
    }


    /* =====================================================
    ACARA LAIN / CETAK
    ====================================================== */

    subTabs.hidden = true;

    subTabs.setAttribute(
        "aria-hidden",
        "true"
    );

    subTabs.classList.remove(
        "is-visible"
    );

}


/* =========================================================
GET FILTERED THEMES
========================================================= */

function getFilteredThemes() {

    const themes =
        themeData[currentCategory] || [];


    /* =====================================================
    ACARA LAIN / CETAK
    ====================================================== */

    if (
        currentCategory !== "pernikahan"
    ) {

        return themes;

    }


    /* =====================================================
    SEMUA
    ====================================================== */

    if (
        currentPackage === "all"
    ) {

        return themes;

    }


    /* =====================================================
    FILTER PACKAGE
    ====================================================== */

    return themes.filter(
        theme =>
            theme.package ===
            currentPackage
    );

}


/* =========================================================
RENDER THEMES
========================================================= */

function renderThemes() {

    const themeGrid =
        document.getElementById(
            "themeGrid"
        );

    const themeEmpty =
        document.getElementById(
            "themeEmpty"
        );


    if (!themeGrid) {
        return;
    }


    /* =====================================================
    GET THEMES
    ====================================================== */

    const themes =
        getFilteredThemes();


    /* =====================================================
    CLEAR
    ====================================================== */

    themeGrid.innerHTML = "";


    /* =====================================================
    EMPTY
    ====================================================== */

    if (
        themes.length === 0
    ) {

        if (themeEmpty) {

            themeEmpty.hidden = false;

        }

        return;

    }


    if (themeEmpty) {

        themeEmpty.hidden = true;

    }


    /* =====================================================
    RENDER
    ====================================================== */

    const fragment =
        document.createDocumentFragment();


    themes.forEach(
        theme => {

            const card =
                createThemeCard(
                    theme
                );

            fragment.appendChild(
                card
            );

        }
    );


    themeGrid.appendChild(
        fragment
    );

}


/* =========================================================
CREATE THEME CARD
========================================================= */

function createThemeCard(
    theme
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "theme-card";


    /* =====================================================
    DATA
    ====================================================== */

    const imageUrl =
        getThemeImage(
            theme
        );

    const previewUrl =
        getThemePreviewUrl(
            theme
        );

    const orderUrl =
        createOrderUrl(
            theme
        );

    const packageName =
        getPackageName(
            theme
        );

    const price =
        getThemePrice(
            theme
        );


    /* =====================================================
    CARD HTML
    ====================================================== */

    article.innerHTML = `

        <div class="theme-image">

            <img
                src="${escapeHTML(imageUrl)}"
                alt="Tema ${escapeHTML(theme.name)}"
                loading="lazy"
            >

            <span class="theme-package">
                ${escapeHTML(packageName)}
            </span>

        </div>


        <div class="theme-info">

            <h3 class="theme-name">
                ${escapeHTML(theme.name)}
            </h3>


            <p class="theme-price">
                ${formatPrice(price)}
            </p>


            <div class="theme-actions">

                <a
                    href="${escapeHTML(previewUrl)}"
                    class="btn theme-preview-btn"
                    ${previewUrl !== "#" ? 'target="_blank" rel="noopener noreferrer"' : ""}
                >
                    Preview
                </a>


                <a
                    href="${escapeHTML(orderUrl)}"
                    class="btn theme-order-btn"
                >
                    Order
                </a>

            </div>

        </div>

    `;


    /* =====================================================
    IMAGE FALLBACK
    ====================================================== */

    const image =
        article.querySelector(
            ".theme-image img"
        );


    if (image) {

        image.addEventListener(
            "error",
            () => {

                if (
                    image.dataset.fallbackApplied
                ) {

                    return;

                }


                image.dataset.fallbackApplied =
                    "true";


                image.src =
                    "/assets/images/theme-placeholder.jpg";

            }
        );

    }


    return article;

}


/* =========================================================
GET THEME IMAGE
========================================================= */

function getThemeImage(
    theme
) {

    /* =====================================================
    PERNIKAHAN
    ====================================================== */

    if (
        currentCategory === "pernikahan"
    ) {

        return (
            `/templates/${theme.package}/` +
            `${theme.slug}/assets/cover.jpg`
        );

    }


    /* =====================================================
    ACARA LAIN
    ====================================================== */

    if (
        currentCategory === "acaraLain"
    ) {

        return (
            "/assets/images/themes/" +
            "acara-lain/" +
            `${theme.slug}.jpg`
        );

    }


    /* =====================================================
    UNDANGAN CETAK
    ====================================================== */

    if (
        currentCategory === "undanganCetak"
    ) {

        return (
            "/assets/images/themes/" +
            "cetak/" +
            `${theme.slug}.jpg`
        );

    }


    return (
        "/assets/images/" +
        "theme-placeholder.jpg"
    );

}


/* =========================================================
GET THEME PREVIEW URL
========================================================= */

function getThemePreviewUrl(
    theme
) {

    /* =====================================================
    PERNIKAHAN
    ====================================================== */

    if (
        currentCategory === "pernikahan"
    ) {

        return (
            `/templates/${theme.package}/` +
            `${theme.slug}/`
        );

    }


    /*
    Acara Lain dan Cetak belum memiliki
    template preview website.
    */

    return "#";

}


/* =========================================================
GET PACKAGE NAME
========================================================= */

function getPackageName(
    theme
) {

    if (
        theme.package
    ) {

        return (
            packageData[
                theme.package
            ]?.name ||
            "Tema"
        );

    }


    if (
        currentCategory === "acaraLain"
    ) {

        return "Acara Lain";

    }


    if (
        currentCategory === "undanganCetak"
    ) {

        return "Cetak";

    }


    return "Tema";

}


/* =========================================================
GET THEME PRICE
========================================================= */

function getThemePrice(
    theme
) {

    if (
        !theme.package
    ) {

        return null;

    }


    return (
        packageData[
            theme.package
        ]?.price ??
        null
    );

}


/* =========================================================
FORMAT PRICE
========================================================= */

function formatPrice(
    price
) {

    if (
        price === null ||
        price === undefined
    ) {

        return "Hubungi Kami";

    }


    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(price);

}


/* =========================================================
CREATE ORDER URL
========================================================= */

function createOrderUrl(
    theme
) {

    const params =
        new URLSearchParams();


    /* =====================================================
    PACKAGE
    ====================================================== */

    if (
        theme.package
    ) {

        params.set(
            "package",
            theme.package
        );

    }


    /* =====================================================
    THEME
    ====================================================== */

    if (
        theme.slug
    ) {

        params.set(
            "theme",
            theme.slug
        );

    }


    /* =====================================================
    CATEGORY
    ====================================================== */

    params.set(
        "category",
        currentCategory
    );


    return (
        `/register.html?${params.toString()}`
    );

}


/* =========================================================
ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
NAVIGATION
========================================================= */

function initNavigation() {

    const navLinks =
        document.querySelectorAll(
            "[data-nav]"
        );


    if (
        !navLinks.length
    ) {

        return;

    }


    const sections = [];


    /* =====================================================
    REGISTER LINKS
    ====================================================== */

    navLinks.forEach(
        link => {

            const targetId =
                link.dataset.nav;


            const section =
                document.getElementById(
                    targetId
                );


            if (section) {

                sections.push({
                    link,
                    section
                });

            }


            link.addEventListener(
                "click",
                event => {

                    const target =
                        document.getElementById(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });


                    history.replaceState(
                        null,
                        "",
                        `#${targetId}`
                    );


                    closeMobileNavigation();

                }
            );

        }
    );


    /* =====================================================
    INTERSECTION OBSERVER
    ====================================================== */

    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {

                                return;

                            }


                            const currentId =
                                entry.target.id;


                            navLinks.forEach(
                                link => {

                                    link.classList.toggle(
                                        "active",
                                        link.dataset.nav ===
                                            currentId
                                    );

                                }
                            );

                        }
                    );

                },
                {
                    threshold: 0.2,

                    rootMargin:
                        "-20% 0px -55% 0px"
                }
            );


        sections.forEach(
            item => {

                observer.observe(
                    item.section
                );

            }
        );

    }

}


/* =========================================================
SMOOTH SCROLL
========================================================= */

function initSmoothScroll() {

    /*
    Navigation utama sudah ditangani
    oleh initNavigation().
    Fungsi ini hanya menangani anchor
    lain yang belum memiliki data-nav.
    */

    const anchors =
        document.querySelectorAll(
            'a[href^="#"]:not([data-nav])'
        );


    anchors.forEach(
        anchor => {

            anchor.addEventListener(
                "click",
                event => {

                    const href =
                        anchor.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );

}


/* =========================================================
MOBILE NAVIGATION
========================================================= */

function initMobileNavigation() {

    const mobileLinks =
        document.querySelectorAll(
            "[data-mobile-nav]"
        );


    mobileLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    closeMobileNavigation();

                }
            );

        }
    );

}


/* =========================================================
CLOSE MOBILE NAVIGATION
========================================================= */

function closeMobileNavigation() {

    const mobileNav =
        document.getElementById(
            "mobileBottomNav"
        );


    if (!mobileNav) {

        return;

    }


    mobileNav.classList.remove(
        "is-open"
    );

}


/* =========================================================
CURRENT YEAR
========================================================= */

function initCurrentYear() {

    const yearElement =
        document.getElementById(
            "currentYear"
        );


    if (!yearElement) {

        return;

    }


    yearElement.textContent =
        new Date().getFullYear();

}


/* =========================================================
HASH NAVIGATION
========================================================= */

function initHashNavigation() {

    const hash =
        window.location.hash;


    if (!hash) {

        return;

    }


    const hashMap = {

        "#beranda": "beranda",

        "#fitur": "fitur",

        "#tema": "tema",

        "#harga": "harga",

        "#faq": "faq"

    };


    const targetId =
        hashMap[hash];


    if (!targetId) {

        return;

    }


    const target =
        document.getElementById(
            targetId
        );


    if (!target) {

        return;

    }


    setTimeout(
        () => {

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        100
    );

}


/* =========================================================
PUBLIC API
========================================================= */

window.IKProLanding = {

    getThemes() {

        return themeData;

    },


    getPackages() {

        return packageData;

    },


    selectCategory(
        category
    ) {

        selectMainCategory(
            category
        );

    },


    selectPackage(
        packageName
    ) {

        selectPackage(
            packageName
        );

    },


    getCurrentState() {

        return {

            category:
                currentCategory,

            package:
                currentPackage

        };

    }

};