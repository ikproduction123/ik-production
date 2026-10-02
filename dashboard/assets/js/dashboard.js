/* =========================================================
   IK-PRO.MY.ID
   DASHBOARD JAVASCRIPT
========================================================= */


/* =========================================================
   GLOBAL
========================================================= */

let currentUser = null;

let currentProfile = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initializeYear();

        initializeSidebar();

        initializeUserMenu();

        initializeNotifications();

        initializeNavigation();

        initializeLogout();

        await initializeDashboard();
    }
);


/* =========================================================
   GET SUPABASE CLIENT
========================================================= */

function getSupabaseClient() {

    if (!window.supabaseClient) {

        console.error(
            "Supabase client tidak ditemukan."
        );

        showToast(
            "Supabase belum berhasil dimuat.",
            "error"
        );

        return null;
    }

    return window.supabaseClient;
}


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

async function initializeDashboard() {

    try {

        const client =
            getSupabaseClient();

        if (!client) {
            return;
        }


        /* =========================================
           CHECK USER
        ========================================== */

        const {
            data,
            error
        } =
            await client.auth.getUser();


        if (error) {

            console.error(
                "Gagal mendapatkan user:",
                error
            );

            redirectToLogin();

            return;
        }


        if (
            !data ||
            !data.user
        ) {

            redirectToLogin();

            return;
        }


        /* =========================================
           SAVE USER
        ========================================== */

        currentUser =
            data.user;


        console.log(
            "User login:",
            currentUser
        );


        /* =========================================
           LOAD PROFILE
        ========================================== */

        await loadUserProfile();


        /* =========================================
           UPDATE UI
        ========================================== */

        updateUserUI();


        /* =========================================
           LOAD DATA
        ========================================== */

        await Promise.all([

            loadInvitationStatistics(),

            loadRecentInvitations(),

            loadRecentTransactions(),

            loadNotificationCount()

        ]);


    } catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

        showToast(
            "Terjadi kesalahan saat memuat dashboard.",
            "error"
        );
    }
}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadUserProfile() {

    if (!currentUser) {
        return;
    }

    const client =
        getSupabaseClient();

    if (!client) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await client
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Gagal mengambil profile:",
                error
            );

            return;
        }


        currentProfile =
            data;


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );
    }
}


/* =========================================================
   UPDATE USER UI
========================================================= */

function updateUserUI() {

    if (!currentUser) {
        return;
    }


    const name =

        currentProfile?.name ||

        currentUser
            .user_metadata
            ?.full_name ||

        currentUser
            .user_metadata
            ?.name ||

        currentUser
            .email
            ?.split("@")[0] ||

        "Pengguna";


    const email =
        currentUser.email ||
        "-";


    const initial =
        getInitial(name);


    /* =========================================
       TOPBAR
    ========================================== */

    setText(
        "userName",
        name
    );

    setText(
        "userEmail",
        email
    );

    setText(
        "userInitial",
        initial
    );


    /* =========================================
       WELCOME
    ========================================== */

    setText(
        "welcomeName",
        name
    );


    /* =========================================
       DROPDOWN
    ========================================== */

    setText(
        "dropdownName",
        name
    );

    setText(
        "dropdownEmail",
        email
    );

    setText(
        "dropdownInitial",
        initial
    );
}


/* =========================================================
   YEAR
========================================================= */

function initializeYear() {

    const element =
        document.getElementById(
            "currentYear"
        );

    if (element) {

        element.textContent =
            new Date().getFullYear();
    }
}


/* =========================================================
   SIDEBAR
========================================================= */

function initializeSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    const sidebarClose =
        document.getElementById(
            "sidebarClose"
        );


    if (!sidebar) {
        return;
    }


    /* =========================================
       OPEN
    ========================================== */

    menuToggle?.addEventListener(
        "click",
        () => {

            sidebar.classList.add(
                "active"
            );

            overlay?.classList.add(
                "active"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    );


    /* =========================================
       CLOSE
    ========================================== */

    function closeSidebar() {

        sidebar.classList.remove(
            "active"
        );

        overlay?.classList.remove(
            "active"
        );

        menuToggle?.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );

    overlay?.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(
            ".sidebar .nav-link"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                closeSidebar
            );
        });
}


