/* =========================================================
   IK-Pro.My.Id
   COMPONENTS
   ========================================================= */

import {
    supabaseClient
} from "./supabase.js";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initMobileMenu();
        initHeaderScroll();
        initCurrentYear();

        testSupabaseConnection();
    }
);


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {

    const menuToggle =
        document.querySelector("#menuToggle");

    const navMenu =
        document.querySelector("#navMenu");

    if (!menuToggle || !navMenu) {
        return;
    }

    menuToggle.addEventListener(
        "click",
        () => {

            const isOpen =
                navMenu.classList.toggle(
                    "is-open"
                );

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Tutup menu"
                    : "Buka menu"
            );
        }
    );


    const navLinks =
        navMenu.querySelectorAll(
            "a[href^='#']"
        );


    navLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    navMenu.classList.remove(
                        "is-open"
                    );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuToggle.setAttribute(
                        "aria-label",
                        "Buka menu"
                    );
                }
            );

        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth >= 768) {

                navMenu.classList.remove(
                    "is-open"
                );

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Buka menu"
                );
            }

        }
    );
}


/* =========================================================
   HEADER SCROLL
   ========================================================= */

function initHeaderScroll() {

    const header =
        document.querySelector(
            ".site-header"
        );

    if (!header) {
        return;
    }


    const updateHeader =
        () => {

            header.classList.toggle(
                "is-scrolled",
                window.scrollY > 10
            );

        };


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
   CURRENT YEAR
   ========================================================= */

function initCurrentYear() {

    const yearElement =
        document.querySelector(
            "#currentYear"
        );

    if (!yearElement) {
        return;
    }


    yearElement.textContent =
        new Date().getFullYear();
}


/* =========================================================
   SUPABASE CONNECTION TEST
   ========================================================= */

async function testSupabaseConnection() {

    try {

        const {
            error
        } = await supabaseClient
            .from("profiles")
            .select("id")
            .limit(1);


        if (error) {

            console.error(
                "Supabase connection test:",
                error
            );

            /*
             * Pada tahap ini tabel profiles
             * memang belum dibuat.
             *
             * Jadi error "relation does not exist"
             * masih NORMAL.
             */

            return;
        }


        console.log(
            "IK-Pro.My.Id: Supabase terhubung."
        );

    } catch (error) {

        console.error(
            "Supabase connection failed:",
            error
        );

    }
}