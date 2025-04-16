async function fetchData(url, options = {}) {
  const response = await fetch(url, options);
  return response.json();
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showLoadingOverlay() {
  document.getElementById("loading-overlay").style.display = "flex";
}

function hideLoadingOverlay() {
  document.getElementById("loading-overlay").style.display = "none";
}

async function fetchAndDisplayProducts() {
  showLoadingOverlay();
  try {
    const data = await fetchData("/api/products/sections");
    renderProducts(data.recent, "recents");
    renderProducts(data.exclusive, "exclusive");
    renderProducts(data.freshArrivals, "fresharrivals");
    renderProducts(data.randomCategory.products, "category");
  } catch (error) {
    console.error("Failed to fetch products sections:", error);
  }
}

// async function populateNavCategories() {
//   showLoadingOverlay();
//   try {
//     const categories = await fetchData("/api/products/uniqueCategory");
//     const navOptionsContainer = document.getElementById("nav-option-div");
//     const navDropdown = document.getElementById("catergory-ul");
//     if (!navOptionsContainer || !navDropdown) return console.error("Navigation elements not found!")
//     const existingNavOptions = Array.from(navOptionsContainer.children);
//     const navOptions = categories.map(category =>
//       DOMUtils.createElement("a", { class: "nav-option", text: capitalizeFirstLetter(category) })
//     );
//     const navDropdownItems = categories.map(category => {
//       const li = DOMUtils.createElement("li");
//       li.appendChild(DOMUtils.createElement("a", { href: "#", text: capitalizeFirstLetter(category) }));
//       return li;
//     });
//     navOptionsContainer.replaceChildren(...existingNavOptions, ...navOptions);
//     navDropdown.replaceChildren(...navDropdownItems);

//   } catch (error) {
//     console.error("Failed to fetch categories:", error);
//   }
// }

function renderProducts(productsData, section) {
  const sectionElement = document.getElementById(`${section}-section`);
  if (!sectionElement) return;
  const productContainer = sectionElement.children[1];
  productContainer.innerHTML = "";
  if (section === "category" && productsData?.products?.length) {
    const categoryName = capitalizeFirstLetter(productsData.products[0].category);
    sectionElement.children[0].children[0].textContent = `Handpicked ${categoryName} For You`;
    sectionElement.children[0].children[1].textContent = `Explore our curated selection of premium ${categoryName} to elevate your lifestyle.`;
    productsData = productsData.products;
  }
  if (!productsData) return;
  if (!productsData.length) return sectionElement.style.display = 'none';
  productsData.forEach(({ product_id, imgs, product_name, discounted_price }) => {
    const productCard = document.createElement("div");
    productCard.className = "modern-product-container";
    productCard.id = product_id;
    productCard.onclick = () => location.assign(`/product/?id=${product_id}`);
    const productImageDiv = document.createElement("div");
    productImageDiv.className = "modern-product-image";
    const productImg = document.createElement("img");
    productImg.src = imgs[0];
    productImg.alt = product_name;
    productImg.style.objectFit = "cover";
    const cartBtn = document.createElement("button");
    cartBtn.className = "modern-cart-btn";
    const iconContainer = document.createElement("span");
    iconContainer.className = "modern-icon-container";
    const cartIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    cartIcon.setAttribute("height", "1em");
    cartIcon.setAttribute("viewBox", "0 0 576 512");
    cartIcon.setAttribute("fill", "rgb(17, 17, 17)");
    cartIcon.className = "modern-cart-icon";
    const cartPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    cartPath.setAttribute("d", "M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z");
    cartIcon.appendChild(cartPath);
    iconContainer.appendChild(cartIcon);
    cartBtn.appendChild(iconContainer);
    const cartText = document.createElement("p");
    cartText.className = "modern-cart-text";
    cartBtn.appendChild(cartText);
    productImageDiv.appendChild(productImg);
    productImageDiv.appendChild(cartBtn);
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "modern-details-div";
    const upperBorder1 = document.createElement("div");
    upperBorder1.className = "modern-upper-border";
    const upperBorder2 = upperBorder1.cloneNode();
    const productName = document.createElement("div");
    productName.className = "modern-product-name";
    productName.textContent = product_name;
    const productPrice = document.createElement("div");
    productPrice.className = "modern-product-price";
    productPrice.textContent = `Rs ${discounted_price}`;
    detailsDiv.append(upperBorder1, productName, upperBorder2, productPrice);
    const lowerBorder = document.createElement("div");
    lowerBorder.className = "modern-lower-border";
    productCard.append(productImageDiv, detailsDiv, lowerBorder);
    productContainer.appendChild(productCard);
    cartBtn.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      addToCart(product_id);
    });
  });
  setupScrollButtons();
}

function setupScrollButtons() {
  if (window.innerWidth > 600) return;

  document.querySelectorAll(".modern-sub-div").forEach(section => {
    const scrollContainer = section.querySelector(".modern-featured-products");
    const scrollLeftBtn = section.querySelector("#scrl-left");
    const scrollRightBtn = section.querySelector("#scrl-right");

    if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) return;

    const scrollAmount = () => {
      const firstChild = scrollContainer.querySelector(".modern-product-container");
      return firstChild ? firstChild.offsetWidth + 20 : 200;
    };

    const updateButtons = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

      scrollLeftBtn.style.visibility = scrollLeft <= 10 ? 'hidden' : 'visible';
      scrollRightBtn.style.visibility = scrollLeft >= maxScroll - 10 ? 'hidden' : 'visible';
    };
    updateButtons();

    scrollLeftBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });
    scrollRightBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });
    scrollContainer.addEventListener("scroll", updateButtons);
  });
}

