(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  $$("svg.wave").forEach((svg) => {
    const W = 2880;
    const H = svg.viewBox.baseVal.height || 160;
    const amp = +svg.dataset.amp || 12;
    const wl = +svg.dataset.wl || 720;
    const ph = +svg.dataset.phase || 0;
    const base = +svg.dataset.base || 30;
    let d = `M0 ${H} L0 ${(base + amp * Math.sin(ph)).toFixed(1)}`;
    for (let x = 16; x <= W; x += 16) d += ` L${x} ${(base + amp * Math.sin((x / wl) * 2 * Math.PI + ph)).toFixed(1)}`;
    d += ` L${W} ${H} Z`;
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", svg.dataset.fill || "#fff");
    svg.appendChild(p);
    svg.style.setProperty("--dur", `${svg.dataset.speed || 32}s`);
  });

  let idx = 0;
  $$(".split").forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    el.setAttribute("aria-hidden", "true");
    text.split(" ").forEach((word, w, arr) => {
      const wEl = document.createElement("span");
      wEl.className = "w";
      [...word].forEach((ch) => {
        const s = document.createElement("span");
        s.textContent = ch;
        s.style.setProperty("--i", idx++);
        wEl.appendChild(s);
      });
      el.appendChild(wEl);
      if (w < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });

  $$("[data-marquee]").forEach((t) => {
    t.innerHTML += t.innerHTML;
  });

  const btn = $("#menuBtn");
  const menu = $("#mobileMenu");
  const setMenu = (open) => {
    if (!menu || !btn) return;
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    const icon = $("i", btn);
    if (icon) icon.className = open ? "bi bi-x-lg text-2xl" : "bi bi-list text-2xl";
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const firstLink = $("a", menu);
      if (firstLink) firstLink.focus();
      menu.setAttribute("aria-hidden", "false");
      const main = document.getElementById("main");
      if (main) main.setAttribute("inert", "");
    } else {
      menu.setAttribute("aria-hidden", "true");
      const main = document.getElementById("main");
      if (main) main.removeAttribute("inert");
    }
  };
  if (btn && menu) {
    btn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        setMenu(false);
        btn.focus();
      }
    });
    const mq = matchMedia("(min-width:768px)");
    if (mq.addEventListener) mq.addEventListener("change", (e) => { if (e.matches) setMenu(false); });
    else mq.addListener((e) => { if (e.matches) setMenu(false); });
  }

  const links = $$("[data-nav]");
  const sections = ["about", "skills", "work", "journey"].map((id) => document.getElementById(id));
  if ("IntersectionObserver" in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === `#${e.target.id}` ? "location" : "false"));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => s && navIO.observe(s));
    const heroEl = $("#hero");
    if (heroEl) {
      const heroIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.setAttribute("aria-current", "false")); }), { rootMargin: "-45% 0px -50% 0px" });
      heroIO.observe(heroEl);
    }
  }

  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, o) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); o.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  const hero = $("#hero");
  if (hero && !reduce && matchMedia("(pointer:fine)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { hero.style.setProperty("--mx", 0); hero.style.setProperty("--my", 0); });
  }

  const jw = $("#journeyWrap");
  const boat = $("#boat");
  if (jw && boat) {
    if (reduce) {
      boat.style.display = "none";
    } else {
      let ticking = false;
      const update = () => {
        const r = jw.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.55 - r.top) / r.height));
        jw.style.setProperty("--p", p.toFixed(4));
        ticking = false;
      };
      addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      addEventListener("resize", update);
      update();
    }
  }

  const toast = $("#toast");
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  };
  const copyBtn = $("#copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email || "hello@example.com";
      try {
        await navigator.clipboard.writeText(email);
        showToast("Email copied to clipboard");
      } catch (err) {
        const ta = document.createElement("textarea");
        ta.value = email; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); showToast("Email copied to clipboard"); }
        catch (e) { showToast(email); }
        ta.remove();
      }
      const icon = $("i", copyBtn);
      const label = $("span", copyBtn);
      if (icon) icon.className = "bi bi-clipboard-check";
      if (label) label.textContent = "Copied";
      setTimeout(() => { if (icon) icon.className = "bi bi-clipboard"; if (label) label.textContent = "Copy email"; }, 2000);
    });
  }
})();