/* =========================================================
   USER MENU
========================================================= */

function initializeUserMenu() {

    const userMenu =
        document.getElementById(
            "userMenu"
        );

    const dropdown =
        document.getElementById(
            "userDropdown"
        );


    if (
        !userMenu ||
        !dropdown
    ) {
        return;
    }


    userMenu.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isHidden =
                dropdown.hasAttribute(
                    "hidden"
                );


            closeNotificationPanel();


            if (isHidden) {

                dropdown.removeAttribute(
                    "hidden"
                );

            } else {

                dropdown.setAttribute(
                    "hidden",
                    ""
                );
            }
        }
    );


    dropdown.addEventListener(
        "click",
        event => {

            event.stopPropagation();
        }
    );


    document.addEventListener(
        "click",
        () => {

            closeUserDropdown();

        }
    );
}


/* =========================================================
   NOTIFICATION
========================================================= */

function initializeNotifications() {

    const button =
        document.getElementById(
            "notificationButton"
        );

    const panel =
        document.getElementById(
            "notificationPanel"
        );

    const closeButton =
        document.getElementById(
            "closeNotification"
        );


    if (
        !button ||
        !panel
    ) {
        return;
    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isHidden =
                panel.hasAttribute(
                    "hidden"
                );


            closeUserDropdown();


            if (isHidden) {

                panel.removeAttribute(
                    "hidden"
                );

            } else {

                panel.setAttribute(
                    "hidden",
                    ""
                );
            }
        }
    );


    closeButton?.addEventListener(
        "click",
        closeNotificationPanel
    );


    panel.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );


    document.addEventListener(
        "click",
        () => {

            closeNotificationPanel();

        }
    );
}


/* =========================================================
   CLOSE USER DROPDOWN
========================================================= */

function closeUserDropdown() {

    document
        .getElementById(
            "userDropdown"
        )
        ?.setAttribute(
            "hidden",
            ""
        );
}


/* =========================================================
   CLOSE NOTIFICATION
========================================================= */

function closeNotificationPanel() {

    document
        .getElementById(
            "notificationPanel"
        )
        ?.setAttribute(
            "hidden",
            ""
        );
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(element => {

            element.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const page =
                        element.dataset.page;

                    if (!page) {
                        return;
                    }

                    handleNavigation(page);
                }
            );
        });
}


/* =========================================================
   HANDLE NAVIGATION
========================================================= */

function handleNavigation(page) {

    const pages = {

        invitations:
            "invitations/index.html",

        "create-invitation":
            "create/index.html",

        guests:
            "guests/index.html",

        rsvp:
            "rsvp/index.html",

        wishes:
            "wishes/index.html",

        transactions:
            "transactions/index.html",

        profile:
            "profile/index.html",

        settings:
            "settings/index.html"
    };


    const target =
        pages[page];


    if (!target) {

        showToast(
            "Halaman belum tersedia.",
            "info"
        );

        return;
    }


    window.location.href =
        target;
}


/* =========================================================
   INVITATION STATISTICS
========================================================= */

async function loadInvitationStatistics() {

    if (!currentUser) {
        return;
    }


    const client =
        getSupabaseClient();

    if (!client) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await client
                .from("invitations")
                .select(
                    "id,status"
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {

            console.error(
                "Gagal mengambil statistik:",
                error
            );

            return;
        }


        const invitations =
            data || [];


        const total =
            invitations.length;


        const published =
            invitations.filter(
                invitation =>
                    invitation.status ===
                    "published"
            ).length;


        const draft =
            invitations.filter(
                invitation =>
                    invitation.status ===
                    "draft"
            ).length;


        setText(
            "totalInvitations",
            total
        );

        setText(
            "publishedInvitations",
            published
        );

        setText(
            "draftInvitations",
            draft
        );


    } catch (error) {

        console.error(
            "Invitation statistics error:",
            error
        );
    }
}


