// Counter Animation
const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
    const target = +counter.dataset.target;
    let count = 0;

    const updateCounter = () => {
        const increment = target / 100;

        if (count < target) {
            count += increment;
            counter.innerText = Math.floor(count);
            requestAnimationFrame(updateCounter);
        } else {
            if (target === 10000) {
                counter.innerText = "10.000+";
            } else if (target === 500) {
                counter.innerText = "500+";
            } else if (target === 50) {
                counter.innerText = "50+";
            } else if (target === 99) {
                counter.innerText = "99%";
            }
        }
    };

    updateCounter();
});

// Tema
const themes = [
    {
        id: 1,
        name: "Velvet Garden",
        category: "pernikahan",
        subcategory: "motion",
        image: "assets/images/theme/motion/Velvet-Garden.webp",
        price: 180000,
        oldPrice: 250000,
        badge: "🔥 New"
    },

    {
        id: 2,
        name: "Fairy Castle",
        category: "pernikahan",
        subcategory: "motion",
        image: "assets/images/theme/motion/Fairy-Castle.webp",
        price: 180000,
        oldPrice: 250000,
        badge: "🔥 New"
    },

    {
        id: 3,
        name: "Vintage Botanica",
        category: "pernikahan",
        subcategory: "motion",
        image: "assets/images/theme/motion/Vintage-Botanica.webp",
        price: 180000,
        oldPrice: 250000,
        badge: "👑 Best"
    },

    {
        id: 4,
        name: "Moonlit Cascade",
        category: "pernikahan",
        subcategory: "motion",
        image: "assets/images/theme/motion/Moonlit-Cascade.webp",
        price: 180000,
        oldPrice: 250000,
        badge: "👑 Best"
    },

    {
        id: 5,
        name: "Luxury-01",
        category: "pernikahan",
        subcategory: "luxury",
        image: "assets/images/theme/luxury/Luxury-06.jpg",
        price: 140000,
        oldPrice: 200000,
        badge: "👑 Best"
    },

    {
        id: 6,
        name: "Luxury-02",
        category: "pernikahan",
        subcategory: "luxury",
        image: "assets/images/theme/luxury/Luxury-05-New.webp",
        price: 140000,
        oldPrice: 200000,
        badge: "🔥 New"
    },
    {
        id: 7,
        name: "Luxury-03",
        category: "pernikahan",
        subcategory: "luxury",
        image: "assets/images/theme/luxury/Luxury-03-New.webp",
        price: 140000,
        oldPrice: 200000,
        badge: "🔥 New"
    },
    {
        id: 8,
        name: "Luxury-04",
        category: "pernikahan",
        subcategory: "luxury",
        image: "assets/images/theme/luxury/Luxury-04-New.webp",
        price: 140000,
        oldPrice: 200000,
        badge: "🔥 New"
    },
    {
        id: 9,
        name: "Premium-01",
        category: "pernikahan",
        subcategory: "premium",
        image: "assets/images/theme/premium/Flower-03-New.webp",
        price: 99000,
        oldPrice: 150000,
        badge: "🔥 New"
    },
    {
        id: 10,
        name: "Premium-02",
        category: "pernikahan",
        subcategory: "premium",
        image: "assets/images/theme/premium/Flower-04-New.webp",
        price: 99000,
        oldPrice: 150000,
        badge: "🔥 New"
    },
    {
        id: 11,
        name: "Premium-03",
        category: "pernikahan",
        subcategory: "premium",
        image: "assets/images/theme/premium/Flower-05-New.webp",
        price: 99000,
        oldPrice: 150000,
        badge: "🔥 New"
    },
    {
        id: 12,
        name: "Premium-04",
        category: "pernikahan",
        subcategory: "premium",
        image: "assets/images/theme/premium/Flower-06-New.webp",
        price: 99000,
        oldPrice: 150000,
        badge: "🔥 New"
    },
    {
        id: 13,
        name: "Basic-01",
        category: "pernikahan",
        subcategory: "basic",
        image: "assets/images/theme/basic/Floral-10.webp",
        price: 59000,
        oldPrice: 100000,
        badge: "🔥 New"
    },
    {
        id: 14,
        name: "Basic-02",
        category: "pernikahan",
        subcategory: "basic",
        image: "assets/images/theme/basic/Floral-11.webp",
        price: 59000,
        oldPrice: 100000,
        badge: "🔥 New"
    },
    {
        id: 15,
        name: "Basic-03",
        category: "pernikahan",
        subcategory: "basic",
        image: "assets/images/theme/basic/Premium-1.webp",
        price: 59000,
        oldPrice: 100000,
        badge: "🔥 New"
    },
    {
        id: 16,
        name: "Basic-04",
        category: "pernikahan",
        subcategory: "basic",
        image: "assets/images/theme/basic/Premium-2.webp",
        price: 59000,
        oldPrice: 100000,
        badge: "🔥 New"
    },
    {
        id: 17,
        name: "Ulang Tahun-01",
        category: "acara",
        subcategory: "basic",
        image: "assets/images/theme/acara/Birthday-1.webp",
        price: 59000,
        oldPrice: 100000,
        badge: "🔥 New"
    },
    {
        id: 18,
        name: "Khitanan-02",
        category: "acara",
        subcategory: "basic",
        image: "assets/images/theme/acara/Khitan-5.webp",
        price: 59000,
        oldPrice: 100000,
        badge: "🔥 New"
    },
    {
        id: 19,
        name: "Syukuran-03",
        category: "acara",
        subcategory: "basic",
        image: "assets/images/theme/acara/Birthday-1.webp",
        price: 59000,
        oldPrice: 100000,
        badge: "🔥 New"
    },
    {
        id: 20,
        name: "Aqiqah-04",
        category: "acara",
        subcategory: "basic",
        image: "assets/images/theme/acara/Aqiqah.webp",
        price: 59000,
        oldPrice: 100000,
        badge: "🔥 New"
    },
    {
        id: 21,
        name: "Cetak-01",
        category: "cetak",
        subcategory: "basic",
        image: "assets/images/theme/cetak/SE-000.jpg",
        price: 1000,
        oldPrice: 1500,
        badge: "🔥 New",
        url: "assets/images/theme/cetak/SE-000.jpg"
    },
    {
        id: 22,
        name: "Cetak-02",
        category: "cetak",
        subcategory: "basic",
        image: "assets/images/theme/cetak/SE-001.jpg",
        price: 1000,
        oldPrice: 1500,
        badge: "🔥 New",
        url: "assets/images/theme/cetak/SE-001.jpg"
    },
    {
        id: 23,
        name: "Cetak-03",
        category: "cetak",
        subcategory: "basic",
        image: "assets/images/theme/cetak/SE-002.jpg",
        price: 1000,
        oldPrice: 1500,
        badge: "🔥 New",
        url: "assets/images/theme/cetak/SE-002.jpg"
    },
    {
        id: 24,
        name: "Cetak-04",
        category: "cetak",
        subcategory: "basic",
        image: "assets/images/theme/cetak/SE-003.jpg",
        price: 1000,
        oldPrice: 1500,
        badge: "🔥 New",
        url: "assets/images/theme/cetak/SE-003.jpg"
    }
];

