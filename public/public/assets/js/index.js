// async function _a(_b, _c = {}) {
//   // Fetches JSON data from a given URL, throwing an error for non-OK responses.
//   const _d = await fetch(_b, _c);
//   if (!_d.ok) {
//     throw new Error(`HTTP error! status: ${_d.status}`);
//   }
//   return _d.json();
// }

// function _e(_f) {
//   // Capitalizes the first letter of a given string.
//   return _f.charAt(0).toUpperCase() + _f.slice(1);
// }

// function _g() {
//   // Displays the loading overlay.
//   document.getElementById("loading-overlay").style.display = "flex";
// }

// function _h() {
//   // Hides the loading overlay.
//   document.getElementById("loading-overlay").style.display = "none";
// }

// async function _i(_j) {
//   // Fetches and displays products based on the provided endpoint.
//   _g();
//   try {
//     const _k = await _a(`/api/products/${_j}`);
//     _l(_k, _j);
//   } catch (_m) {
//     console.error(`Failed to fetch ${_j} products:`, _m);
//   }
// }

// async function _q() {
//   // Populates the navigation categories by fetching unique categories from the API. FOR NAVBAR
//   _g();
//   try {
//     const _r = await _a("/api/products/uniqueCategory");
//     const _s = document.getElementById("nav-option-div");
//     const _v = document.getElementById("catergory-ul");
//     const _t = _s.innerHTML;
//     let [_u, _p] = ["", ''];

//     _r.forEach((_v) => {
//       const _w = _e(_v);
//       _u += `<a class="nav-option">${_w}</a>`;
//       _p += `<li><a href="#">${_w}</a></li>`;
//     });

//     _s.innerHTML = _u + _t;
//     _v.innerHTML = _p;
//   } catch (_x) {
//     console.error("Failed to fetch categories:", _x);
//   }
// }

// function _l(_y, _z) {
//   // Displays products on the page based on the provided endpoint.
//   const _0 = document.getElementById(`${_z}-section`);
//   if (!_0) return;

//   const _1 = _0.children[1];
//   _1.innerHTML = ``;

//   if (_z === "category" && _y && _y.products && _y.products.length > 0) {
//     const _2 = _e(_y.products[0].category);
//     _0.children[0].children[0].textContent = `Handpicked ${_2} For You`;
//     _0.children[0].children[1].textContent = `Explore our curated selection of premium ${_2} to elevate your lifestyle.`;
//     _y = _y.products;
//   }

//   if (!_y) return;

//   _y.forEach((_3) => {
//     const _4 = document.createElement("div");
//     _4.className = "product-container";
//     _4.id = _3.p_id;
//     _4.onclick = () => window.location.href = `/pd/?id=${_4.id}`;

//     _4.innerHTML = `
//           <div class='product-image'>
//             <img style="object-fit: cover;" src='${_3.img1_url}' alt='${_3.p_name}'>
//             <button class="CartBtn">
//               <span class="IconContainer">
//                 <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" fill="rgb(17, 17, 17)" class="cart">
//                   <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
//                 </svg>
//               </span>
//               <p class="text">Add to Cart</p>
//             </button>
//           </div>
//           <div class="details-div">
//             <div class="upper-border-div"></div>
//             <div class='product-name'>${_3.p_name}</div>
//             <div class="upper-border-div"></div>
//             <div class='product-price'>Rs ${_3.s_price}</div>
//           </div>
//           <div class="lower-border-div"></div>
//         `;
//     _1.appendChild(_4);
//   });

//   document.querySelectorAll('.CartBtn').forEach(x => x.addEventListener('click', (event) => {
//     event.stopImmediatePropagation();
//     event.preventDefault();
//     addToCart(x.parentElement.parentElement.id);
//     console.log(x.parentElement.parentElement.id);
//   }));

//   setupScrollButtons();
// }