/* =========================================================
   RECENT INVITATIONS
========================================================= */

async function loadRecentInvitations() {

    const loading =
        document.getElementById(
            "invitationLoading"
        );

    const empty =
        document.getElementById(
            "invitationEmpty"
        );

    const list =
        document.getElementById(
            "invitationList"
        );


    if (
        !list ||
        !currentUser
    ) {
        return;
    }


    const client =
        getSupabaseClient();

    if (!client) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await client
                .from("invitations")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5);


        if (error) {

            console.error(
                "Gagal mengambil undangan:",
                error
            );

            loading?.setAttribute(
                "hidden",
                ""
            );

            return;
        }


        loading?.setAttribute(
            "hidden",
            ""
        );


        const invitations =
            data || [];


        if (
            invitations.length === 0
        ) {

            empty?.removeAttribute(
                "hidden"
            );

            return;
        }


        empty?.setAttribute(
            "hidden",
            ""
        );


        invitations.forEach(
            invitation => {

                const element =
                    createInvitationElement(
                        invitation
                    );

                list.appendChild(
                    element
                );
            }
        );


    } catch (error) {

        console.error(
            "Recent invitations error:",
            error
        );

        loading?.setAttribute(
            "hidden",
            ""
        );
    }
}


/* =========================================================
   CREATE INVITATION ELEMENT
========================================================= */

function createInvitationElement(
    invitation
) {

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "invitation-item";


    /* =========================================
       COVER
    ========================================== */

    const cover =
        document.createElement(
            "div"
        );

    cover.className =
        "invitation-cover";


    if (
        invitation.cover_url
    ) {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            invitation.cover_url;

        image.alt =
            invitation.title ||
            "Cover undangan";

        cover.appendChild(
            image
        );

    } else {

        const icon =
            document.createElement(
                "i"
            );

        icon.className =
            "fa-regular fa-envelope";

        cover.appendChild(
            icon
        );
    }


    /* =========================================
       INFO
    ========================================== */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "invitation-info";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =

        invitation.title ||

        invitation.name ||

        invitation.slug ||

        "Undangan Tanpa Judul";


    const slug =
        document.createElement(
            "p"
        );


    slug.textContent =
        invitation.slug
            ? `/${invitation.slug}/`
            : "Belum memiliki slug";


    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "invitation-meta";


    const status =
        document.createElement(
            "span"
        );


    const statusValue =
        invitation.status ||
        "draft";


    status.className =
        `status-badge status-${statusValue}`;


    status.textContent =
        getStatusLabel(
            statusValue
        );


    meta.appendChild(
        status
    );

    info.appendChild(
        title
    );

    info.appendChild(
        slug
    );

    info.appendChild(
        meta
    );


    /* =========================================
       ACTIONS
    ========================================== */

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "invitation-actions";


    /* =========================================
       VIEW
    ========================================== */

    if (
        statusValue ===
        "published"
    ) {

        const viewButton =
            createIconButton(
                "fa-eye",
                "Lihat Undangan"
            );


        viewButton.addEventListener(
            "click",
            () => {

                openInvitation(
                    invitation
                );
            }
        );


        actions.appendChild(
            viewButton
        );
    }


    /* =========================================
       EDIT
    ========================================== */

    const editButton =
        createIconButton(
            "fa-pen",
            "Edit Undangan"
        );


    editButton.addEventListener(
        "click",
        () => {

            if (!invitation.id) {

                showToast(
                    "ID undangan tidak ditemukan.",
                    "error"
                );

                return;
            }


            window.location.href =
                `../dashboard/edit/?id=${encodeURIComponent(
                    invitation.id
                )}`;
        }
    );


    actions.appendChild(
        editButton
    );


    article.appendChild(
        cover
    );

    article.appendChild(
        info
    );

    article.appendChild(
        actions
    );


    return article;
}