// ==========================================
// STATE
// ==========================================

let currentCategory = "pernikahan";
let currentSub = "all";

// ==========================================
// ELEMENT
// ==========================================

const themeGrid = document.getElementById("tema-view");
const subcategoryWrapper = document.getElementById("sub-kategori");

const mainButtons = document.querySelectorAll(".mainBtn");
const subButtons = document.querySelectorAll(".subBtn");

// ==========================================
// UPDATE JUMLAH TEMA
// ==========================================

function updateCount() {
    document.getElementById("count-pernikahan").textContent = themes.filter(
        item => item.category === "pernikahan"
    ).length;

    document.getElementById("count-acara").textContent = themes.filter(
        item => item.category === "acara"
    ).length;

    document.getElementById("count-cetak").textContent = themes.filter(
        item => item.category === "cetak"
    ).length;
}

// ==========================================
// RESET SUBKATEGORI
// ==========================================

function resetSubcategory() {
    currentSub = "all";

    subButtons.forEach(button => {
        button.classList.remove("active");
    });

    const allButton = document.querySelector('.subBtn[data-subcategory="all"]');

    if (allButton) {
        allButton.classList.add("active");
    }
}

// ==========================================
// TAMPILKAN / SEMBUNYIKAN SUBKATEGORI
// ==========================================

