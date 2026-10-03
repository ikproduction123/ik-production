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
   FALLBACK THEME DATA
========================================================= */

const fallbackThemeData = [

    /* =========================
       MOTION
    ========================== */

    {
        category: "pernikahan",
        package: "motion",
        slug: "vintage-brown",
        name: "Vintage Brown",
        image: "/templates/motion/vintage-brown/assets/cover.jpg",
        preview: "/templates/motion/vintage-brown/"
    },

    {
        category: "pernikahan",
        package: "motion",
        slug: "cinematic-love",
        name: "Cinematic Love",
        image: "/templates/motion/cinematic-love/assets/cover.jpg",
        preview: "/templates/motion/cinematic-love/"
    },

    {
        category: "pernikahan",
        package: "motion",
        slug: "luxury-motion",
        name: "Luxury Motion",
        image: "/templates/motion/luxury-motion/assets/cover.jpg",
        preview: "/templates/motion/luxury-motion/"
    },

    {
        category: "pernikahan",
        package: "motion",
        slug: "parallax-flower",
        name: "Parallax Flower",
        image: "/templates/motion/parallax-flower/assets/cover.jpg",
        preview: "/templates/motion/parallax-flower/"
    },

    {
        category: "pernikahan",
        package: "motion",
        slug: "cinematic-black",
        name: "Cinematic Black",
        image: "/templates/motion/cinematic-black/assets/cover.jpg",
        preview: "/templates/motion/cinematic-black/"
    },


    /* =========================
       LUXURY
    ========================== */

    {
        category: "pernikahan",
        package: "luxury",
        slug: "velvet-garden",
        name: "Velvet Garden",
        image: "/templates/luxury/velvet-garden/assets/cover.jpg",
        preview: "/templates/luxury/velvet-garden/"
    },

    {
        category: "pernikahan",
        package: "luxury",
        slug: "royal-black",
        name: "Royal Black",
        image: "/templates/luxury/royal-black/assets/cover.jpg",
        preview: "/templates/luxury/royal-black/"
    },

    {
        category: "pernikahan",
        package: "luxury",
        slug: "luxury-marble",
        name: "Luxury Marble",
        image: "/templates/luxury/luxury-marble/assets/cover.jpg",
        preview: "/templates/luxury/luxury-marble/"
    },

    {
        category: "pernikahan",
        package: "luxury",
        slug: "golden-night",
        name: "Golden Night",
        image: "/templates/luxury/golden-night/assets/cover.jpg",
        preview: "/templates/luxury/golden-night/"
    },

    {
        category: "pernikahan",
        package: "luxury",
        slug: "luxury-emerald",
        name: "Luxury Emerald",
        image: "/templates/luxury/luxury-emerald/assets/cover.jpg",
        preview: "/templates/luxury/luxury-emerald/"
    },

    {
        category: "pernikahan",
        package: "luxury",
        slug: "premium-floral",
        name: "Premium Floral",
        image: "/templates/luxury/premium-floral/assets/cover.jpg",
        preview: "/templates/luxury/premium-floral/"
    },


    /* =========================
       PREMIUM
    ========================== */

    {
        category: "pernikahan",
        package: "premium",
        slug: "romantic-garden",
        name: "Romantic Garden",
        image: "/templates/premium/romantic-garden/assets/cover.jpg",
        preview: "/templates/premium/romantic-garden/"
    },

    {
        category: "pernikahan",
        package: "premium",
        slug: "soft-pink",
        name: "Soft Pink",
        image: "/templates/premium/soft-pink/assets/cover.jpg",
        preview: "/templates/premium/soft-pink/"
    },

    {
        category: "pernikahan",
        package: "premium",
        slug: "modern-gold",
        name: "Modern Gold",
        image: "/templates/premium/modern-gold/assets/cover.jpg",
        preview: "/templates/premium/modern-gold/"
    },

    {
        category: "pernikahan",
        package: "premium",
        slug: "botanical-green",
        name: "Botanical Green",
        image: "/templates/premium/botanical-green/assets/cover.jpg",
        preview: "/templates/premium/botanical-green/"
    },

    {
        category: "pernikahan",
        package: "premium",
        slug: "cream-luxury",
        name: "Cream Luxury",
        image: "/templates/premium/cream-luxury/assets/cover.jpg",
        preview: "/templates/premium/cream-luxury/"
    },


    /* =========================
       BASIC
    ========================== */

    {
        category: "pernikahan",
        package: "basic",
        slug: "simple-white",
        name: "Simple White",
        image: "/templates/basic/simple-white/assets/cover.jpg",
        preview: "/templates/basic/simple-white/"
    },

    {
        category: "pernikahan",
        package: "basic",
        slug: "floral-basic",
        name: "Floral Basic",
        image: "/templates/basic/floral-basic/assets/cover.jpg",
        preview: "/templates/basic/floral-basic/"
    },

    {
        category: "pernikahan",
        package: "basic",
        slug: "elegant-basic",
        name: "Elegant Basic",
        image: "/templates/basic/elegant-basic/assets/cover.jpg",
        preview: "/templates/basic/elegant-basic/"
    },


    /* =========================
       ACARA LAIN
    ========================== */

    {
        category: "acaraLain",
        package: null,
        slug: "khitanan",
        name: "Khitanan",
        image: "/assets/images/themes/acara-lain/khitanan.jpg",
        preview: "#"
    },

    {
        category: "acaraLain",
        package: null,
        slug: "aqiqah",
        name: "Aqiqah",
        image: "/assets/images/themes/acara-lain/aqiqah.jpg",
        preview: "#"
    },

    {
        category: "acaraLain",
        package: null,
        slug: "ulang-tahun",
        name: "Ulang Tahun",
        image: "/assets/images/themes/acara-lain/ulang-tahun.jpg",
        preview: "#"
    },

    {
        category: "acaraLain",
        package: null,
        slug: "wisuda",
        name: "Wisuda",
        image: "/assets/images/themes/acara-lain/wisuda.jpg",
        preview: "#"
    },

    {
        category: "acaraLain",
        package: null,
        slug: "gathering",
        name: "Gathering",
        image: "/assets/images/themes/acara-lain/gathering.jpg",
        preview: "#"
    },


    /* =========================
       CETAK
    ========================== */

    {
        category: "undanganCetak",
        package: null,
        slug: "cetak-premium",
        name: "Cetak Premium",
        image: "/assets/images/themes/cetak/cetak-premium.jpg",
        preview: "#"
    }

];


