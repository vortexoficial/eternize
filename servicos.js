(function initServicesButtons() {
  const cards = Array.from(document.querySelectorAll(".services-all-grid .service-full-card"));
  const products = window.ETERNIZE_PRODUCTS || [];
  if (!cards.length || !products.length) return;

  cards.forEach((card, index) => {
    const product = products[index];
    const content = card.querySelector("div");
    if (!product || !content || content.querySelector(".service-full-card-action")) return;

    const kicker = document.createElement("span");
    kicker.className = "service-full-card-kicker";
    kicker.textContent = product.category;
    content.prepend(kicker);

    const action = document.createElement("a");
    action.className = "service-full-card-action";
    action.href = `produto.html?produto=${product.slug}`;
    action.setAttribute("aria-label", `Ver página do produto ${product.title}`);
    action.innerHTML = `
      <span>Ver produto</span>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    content.appendChild(action);

    card.classList.add("is-clickable");
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Ver página do produto ${product.title}`);

    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      window.location.href = action.href;
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      window.location.href = action.href;
    });
  });
})();