// function setupScrollButtons() {
//   document.querySelectorAll(".sub-divs").forEach(section => {
//     const scrollContainer = section.querySelector(".featured-products");
//     const scrollLeftBtn = section.querySelector("#scrl-left");
//     const scrollRightBtn = section.querySelector("#scrl-right");

//     if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) return;

//     // Function to determine scroll amount (one product width + gap)
//     const scrollAmount = () => {
//       const firstChild = scrollContainer.querySelector(".product-container");
//       return firstChild ? firstChild.offsetWidth + 20 : 200; // Adjust gap if needed
//     };

//     // Scroll Left
//     scrollLeftBtn.addEventListener("click", () => {
//       scrollContainer.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
//     });

//     // Scroll Right
//     scrollRightBtn.addEventListener("click", () => {
//       scrollContainer.scrollBy({ left: scrollAmount(), behavior: "smooth" });
//     });
//   });
// }

// async function addToCart(_6) {
//   // Adds a product to the user's cart by making a POST request to the cart API.
//   try {
//     const _7 = await _a("/api/cart/items", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ productId: _6 }),
//     });

//     _8();
//     console.log("Cart Response:", _7);
//     notify("Product Added To Cart");
//   } catch (_a0) {
//     if (_a0.message.includes("HTTP error! status: 401")) {
//       console.log(_a0.message)
//       console.log("tppp")
//       // window.location.href = "/auth";
//     }
//     console.error("Failed to add to cart:", _a0);
//   }
// }

// async function _8() {
//   // Retrieves and displays authenticated user information.
//   _g();
//   try {
//     const _a1 = await _a("/api/myinfo");
//     document.getElementById("user_authenticated").textContent = _a1.name;
//     document.getElementById("cart-quantity").textContent = Object.keys(_a1.cart).length;
//   } catch (_a4) {
//     console.error("Failed to get authenticated user:", _a4);
//   }
// }

// async function restoreSession() {
//   // Restores the user's session by making a request to the session restore API.
//   _g();
//   try {
//     await _a("/api/session/restore");
//     _8();
//   } catch (_a9) {
//     console.log("No active session");
//   }
// }

// document.addEventListener("DOMContentLoaded", async () => {
//   await restoreSession(); // Ensure session is restored first

//   // Scroll
//   if ('scrollRestoration' in history) {
//     history.scrollRestoration = 'manual';
//   }
//   window.scrollTo(0, 0);

//   // Executes when the DOM content is loaded.
//   await _i("exclusive");
//   await _i("fresharrivals");
//   await _i("category");
//   await _q();

//   if (sessionStorage.getItem('scrl') === 'true') {
//     scrlCont();
//     sessionStorage.removeItem('scrl');
//   }

//   setTimeout(document.getElementById('loading-overlay').classList.add('fade-out'), 500);

//   // Attach event listener to input field
//   document.getElementById("srchbx").addEventListener("input", fetchSearchResults);
//   document.getElementById("srchbxm").addEventListener("input", fetchSearchResultsm);

//   // Hide dropdown when clicking outside
//   document.addEventListener("click", (event) => {
//     if (!event.target.closest(".search-container")) {
//       document.getElementById("resultsList").style.display = "none";
//     }
//   });

//   // Hide dropdown when clicking outside
//   document.addEventListener("click", (event) => {
//     if (!event.target.closest(".search-container")) {
//       document.getElementById("resultsListm").style.display = "none";
//     }
//   });
// });

// async function fetchSearchResults() {
//   const query = document.getElementById("srchbx").value.trim();
//   const resultsList = document.getElementById("resultsList");

//   if (!query) {
//     resultsList.style.display = "none";
//     return;
//   }

//   try {
//     const response = await fetch(`api/search?q=${query}`);
//     const data = await response.json();

