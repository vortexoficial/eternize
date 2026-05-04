// ─── Logo loader ─────────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  const svg   = loader.querySelector(".loader-logo");
  const paths = Array.from(svg.querySelectorAll("path"));

  // Timing constants (all in ms)
  const DRAW_DUR  = 680;   // duration of each path stroke draw
  const STAGGER   = 62;    // delay between consecutive paths
  const GAP       = 180;   // pause between draw-end and fill-start
  const FILL_DUR  = 360;   // duration of each path fill
  const FILL_STAG = 30;    // delay between consecutive fills
  const HIDE_GAP  = 260;   // pause after last fill before fade
  const FADE_DUR  = 520;   // loader fade-out duration

  // Step 1 — measure paths and lock initial visual state (all invisible)
  const lengths = paths.map((path) => {
    const len = path.getTotalLength() || 3000;
    const color = path.dataset.color || "#ffffff";

    path.style.fill             = "transparent";
    path.style.stroke           = color;
    path.style.strokeWidth      = "28";
    path.style.strokeLinecap    = "round";
    path.style.strokeLinejoin   = "round";
    // Start fully hidden: dashoffset == total length
    path.style.strokeDasharray  = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    return len;
  });

  // Step 2 — draw outlines one by one (Web Animations API — no CSS transition tricks)
  paths.forEach((path, i) => {
    path.animate(
      [
        { strokeDashoffset: `${lengths[i]}` },
        { strokeDashoffset: "0"             },
      ],
      {
        duration: DRAW_DUR,
        delay:    i * STAGGER,
        easing:   "cubic-bezier(0.4, 0, 0.2, 1)",
        fill:     "forwards",
      }
    );
  });

  // Step 3 — flood fill each path with its color (stroke fades out simultaneously)
  const fillStart = (paths.length - 1) * STAGGER + DRAW_DUR + GAP;

  paths.forEach((path, i) => {
    const color = path.dataset.color || "#ffffff";
    path.animate(
      [
        { fill: "transparent", strokeOpacity: "1" },
        { fill: color,         strokeOpacity: "0" },
      ],
      {
        duration: FILL_DUR,
        delay:    fillStart + i * FILL_STAG,
        easing:   "ease-out",
        fill:     "forwards",
      }
    );
  });

  // Step 4 — fade loader out, restore scroll, remove from DOM
  const hideAt = fillStart + (paths.length - 1) * FILL_STAG + FILL_DUR + HIDE_GAP;

  setTimeout(() => {
    document.documentElement.classList.remove("js-loading");
    loader.style.transition = `opacity ${FADE_DUR}ms ease`;
    loader.style.opacity    = "0";
    setTimeout(() => loader.remove(), FADE_DUR);
  }, hideAt);
})();

// ─── Page ─────────────────────────────────────────────────────────
const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const progress = document.querySelector(".scroll-progress");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const serviceCards = Array.from(document.querySelectorAll("[data-category]"));
const goalCards = Array.from(document.querySelectorAll("[data-filter-shortcut]"));
const serviceCarouselGroup = document.querySelector("[data-service-carousel-group]");

// Stagger delays for grid children
document.querySelectorAll(
  ".service-grid .service-card, .services-all-grid .service-full-card, .goals-grid .goals-card, .process-grid .process-step"
).forEach((el, i) => {
  el.style.setProperty("--reveal-delay", `${(i % 4) * 55}ms`);
});

if (serviceCarouselGroup) {
  const carousel = serviceCarouselGroup.closest(".experience-carousel");
  const beforeClone = serviceCarouselGroup.cloneNode(true);
  const afterClone = serviceCarouselGroup.cloneNode(true);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let groupWidth = 0;
  let lastFrame = performance.now();
  let dragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  [beforeClone, afterClone].forEach((clone) => {
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("data-service-carousel-group");
  });

  serviceCarouselGroup.before(beforeClone);
  serviceCarouselGroup.after(afterClone);

  const measureCarousel = () => {
    groupWidth = serviceCarouselGroup.getBoundingClientRect().width;
    if (carousel && groupWidth && carousel.scrollLeft < 1) {
      carousel.scrollLeft = groupWidth;
    }
  };

  const normalizeCarousel = () => {
    if (!carousel || !groupWidth) return;
    if (carousel.scrollLeft >= groupWidth * 2) {
      carousel.scrollLeft -= groupWidth;
    } else if (carousel.scrollLeft <= 0) {
      carousel.scrollLeft += groupWidth;
    }
  };

  requestAnimationFrame(measureCarousel);
  window.addEventListener("resize", measureCarousel);

  carousel?.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    dragging = true;
    dragMoved = false;
    dragStartX = event.clientX;
    dragStartScroll = carousel.scrollLeft;
  });

  carousel?.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const moveX = event.clientX - dragStartX;
    if (Math.abs(moveX) > 12) {
      dragMoved = true;
      carousel.classList.add("is-dragging");
      if (!carousel.hasPointerCapture(event.pointerId)) {
        carousel.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
    }
    carousel.scrollLeft = dragStartScroll - moveX;
    normalizeCarousel();
  });

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    if (event && carousel?.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }
    if (dragMoved) {
      setTimeout(() => {
        dragMoved = false;
        carousel?.classList.remove("is-dragging");
      }, 140);
    } else {
      carousel?.classList.remove("is-dragging");
    }
  };

  carousel?.addEventListener("pointerup", endDrag);
  carousel?.addEventListener("pointercancel", endDrag);
  carousel?.addEventListener("scroll", normalizeCarousel, { passive: true });
  carousel?.addEventListener(
    "click",
    (event) => {
      if (!dragMoved) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );

  const autoScrollCarousel = (now) => {
    const delta = Math.min(now - lastFrame, 64);
    lastFrame = now;
    if (carousel && groupWidth && !dragging && !prefersReducedMotion.matches) {
      carousel.scrollLeft += delta * 0.065;
      normalizeCarousel();
    }
    requestAnimationFrame(autoScrollCarousel);
  };

  requestAnimationFrame(autoScrollCarousel);
}

function setNav(open) {
  body.classList.toggle("nav-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
}

navToggle?.addEventListener("click", () => {
  setNav(!body.classList.contains("nav-open"));
});

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setNav(false);
  }
});

function updateChrome() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? scrollTop / scrollable : 0;
  header?.classList.toggle("is-scrolled", scrollTop > 24);
  if (progress) {
    progress.style.transform = `scaleX(${amount})`;
  }
}

window.addEventListener("scroll", updateChrome, { passive: true });
updateChrome();

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.14, rootMargin: "0px 0px -60px 0px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Split-text reveal for headings
function splitTextReveal(el) {
  const raw = el.textContent.trim();
  el.innerHTML = raw
    .split(/\s+/)
    .map(
      (word, i) =>
        `<span class="split-word"><span class="split-inner" style="--wi:${i}">${word}</span></span>`
    )
    .join("");
}

const splitObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        splitTextReveal(entry.target);
        splitObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll("[data-split]").forEach((el) => splitObserver.observe(el));

function setFilter(filter) {
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  serviceCards.forEach((card) => {
    const show = filter === "all" || card.dataset.category === filter;
    card.hidden = !show;
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

goalCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    const filter = card.dataset.filterShortcut;
    setFilter(filter);
    document.querySelector("#experiencias")?.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-ripple]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
});

const floaters = Array.from(document.querySelectorAll("[data-float]"));
if (floaters.length) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * 18;
      floaters.forEach((element, index) => {
        const depth = index + 1;
        element.style.transform = `translate3d(${x / depth}px, ${y / depth}px, 0)`;
      });
    },
    { passive: true },
  );
}