async function addToCart(productId) {
  try {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (res.status === 401 && data.redirect)
      return (goTo(`/${data.redirect}`));
    notify(data.message, data.type, 3, () => location.assign('/cart'));
    updateUserInfo();
  } catch (err) {
    console.error("Add to Cart Failed:", err);
  }
}

async function updateUserInfo() {
  showLoadingOverlay();
  try {
    const userInfo = await fetchData("/api/me/info");
    DOMUtils.setTextContent("user_authenticated", userInfo.fullName);
    DOMUtils.setTextContent("cart-quantity", Object.keys(userInfo.cart).length);
  } catch (error) {
    console.warn("User is not Authenticated");
  }
}

function initializeSearchPopup() {
  const openSearchBtn = DOMUtils.getElement("open-srch"),
    popupSearch = DOMUtils.getElement("popup-srch"),
    searchInput = DOMUtils.getElement("search-input")

  openSearchBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    DOMUtils.setStylesById("popup-srch", { display: "flex" });
    DOMUtils.setStylesById("suggestions", { display: "none" });
    DOMUtils.setStylesById("overlay", { display: "block" });
    document.getElementById('search-input').style.borderRadius = '25px';
    searchInput.focus();
  });

  document.addEventListener("click", (e) => {
    if (!popupSearch.contains(e.target) && e.target !== openSearchBtn) {
      DOMUtils.setStylesById("popup-srch", { display: "none" });
      DOMUtils.setStylesById("overlay", { display: "none" });
      DOMUtils.setValue("search-input", '');
      DOMUtils.setInnerHTML("suggestions", '');
    }
  });
}

async function logoutFromAllDevices() {
  try {
    const response = await fetch("/api/logout-all", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    console.log(data.message);
    if (response.ok)
      goTo("/");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

async function fetchSearchResults(e) {
  const input = e.target, query = input.value.trim();
  const resultsListId = input.id === "srchbxm" ? "resultsListm" : "suggestions";
  const resultsContainer = document.getElementById(resultsListId);

  if (fetchSearchResults.timer) clearTimeout(fetchSearchResults.timer);

  if (!query) {
    resultsContainer.style.display = "none";
    if (resultsListId === 'suggestions') input.style.borderRadius = '25px';
    DOMUtils.setStylesById("suggestions", { display: "none" });
    return;
  }

  fetchSearchResults.timer = setTimeout(async () => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const { products, categories } = await response.json();

      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "block";
      if (resultsListId === 'suggestions') input.style.borderRadius = '25px 25px 0 0';

      if (!products.length && !categories.length) {
        resultsContainer.innerHTML = `
          <div class="result-div">
              <p style="margin:0 auto">No results found for "${query}"</p>
          </div>`;
        return;
      }
      if (products.length) {
        const productsSection = document.createElement('div');
        productsSection.className = 'products-section';
        productsSection.innerHTML = '<div class="section-header">Products</div>';

        products.forEach(product => {
          productsSection.innerHTML += `
            <div class="result-div" onclick="location.assign('/product/?id=${product.product_id}')">
                <img class="result-img" src="${product.imgs[0] || '/placeholder.jpg'}" alt="${product.product_name}">
                <div class="result-li">
                    <div style='display: flex; flex-direction: row; justify-content: space-between'>
                      <strong>${product.product_name}</strong>
                      <i class='bx bx-arrow-back bx-rotate-180' ></i>
                    </div>
                    <p>${product.category}</p>
                    <span>$${product.discounted_price}</span>
                </div>
            </div>
            `;
        });
        resultsContainer.appendChild(productsSection);
      }
      if (categories.length) {
        const categoriesSection = document.createElement('div');
        categoriesSection.className = 'categories-section';
        categoriesSection.innerHTML = '<div class="section-header">Categories</div>';

        categories.forEach(category => {
          categoriesSection.innerHTML += `
            <div class="result-div" onclick="location.assign('/category/?category=${category.category_id}&querry=${query}')">
                <div class="text-container">${category.name.charAt(0)}</div>
                <div class="result-li">
                <div style='display: flex; flex-direction: row; justify-content: space-between'><strong>${category.name}</strong><i class='bx bx-link-external'></i></div>
                    <p>${category.product_count} products</p>
                </div>
            </div>
            `;
        });
        resultsContainer.appendChild(categoriesSection);
      }
    } catch (error) {
      console.error("Search Error:", error);
      resultsContainer.innerHTML = `
        <div class="result-div">
            <p style="margin:0 auto;color:red">Error loading search results</p>
        </div>
        `;
    }
  }, 400);
}

fetchSearchResults.timer = null;

document.addEventListener("DOMContentLoaded", async () => {
  updateUserInfo();

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  window.scrollTo(0, 0);

  await fetchAndDisplayProducts();
  // await populateNavCategories();

  if (sessionStorage.getItem('scrl') === 'true') {
    scrlCont();
    sessionStorage.removeItem('scrl');
  }

  setTimeout(() => DOMUtils.toggleClassById('loading-overlay', 'fade-out'), 500);

  ["search-input", "srchbxm"].forEach(id => {
    DOMUtils.addEventListenerById(id, "input", fetchSearchResults);
  });

  ["resultsList", "resultsListm"].forEach(id => {
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".search-container")) {
        DOMUtils.setStylesById(id, { display: "none" });
      }
    });
  });

  initializeSearchPopup();
});