//     if (data.length > 0) {
//       resultsList.innerHTML = data.map(item => `
//                   <div onclick="redirectToProduct('${item.p_id}')" class='result-div'>
//                     <img class='result-img' src=${item.img1_url} alt="">
//                     <div style="display: flex; flex-direction: column" class='result-li'>
//                       <li>${item.p_name}</li>
//                       <li style='color: orange'>Rs ${item.s_price}</li>
//                     </div>
//                   </div>
//           `).join("");
//       resultsList.style.display = "block";
//       [...document.getElementsByClassName('result-li')].forEach(x => x.offsetHeight = document.querySelector('.result-li').offsetHeight)
//     } else {
//       resultsList.style.display = "none";
//     }
//   } catch (error) {
//     console.error("Search Error:", error.message);
//   }
// }

// async function fetchSearchResultsm() {
//   const query = document.getElementById("srchbxm").value.trim();
//   const resultsListm = document.getElementById("resultsListm");

//   if (!query) {
//     resultsListm.style.display = "none";
//     return;
//   }

//   try {
//     const response = await fetch(`api/search?q=${query}`);
//     const data = await response.json();

//     if (data.length > 0) {
//       resultsListm.innerHTML = data.map(item => `
//                   <div onclick="redirectToProduct('${item.p_id}')" class='result-div'><img class='result-img' src=${item.img1_url} alt=""><li class='result-li'>${item.p_name}</li></div>
//           `).join("");
//       resultsListm.style.display = "block";
//     } else {
//       resultsListm.style.display = "none";
//     }
//   } catch (error) {
//     console.error("Search Error:", error.message);
//   }
// }

// function redirectToProduct(id) {
//   window.location.href = `/pd/?id=${id}`;
// }

// ==================================================================================

async function fetchData(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
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

async function fetchAndDisplayProducts(section) {
  showLoadingOverlay();
  try {
    const products = await fetchData(`/api/products/${section}`);
    renderProducts(products, section);
  } catch (error) {
    console.error(`Failed to fetch ${section} products:`, error);
  }
}

async function populateNavCategories() {
  showLoadingOverlay();
  try {
    const categories = await fetchData("/api/products/uniqueCategory");
    const navOptionsContainer = document.getElementById("nav-option-div");
    const navDropdown = document.getElementById("catergory-ul");
    const existingNavOptions = navOptionsContainer.innerHTML;
    let navOptionsHTML = "";
    let navDropdownHTML = "";

    categories.forEach((category) => {
      const categoryName = capitalizeFirstLetter(category);
      navOptionsHTML += `<a class="nav-option">${categoryName}</a>`;
      navDropdownHTML += `<li><a href="#">${categoryName}</a></li>`;
    });

    navOptionsContainer.innerHTML = navOptionsHTML + existingNavOptions;
    navDropdown.innerHTML = navDropdownHTML;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
}

function renderProducts(productsData, section) {
  const sectionElement = document.getElementById(`${section}-section`);
  if (!sectionElement) return;

  const productContainer = sectionElement.children[1];
  productContainer.innerHTML = ``;

  if (section === "category" && productsData && productsData.products && productsData.products.length > 0) {
    const categoryName = capitalizeFirstLetter(productsData.products[0].category);
    sectionElement.children[0].children[0].textContent = `Handpicked ${categoryName} For You`;
    sectionElement.children[0].children[1].textContent = `Explore our curated selection of premium ${categoryName} to elevate your lifestyle.`;
    productsData = productsData.products;
  }

  if (!productsData) return;

  productsData.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-container";
    productCard.id = product.p_id;
    productCard.onclick = () => window.location.href = `/product/?id=${productCard.id}`;

    productCard.innerHTML = `
          <div class='product-image'>
            <img style="object-fit: cover;" src='${product.img1_url}' alt='${product.p_name}'>
            <button class="CartBtn">
              <span class="IconContainer">
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" fill="rgb(17, 17, 17)" class="cart">
                  <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
                </svg>
              </span>
              <p class="text">Add to Cart</p>
            </button>
          </div>
          <div class="details-div">
            <div class="upper-border-div"></div>
            <div class='product-name'>${product.p_name}</div>
            <div class="upper-border-div"></div>
            <div class='product-price'>Rs ${product.s_price}</div>
          </div>
          <div class="lower-border-div"></div>
        `;
    productContainer.appendChild(productCard);
  });

  document.querySelectorAll('.CartBtn').forEach(button => button.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();
    addToCart(button.parentElement.parentElement.id);
  }));

  setupScrollButtons();
}