function updateSubcategoryVisibility() {
    if (currentCategory === "pernikahan") {
        subcategoryWrapper.classList.remove("hidden");
    } else {
        subcategoryWrapper.classList.add("hidden");
    }
}

// ==========================================
// RENDER TEMA
// ==========================================

function renderThemes() {
    const filtered = themes.filter(item => {
        // Filter kategori utama
        const categoryMatch = item.category === currentCategory;

        // Default subkategori = cocok
        let subMatch = true;

        // Subkategori hanya digunakan
        // untuk kategori pernikahan
        if (currentCategory === "pernikahan") {
            subMatch = currentSub === "all" || item.subcategory === currentSub;
        }

        return categoryMatch && subMatch;
    });

    // Jika tidak ada tema
    if (filtered.length === 0) {
        themeGrid.innerHTML = `
            <div class="empty-theme">
                <p>Belum ada tema tersedia.</p>
            </div>
        `;

        return;
    }

    // Render tema
    themeGrid.innerHTML = filtered
        .map(item => {
            return `
                <div class="theme-card">

                    <div class="theme-image">

                        <img
                            src="${item.image}"
                            alt="${item.name}"
                            loading="lazy"
                        >

                        <div class="badge">
                            ${item.badge}
                        </div>

                    </div>


                    <div class="theme-content">

                        <h3>${item.name}</h3>

                        <div class="old-price">
                            Rp ${item.oldPrice.toLocaleString("id-ID")}
                        </div>

                        <div class="price">
                            Rp ${item.price.toLocaleString("id-ID")}
                        </div>


                        <div class="theme-actions">

                            <a
                                href="${item.url}"
                                class="preview-btn"
                            >
                                Preview
                            <i class="bi bi-eye"></i></a>

                            <a
                                href="#"
                                class="order-btn"
                            >
                                Order
                            <i class="bi bi-cart"></i></a>

                        </div>

                    </div>

                </div>
            `;
        })
        .join("");
}

// ==========================================
// KLIK KATEGORI UTAMA
// ==========================================

mainButtons.forEach(button => {
    button.addEventListener("click", () => {
        // ==============================
        // ACTIVE BUTTON
        // ==============================

        mainButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        // ==============================
        // AMBIL KATEGORI
        // ==============================

        currentCategory = button.dataset.category;

        // ==============================
        // RESET SUBKATEGORI
        // ==============================

        resetSubcategory();

        // ==============================
        // TAMPILKAN SUBKATEGORI
        // ==============================

        updateSubcategoryVisibility();

        // ==============================
        // RENDER ULANG
        // ==============================

        renderThemes();
    });
});

// ==========================================
// KLIK SUBKATEGORI
// ==========================================

subButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Subkategori hanya berlaku
        // untuk Pernikahan
        if (currentCategory !== "pernikahan") {
            return;
        }

        // ==============================
        // ACTIVE SUB BUTTON
        // ==============================

        subButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        // ==============================
        // SIMPAN SUBKATEGORI
        // ==============================

        currentSub = button.dataset.subcategory;

        // ==============================
        // RENDER ULANG
        // ==============================

        renderThemes();
    });
});

// ==========================================
// INITIAL STATE
// ==========================================

updateCount();

resetSubcategory();

updateSubcategoryVisibility();

renderThemes();

// Cara Order
const accordionBtns = document.querySelectorAll(".accordion-btn");

accordionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector(".icon");

        btn.classList.toggle("active");
        content.classList.toggle("show");

        icon.textContent = content.classList.contains("show") ? "−" : "+";
    });
});


// FAQ
const faqBtns = document.querySelectorAll(".faq-btn");

faqBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector(".icon");

        btn.classList.toggle("active");
        content.classList.toggle("show");

        icon.textContent = content.classList.contains("show")
            ? "−"
            : "+";
    });
});