
const sidebar = document.getElementById("dashboardSidebar");
const toggle = document.getElementById("sidebarToggle");
const overlay = document.getElementById("sidebarOverlay");

if (sidebar && toggle && overlay) {
  const mobileQuery = window.matchMedia("(max-width: 1024px)");
  const links = [...sidebar.querySelectorAll("[data-section]")];

  function setOpen(open) {
    if (!mobileQuery.matches) {
      sidebar.classList.remove("is-open");
      overlay.hidden = true;
      document.body.style.overflow = "";
      toggle.setAttribute("aria-expanded", "false");
      return;
    }

    sidebar.classList.toggle("is-open", open);
    overlay.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Tutup menu navigasi" : "Buka menu navigasi"
    );
  }

  toggle.addEventListener("click", () => {
    setOpen(!sidebar.classList.contains("is-open"));
  });

  overlay.addEventListener("click", () => setOpen(false));

  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileQuery.matches) setOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  mobileQuery.addEventListener("change", () => setOpen(false));

  function updateActiveLink() {
    const sections = links
      .map((link) => ({
        link,
        section: document.getElementById(link.dataset.section)
      }))
      .filter((item) => item.section);

    if (!sections.length) return;

    let current = sections[0];
    const marker = window.scrollY + 150;

    for (const item of sections) {
      if (item.section.getBoundingClientRect().top + window.scrollY <= marker) {
        current = item;
      }
    }

    links.forEach((link) => {
      const active = link === current.link;
      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("hashchange", updateActiveLink);
  updateActiveLink();
}
