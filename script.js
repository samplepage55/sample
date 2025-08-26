(function () {
  const storageKey = "preferred-theme";
  const html = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");

  // Initialize current year
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  // Theme init from storage or system
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") {
      html.setAttribute("data-theme", saved);
      updateIcon(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = prefersDark ? "dark" : "light";
      html.setAttribute("data-theme", theme);
      updateIcon(theme);
    }
  } catch (e) {
    // ignore
  }

  // Toggle handler
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      updateIcon(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch (e) {}
    });
  }

  function updateIcon(theme) {
    if (!toggleBtn) return;
    toggleBtn.textContent = theme === "dark" ? "🌞" : "🌙";
    toggleBtn.setAttribute("aria-label", theme === "dark" ? "تبديل إلى الوضع الفاتح" : "تبديل إلى الوضع الداكن");
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const el = document.querySelector(targetId);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", targetId);
    });
  });
})();