function setupScrollButtons() {
  document.querySelectorAll(".sub-divs").forEach(section => {
    const scrollContainer = section.querySelector(".featured-products");
    const scrollLeftBtn = section.querySelector("#scrl-left");
    const scrollRightBtn = section.querySelector("#scrl-right");

    if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) return;

    const scrollAmount = () => {
      const firstChild = scrollContainer.querySelector(".product-container");
      return firstChild ? firstChild.offsetWidth + 20 : 200;
    };

    scrollLeftBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });

    scrollRightBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });
  });
}

async function addToCart(productId) {
  try {
    const response = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();
    if (response.status === 401 && data.redirect) {
      window.location.href = `/${data.redirect}`;
      return;
    }

    notify(data.message || "Product Added To Cart");
    updateUserInfo();
  } catch (error) {
    console.error("Add to Cart Failed:", error);
  }
}

async function updateUserInfo() {
  showLoadingOverlay();
  try {
    const userInfo = await fetchData("/api/myinfo");
    document.getElementById("user_authenticated").textContent = userInfo.name;
    document.getElementById("cart-quantity").textContent = Object.keys(userInfo.cart).length;
  } catch (error) {
    console.warn("User in not Authenticated");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  updateUserInfo();

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  await fetchAndDisplayProducts("exclusive");
  await fetchAndDisplayProducts("fresharrivals");
  await fetchAndDisplayProducts("category");
  await populateNavCategories();

  if (sessionStorage.getItem('scrl') === 'true') {
    scrlCont();
    sessionStorage.removeItem('scrl');
  }

  setTimeout(document.getElementById('loading-overlay').classList.add('fade-out'), 500);
  document.getElementById("srchbx").addEventListener("input", fetchSearchResults);
  document.getElementById("srchbxm").addEventListener("input", fetchSearchResults);

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-container")) {
      document.getElementById("resultsList").style.display = "none";
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-container")) {
      document.getElementById("resultsListm").style.display = "none";
    }
  });
});

async function fetchSearchResults(e) {
  if (!fetchSearchResults.timer) fetchSearchResults.timer = null;

  const input = e.target;
  const query = input.value.trim();

  const isMobile = input.id === "srchbxm";
  const resultsList = document.getElementById(isMobile ? "resultsListm" : "resultsList");

  clearTimeout(fetchSearchResults.timer);
  fetchSearchResults.timer = setTimeout(async () => {
    if (!query) {
      resultsList.style.display = "none";
      return;
    }

    try {
      const response = await fetch(`api/search?q=${query}`);
      const data = await response.json();

      if (data.length > 0) {
        if (isMobile) {
          resultsList.innerHTML = data.map(item => `
            <div onclick="redirectToProduct('${item.p_id}')" class='result-div'>
              <img class='result-img' src=${item.img1_url} alt="">
              <li class='result-li'>${item.p_name}</li>
            </div>
          `).join("");
        } else {
          resultsList.innerHTML = data.map(item => `
            <div onclick="redirectToProduct('${item.p_id}')" class='result-div'>
              <img class='result-img' src=${item.img1_url} alt="">
              <div style="display: flex; flex-direction: column" class='result-li'>
                <li>${item.p_name}</li>
                <li style='color: orange'>Rs ${item.s_price}</li>
              </div>
            </div>
          `).join("");
          [...document.getElementsByClassName('result-li')].forEach(x => x.offsetHeight = document.querySelector('.result-li').offsetHeight);
        }
        resultsList.style.display = "block";
      } else {
        resultsList.style.display = "none";
      }

    } catch (error) {
      console.error("Search Error:", error.message);
    }

  }, 400);
}


function redirectToProduct(id) {
  window.location.href = `/product/?id=${id}`;
}