let themeData = [...fallbackThemeData];


/* =========================================================
   STATE
========================================================= */

const state = {

    category: "pernikahan",

    package: "all"

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initHeader();

        initNavigation();

        initThemeTabs();

        initFAQ();

        initCurrentYear();

        renderThemes();

        handleInitialHash();

    }
);


/* =========================================================
   HEADER
========================================================= */

function initHeader() {

    const header =
        document.getElementById("siteHeader");

    if (!header) {
        return;
    }


    function updateHeader() {

        if (window.scrollY > 20) {

            header.classList.add("is-scrolled");

        } else {

            header.classList.remove("is-scrolled");

        }

    }


    updateHeader();


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function initNavigation() {

    const navLinks =
        document.querySelectorAll("[data-nav]");

    if (!navLinks.length) {
        return;
    }


    /*
     * CLICK NAVIGATION
     */

    navLinks.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.dataset.nav;

                const target =
                    document.getElementById(targetId);


                if (!target) {
                    return;
                }


                event.preventDefault();


                scrollToSection(
                    targetId
                );

            }
        );

    });


    /*
     * ACTIVE NAVIGATION
     */

    const sectionIds = [

        "beranda",
        "fitur",
        "tema",
        "harga",
        "faq"

    ];


    const sections = sectionIds

        .map((id) =>
            document.getElementById(id)
        )

        .filter(Boolean);


    if (!sections.length) {
        return;
    }


    const observer =
        new IntersectionObserver(
            (entries) => {

                /*
                 * Pilih section yang paling
                 * terlihat di viewport.
                 */

                const visibleSections =
                    entries
                        .filter(
                            (entry) =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );


                if (!visibleSections.length) {
                    return;
                }


                const activeId =
                    visibleSections[0]
                        .target
                        .id;


                setActiveNavigation(
                    activeId
                );

            },
            {
                root: null,

                rootMargin:
                    "-25% 0px -55% 0px",

                threshold: [
                    0,
                    0.25,
                    0.5,
                    0.75,
                    1
                ]

            }
        );


    sections.forEach(
        (section) => {

            observer.observe(section);

        }
    );


    /*
     * FALLBACK SCROLL CHECK
     *
     * Ini membantu ketika browser
     * memiliki perilaku IntersectionObserver
     * yang berbeda antara localhost dan production.
     */

    let scrollTimer = null;


    window.addEventListener(
        "scroll",
        () => {

            if (scrollTimer) {
                return;
            }


            scrollTimer =
                requestAnimationFrame(
                    () => {

                        updateNavigationByScroll();

                        scrollTimer = null;

                    }
                );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   SCROLL TO SECTION
========================================================= */

function scrollToSection(
    targetId
) {

    const target =
        document.getElementById(targetId);


    if (!target) {
        return;
    }


    const headerOffset =
        window.innerWidth <= 850
            ? 82
            : 90;


    const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;


    window.scrollTo({

        top: Math.max(
            0,
            targetPosition
        ),

        behavior: "smooth"

    });


    /*
     * Update URL tanpa reload.
     */

    try {

        history.pushState(
            null,
            "",
            `#${targetId}`
        );

    } catch (error) {

        console.warn(
            "History API tidak tersedia.",
            error
        );

    }


    setActiveNavigation(
        targetId
    );

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function setActiveNavigation(
    activeId
) {

    document
        .querySelectorAll("[data-nav]")
        .forEach((link) => {

            const isActive =
                link.dataset.nav === activeId;


            link.classList.toggle(
                "active",
                isActive
            );


            if (
                link.getAttribute("role") ===
                "tab"
            ) {

                link.setAttribute(
                    "aria-selected",
                    String(isActive)
                );

            }

        });

}


/* =========================================================
   NAVIGATION BY SCROLL
========================================================= */

function updateNavigationByScroll() {

    const sectionIds = [

        "beranda",
        "fitur",
        "tema",
        "harga",
        "faq"

    ];


    const offset =
        window.innerWidth <= 850
            ? 110
            : 120;


    let currentId =
        "beranda";


    sectionIds.forEach(
        (id) => {

            const section =
                document.getElementById(id);


            if (!section) {
                return;
            }


            const rect =
                section.getBoundingClientRect();


            if (
                rect.top <= offset &&
                rect.bottom > offset
            ) {

                currentId = id;

            }

        }
    );


    setActiveNavigation(
        currentId
    );

}


/* =========================================================
   INITIAL HASH
========================================================= */

function handleInitialHash() {

    const hash =
        window.location.hash;


    if (!hash) {
        return;
    }


    const targetId =
        hash.substring(1);


    const target =
        document.getElementById(targetId);


    if (!target) {
        return;
    }


    /*
     * Browser terkadang melakukan native
     * hash scrolling sebelum CSS/JS selesai.
     *
     * Kita koreksi setelah halaman siap.
     */

    window.setTimeout(
        () => {

            scrollToSection(
                targetId
            );

        },
        100
    );

}


/* =========================================================
   THEME TABS
========================================================= */

function initThemeTabs() {

    const mainTabs =
        document.querySelectorAll(
            ".theme-main-tab"
        );


    const subTabs =
        document.querySelectorAll(
            ".theme-sub-tab"
        );


    const subTabsContainer =
        document.getElementById(
            "themeSubTabs"
        );


    /*
     * MAIN CATEGORY
     */

    mainTabs.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.dataset.category;


                    if (!category) {
                        return;
                    }


                    state.category =
                        category;


                    /*
                     * Update active main tab
                     */

                    mainTabs.forEach(
                        (item) => {

                            const active =
                                item === button;


                            item.classList.toggle(
                                "active",
                                active
                            );


                            item.setAttribute(
                                "aria-selected",
                                String(active)
                            );

                        }
                    );


                    /*
                     * PERNIKAHAN
                     *
                     * Tampilkan sub tab.
                     */

                    if (
                        category ===
                        "pernikahan"
                    ) {

                        if (subTabsContainer) {

                            subTabsContainer.hidden =
                                false;

                            subTabsContainer
                                .setAttribute(
                                    "aria-hidden",
                                    "false"
                                );

                        }


                        state.package =
                            "all";


                        subTabs.forEach(
                            (item) => {

                                const active =
                                    item.dataset.package ===
                                    "all";


                                item.classList.toggle(
                                    "active",
                                    active
                                );


                                item.setAttribute(
                                    "aria-selected",
                                    String(active)
                                );

                            }
                        );

                    }


                    /*
                     * ACARA LAIN
                     * CETAK
                     *
                     * Sembunyikan sub tab.
                     */

                    else {

                        if (subTabsContainer) {

                            subTabsContainer.hidden =
                                true;

                            subTabsContainer
                                .setAttribute(
                                    "aria-hidden",
                                    "true"
                                );

                        }


                        state.package =
                            "all";

                    }


                    renderThemes();

                }
            );

        }
    );


    /*
     * SUB CATEGORY
     */

    subTabs.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const packageName =
                        button.dataset.package;


                    if (!packageName) {
                        return;
                    }


                    state.package =
                        packageName;


                    subTabs.forEach(
                        (item) => {

                            const active =
                                item === button;


                            item.classList.toggle(
                                "active",
                                active
                            );


                            item.setAttribute(
                                "aria-selected",
                                String(active)
                            );

                        }
                    );


                    renderThemes();

                }
            );

        }
    );

}