/* =========================================================
   ICON BUTTON
========================================================= */

function createIconButton(
    icon,
    label
) {

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "icon-button";

    button.title =
        label;

    button.setAttribute(
        "aria-label",
        label
    );


    const iconElement =
        document.createElement(
            "i"
        );

    iconElement.className =
        `fa-solid fa-${icon}`;


    button.appendChild(
        iconElement
    );


    return button;
}


/* =========================================================
   OPEN INVITATION
========================================================= */

function openInvitation(
    invitation
) {

    if (
        !invitation?.slug
    ) {

        showToast(
            "Slug undangan belum tersedia.",
            "warning"
        );

        return;
    }


    window.open(
        `../${encodeURIComponent(
            invitation.slug
        )}/`,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(
    status
) {

    const labels = {

        published:
            "Aktif",

        draft:
            "Draft",

        expired:
            "Expired",

        pending:
            "Menunggu",

        approved:
            "Disetujui",

        rejected:
            "Ditolak"
    };


    return (
        labels[status] ||
        status
    );
}


/* =========================================================
   RECENT TRANSACTIONS
========================================================= */

async function loadRecentTransactions() {

    const loading =
        document.getElementById(
            "transactionLoading"
        );

    const empty =
        document.getElementById(
            "transactionEmpty"
        );

    const list =
        document.getElementById(
            "transactionList"
        );


    if (
        !list ||
        !currentUser
    ) {
        return;
    }


    const client =
        getSupabaseClient();

    if (!client) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await client
                .from("transactions")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5);


        if (error) {

            console.error(
                "Gagal mengambil transaksi:",
                error
            );

            loading?.setAttribute(
                "hidden",
                ""
            );

            return;
        }


        loading?.setAttribute(
            "hidden",
            ""
        );


        const transactions =
            data || [];


        if (
            transactions.length === 0
        ) {

            empty?.removeAttribute(
                "hidden"
            );

            setText(
                "totalTransactions",
                "0"
            );

            return;
        }


        empty?.setAttribute(
            "hidden",
            ""
        );


        transactions.forEach(
            transaction => {

                const element =
                    createTransactionElement(
                        transaction
                    );

                list.appendChild(
                    element
                );
            }
        );


        /*
         * Sementara menampilkan jumlah
         * transaksi yang berhasil diambil.
         */

        setText(
            "totalTransactions",
            transactions.length
        );


    } catch (error) {

        console.error(
            "Transaction error:",
            error
        );

        loading?.setAttribute(
            "hidden",
            ""
        );
    }
}


/* =========================================================
   CREATE TRANSACTION ELEMENT
========================================================= */

function createTransactionElement(
    transaction
) {

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "transaction-item";


    /* =========================================
       ICON
    ========================================== */

    const iconWrapper =
        document.createElement(
            "div"
        );

    iconWrapper.className =
        "transaction-icon";


    const icon =
        document.createElement(
            "i"
        );

    icon.className =
        "fa-solid fa-receipt";


    iconWrapper.appendChild(
        icon
    );


    /* =========================================
       INFO
    ========================================== */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "transaction-info";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =

        transaction.description ||

        transaction.invoice_number ||

        "Transaksi Undangan";


    const date =
        document.createElement(
            "p"
        );


    date.textContent =
        formatDate(
            transaction.created_at
        );


    info.appendChild(
        title
    );

    info.appendChild(
        date
    );


    /* =========================================
       AMOUNT
    ========================================== */

    const amount =
        document.createElement(
            "div"
        );

    amount.className =
        "transaction-amount";


    amount.textContent =
        formatCurrency(
            transaction.amount ||
            transaction.total ||
            0
        );


    /* =========================================
       STATUS
    ========================================== */

    const status =
        document.createElement(
            "span"
        );


    const statusValue =
        transaction.status ||
        "pending";


    status.className =
        `status-badge status-${statusValue}`;


    status.textContent =
        getStatusLabel(
            statusValue
        );


    /* =========================================
       APPEND
    ========================================== */

    article.appendChild(
        iconWrapper
    );

    article.appendChild(
        info
    );

    article.appendChild(
        status
    );

    article.appendChild(
        amount
    );


    return article;
}


