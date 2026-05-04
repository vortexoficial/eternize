(function initServicesButtons() {
  const cards = Array.from(document.querySelectorAll(".services-all-grid .service-full-card"));
  const products = window.ETERNIZE_PRODUCTS || [];
  if (!cards.length || !products.length) return;

  cards.forEach((card, index) => {
    const product = products[index];
    const content = card.querySelector("div");
    if (!product || !content || content.querySelector(".service-full-card-action")) return;

    const action = document.createElement("a");
    action.className = "service-full-card-action";
    action.href = `produto.html?produto=${product.slug}`;
    action.textContent = "Ver produto";
    content.appendChild(action);
  });
})();