/* =========================================================
   RENDER THEMES
========================================================= */

function renderThemes() {

    const grid =
        document.getElementById(
            "themeGrid"
        );


    const empty =
        document.getElementById(
            "themeEmpty"
        );


    if (!grid) {
        return;
    }


    let filtered =
        themeData.filter(
            (theme) =>
                theme.category ===
                state.category
        );


    /*
     * Filter package hanya untuk
     * kategori pernikahan.
     */

    if (
        state.category ===
        "pernikahan" &&
        state.package !== "all"
    ) {

        filtered =
            filtered.filter(
                (theme) =>
                    theme.package ===
                    state.package
            );

    }


    grid.innerHTML = "";


    if (!filtered.length) {

        if (empty) {
            empty.hidden = false;
        }

        return;

    }


    if (empty) {
        empty.hidden = true;
    }


    const fragment =
        document.createDocumentFragment();


    filtered.forEach(
        (theme) => {

            fragment.appendChild(
                createThemeCard(theme)
            );

        }
    );


    grid.appendChild(
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
        document.createElement("article");


    article.className =
        "theme-card";


    const imageWrap =
        document.createElement("div");


    imageWrap.className =
        "theme-image-wrap";


    const image =
        document.createElement("img");


    image.className =
        "theme-image";


    image.src =
        theme.image || "";


    image.alt =
        `${theme.name} — IK-Pro.My.Id`;


    image.loading =
        "lazy";


    image.addEventListener(
        "error",
        () => {

            imageWrap.classList.add(
                "image-error"
            );

            image.removeAttribute(
                "src"
            );

        }
    );


    imageWrap.appendChild(
        image
    );


    if (theme.package) {

        const packageBadge =
            document.createElement("span");


        packageBadge.className =
            "theme-package";


        packageBadge.textContent =
            packageData[
                theme.package
            ]?.name ||
            theme.package;


        imageWrap.appendChild(
            packageBadge
        );

    }


    const content =
        document.createElement("div");


    content.className =
        "theme-content";


    const title =
        document.createElement("h3");


    title.textContent =
        theme.name;


    const price =
        document.createElement("div");


    price.className =
        "theme-price";


    if (
        theme.package &&
        packageData[theme.package]
    ) {

        price.textContent =
            formatRupiah(
                packageData[
                    theme.package
                ].price
            );

    } else {

        price.textContent =
            "Hubungi Kami";

    }


    const actions =
        document.createElement("div");


    actions.className =
        "theme-actions";


    /*
     * PREVIEW
     */

    const preview =
        document.createElement("a");


    preview.className =
        "theme-button theme-preview-button";


    preview.textContent =
        "Preview";


    const previewUrl =
        theme.preview || "#";


    if (previewUrl === "#") {

        preview.href =
            "#";

        preview.classList.add(
            "is-disabled"
        );

        preview.setAttribute(
            "aria-disabled",
            "true"
        );

        preview.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

            }
        );

    } else {

        preview.href =
            previewUrl;

        preview.target =
            "_self";

    }


    /*
     * ORDER
     */

    const order =
        document.createElement("a");


    order.className =
        "theme-button theme-order-button";


    order.textContent =
        "Order";


    const params =
        new URLSearchParams();


    if (theme.category) {

        params.set(
            "category",
            theme.category
        );

    }


    if (theme.package) {

        params.set(
            "package",
            theme.package
        );

    }


    if (theme.slug) {

        params.set(
            "theme",
            theme.slug
        );

    }


    order.href =
        `/register.html?${params.toString()}`;


    actions.appendChild(
        preview
    );

    actions.appendChild(
        order
    );


    content.appendChild(
        title
    );

    content.appendChild(
        price
    );

    content.appendChild(
        actions
    );


    article.appendChild(
        imageWrap
    );

    article.appendChild(
        content
    );


    return article;

}


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(
    number
) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


/* =========================================================
   FAQ
========================================================= */

function initFAQ() {

    const items =
        document.querySelectorAll(
            ".faq-item"
        );


    items.forEach(
        (item) => {

            item.addEventListener(
                "toggle",
                () => {

                    if (!item.open) {
                        return;
                    }


                    items.forEach(
                        (other) => {

                            if (
                                other !== item &&
                                other.open
                            ) {

                                other.open =
                                    false;

                            }

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   CURRENT YEAR
========================================================= */

function initCurrentYear() {

    const year =
        document.getElementById(
            "currentYear"
        );


    if (!year) {
        return;
    }


    year.textContent =
        new Date().getFullYear();

}


/* =========================================================
   PUBLIC API
========================================================= */

window.IKProLanding = {

    scrollToSection,

    setActiveNavigation,

    renderThemes,

    state,

    packageData

};