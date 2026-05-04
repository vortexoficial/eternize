(function initProductPage() {
  const page = document.querySelector("[data-product-page]");
  if (!page || !window.ETERNIZE_PRODUCTS) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("produto") || window.ETERNIZE_PRODUCTS[0].slug;
  const product = window.ETERNIZE_PRODUCTS.find((item) => item.slug === slug) || window.ETERNIZE_PRODUCTS[0];
  const whatsappText = encodeURIComponent(`Olá, quero orçamento para ${product.title} com a Eternize.`);
  const whatsappURL = `https://wa.me/5513991571785?text=${whatsappText}`;

  page.style.setProperty("--product-accent", product.accent);
  document.title = `${product.title} | Eternize Cabine de Fotos`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", product.summary);

  document.querySelectorAll("[data-product-accent]").forEach((element) => {
    element.style.setProperty("--product-accent", product.accent);
  });

  document.querySelectorAll("[data-product-category]").forEach((element) => {
    element.textContent = product.category;
  });

  document.querySelectorAll("[data-product-title]").forEach((element) => {
    element.textContent = product.title;
  });

  document.querySelectorAll("[data-product-summary]").forEach((element) => {
    element.textContent = product.summary;
  });

  document.querySelectorAll("[data-product-description]").forEach((element) => {
    element.textContent = product.description;
  });

  document.querySelectorAll("[data-product-ideal]").forEach((element) => {
    element.textContent = product.ideal;
  });

  document.querySelectorAll("[data-product-whatsapp]").forEach((element) => {
    element.href = whatsappURL;
  });

  document.querySelectorAll("[data-product-cta-title]").forEach((element) => {
    element.textContent = `Levar ${product.title} para o seu evento?`;
  });

  const heroImage = document.querySelector("[data-product-image]");
  if (heroImage) {
    heroImage.src = product.image;
    heroImage.alt = product.alt;
  }

  const featureList = document.querySelector("[data-product-features]");
  if (featureList) {
    featureList.innerHTML = product.features.map((feature) => `<li>${feature}</li>`).join("");
  }

  const gallery = document.querySelector("[data-product-gallery]");
  if (gallery) {
    gallery.innerHTML = product.gallery
      .map(
        (image, index) => `
          <figure class="product-gallery-item reveal">
            <img src="${image}" alt="${index === 0 ? product.alt : `${product.title} em evento`}" loading="lazy" />
          </figure>
        `,
      )
      .join("");
  }
})();
