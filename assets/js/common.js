/* Shared helpers: theme toggle, active nav link, tab groups */
(function () {
  "use strict";
  const root = document.documentElement;
  try { const t = localStorage.getItem("gm-theme"); if (t) root.dataset.theme = t; } catch (e) {}

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".theme-btn");
    if (btn) {
      const label = () => {
        const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
        btn.textContent = dark ? "☀︎ Light" : "☾ Dark";
      };
      label();
      btn.addEventListener("click", () => {
        const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
        root.dataset.theme = dark ? "light" : "dark";
        try { localStorage.setItem("gm-theme", root.dataset.theme); } catch (e) {}
        label();
      });
    }

    // highlight the nav link of the section in view
    const links = [...document.querySelectorAll(".nav a[href^='#']")];
    const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { links.forEach(l => l.classList.remove("active")); const a = map.get(en.target.id); if (a) a.classList.add("active"); }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });

    // generic tab groups: <div class="tabs" data-tabs="name"><button data-tab="x"> + <div class="tab-panel" data-panel="name:x">
    document.querySelectorAll(".tabs[data-tabs]").forEach(group => {
      const name = group.dataset.tabs;
      group.addEventListener("click", e => {
        const b = e.target.closest("button[data-tab]"); if (!b) return;
        window.GM.showTab(name, b.dataset.tab);
      });
    });
  });

  window.GM = {
    showTab(name, key) {
      document.querySelectorAll(`.tabs[data-tabs="${name}"] button`).forEach(b => b.classList.toggle("on", b.dataset.tab === key));
      document.querySelectorAll(`.tab-panel[data-panel^="${name}:"]`).forEach(p => { p.hidden = p.dataset.panel !== `${name}:${key}`; });
    },
    svg(tag, attrs, inner = "") {
      return `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}>${inner}</${tag}>`;
    }
  };
})();