/* =========================================================
   NOTIFICATION COUNT
========================================================= */

async function loadNotificationCount() {

    setText(
        "notificationBadge",
        "0"
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const dropdownLogout =
        document.getElementById(
            "dropdownLogout"
        );


    logoutButton?.addEventListener(
        "click",
        handleLogout
    );

    dropdownLogout?.addEventListener(
        "click",
        handleLogout
    );
}


/* =========================================================
   HANDLE LOGOUT
========================================================= */

async function handleLogout() {

    const client =
        getSupabaseClient();

    if (!client) {
        return;
    }


    try {

        const confirmed =
            window.confirm(
                "Apakah Anda yakin ingin keluar?"
            );


        if (!confirmed) {
            return;
        }


        const {
            error
        } =
            await client.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            showToast(
                "Gagal keluar dari akun.",
                "error"
            );

            return;
        }


        window.location.href =
            "../login.html";


    } catch (error) {

        console.error(
            "Logout exception:",
            error
        );

        showToast(
            "Terjadi kesalahan saat keluar.",
            "error"
        );
    }
}


/* =========================================================
   REDIRECT LOGIN
========================================================= */

function redirectToLogin() {

    window.location.href =
        "../login.html";
}


/* =========================================================
   TEXT HELPER
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ?? "";
    }
}


/* =========================================================
   INITIAL HELPER
========================================================= */

function getInitial(
    name
) {

    if (!name) {
        return "U";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    date
) {

    if (!date) {
        return "-";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "-";
    }


    return parsed.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   CURRENCY FORMAT
========================================================= */

function formatCurrency(
    value
) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "Rp 0";
    }


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
   TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) {
        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    /* =========================================
       ICON
    ========================================== */

    const icon =
        document.createElement(
            "i"
        );


    const icons = {

        success:
            "fa-circle-check",

        error:
            "fa-circle-xmark",

        warning:
            "fa-triangle-exclamation",

        info:
            "fa-circle-info"
    };


    icon.className =
        `fa-solid ${
            icons[type] ||
            icons.info
        } toast-icon`;


    /* =========================================
       MESSAGE
    ========================================== */

    const textElement =
        document.createElement(
            "div"
        );


    textElement.className =
        "toast-message";


    textElement.textContent =
        message;


    /* =========================================
       CLOSE
    ========================================== */

    const close =
        document.createElement(
            "button"
        );


    close.type =
        "button";

    close.className =
        "toast-close";


    close.setAttribute(
        "aria-label",
        "Tutup"
    );


    close.innerHTML =
        '<i class="fa-solid fa-xmark"></i>';


    close.addEventListener(
        "click",
        () => {

            toast.remove();

        }
    );


    /* =========================================
       APPEND
    ========================================== */

    toast.appendChild(
        icon
    );

    toast.appendChild(
        textElement
    );

    toast.appendChild(
        close
    );


    container.appendChild(
        toast
    );


    /* =========================================
       AUTO REMOVE
    ========================================== */

    setTimeout(
        () => {

            toast.remove();

        },
        4000
    );
}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

if (window.supabaseClient) {

    window.supabaseClient.auth
        .onAuthStateChange(
            (event, session) => {

                console.log(
                    "Auth event:",
                    event
                );


                if (
                    event ===
                    "SIGNED_OUT"
                ) {

                    window.location.href =
                        "../login.html";
                }
            }
        );
}