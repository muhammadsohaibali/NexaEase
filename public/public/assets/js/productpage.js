function generateColorDivs(colorString, condition) {
    if (!condition) return '';
    const colors = colorString.split(',').map(color => color.trim());
    let first = true, selected_color, border_color;
    return `
        <div class="color-label" id="color-label">Color</div>
        <div class="color-options">
            ${colors.map(color => {
        let className = first ? "white_div_circle selected" : "white_div_circle";
        if (first) [selected_color, border_color, first] = [color, color, false];
        return `<div style="border-color: ${border_color}" class="${className}">
                            <div style="background-color: ${color};" class="color-circle" data-color="${color}"></div>
                        </div>`;
    }).join('')}
        </div>`;
}

function renderProduct(product) {
    const container = document.getElementById('main-section');
    container.innerHTML = '';

    const price_div = product.s_price === product.price
        ? `<div style="display:flex; flex-direction:row;margin-bottom:10px">
             <div class="price">Rs ${product.s_price}</div>
           </div>`
        : `<div style="display:flex; flex-direction:row;margin-bottom:10px">
             <div class="price">Rs ${product.s_price}</div>
             <div class="saleprice">Rs ${product.price}</div>
           </div>`;

    const productDiv = document.createElement('div');
    productDiv.className = 'container';
    productDiv.innerHTML = `
    <div class="product-section" id="${product.p_id}">
        <div class="image-selector desktop">
            ${[1, 2, 3, 4].map(i =>
        `<img src="${product[`img${i}_url`]}" alt="Image ${i}" 
                    class="selector-image ${i === 1 ? 'active' : ''}">`
    ).join('')}
        </div>
        <div id="image-container" class="image-container img-magnifier-container">
            <img id="display-image" src="${product.img1_url}" 
                style="object-fit: cover;" alt="Product Image Placeholder">
        </div>
        <div class="image-selector mobile">
            ${[1, 2, 3, 4].map(i =>
        `<img src="${product[`img${i}_url`]}" alt="Image ${i}" 
                    class="selector-image ${i === 1 ? 'active' : ''}">`
    ).join('')}
        </div>
        <div class="vertical-divider"></div>
        <div class="details-container">
            <div class="lower-border-div" style="margin-top: 1px; margin-bottom: 10px;"></div>
            <div style='color: gray'>Category> ${product.category}</div>
            <div class="product-name-for-page">${product.p_name}</div>
            ${price_div}
            ${generateColorDivs(product.colors, product.has_color)}
            <div class="color-label">Description</div>
            <div class="description">${product.p_desc.replace(/\\n/g, '<br>')}</div>
            <button onclick="addToCart_bybtn()" class="add-to-cart" id="addToCartID">
                Add to Cart
            </button>
        </div>
    </div>
    <div class="related-products">
        <div class="exclusive-heading-wrapper-only">
            <h2 class="exclusive-heading">You May Also Like</h2>
        </div>
        <div class="main-div">
            <div style="margin-left: 0" class="sub-divs">
                <div id='featuredDiv' class="featured-products" style="margin: 0; width: 100%;"></div>
            </div>
        </div>
    </div>
`;
    container.append(productDiv);
}

function renderCategory(y) {
    let x = y.products

    const container = document.getElementById('featuredDiv');
    container.innerHTML = '';

    x.forEach((_3) => {
        const productDiv = document.createElement("div");
        productDiv.className = "product-container";
        productDiv.id = _3.p_id;
        productDiv.onclick = () => window.location.href = `/product/?id=${productDiv.id}`;

        productDiv.innerHTML = `
              <div class='product-image'>
                <img style="object-fit: cover;" src='${_3.img1_url}' alt='${_3.p_name}'>
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
                <div class='product-name'>${_3.p_name}</div>
                <div class="upper-border-div"></div>
                <div class='product-price'>Rs ${_3.s_price}</div>
              </div>
              <div class="lower-border-div"></div>
            `;
        container.appendChild(productDiv);
    });

    document.querySelectorAll('.CartBtn').forEach(x => x.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        addToCart(x.parentElement.parentElement.id);
    }));
}

// ======================== NEW SCRIPT ========================
window.onload = async function () {
    // await restoreSession();
    await updateCartQty();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        fetchProduct(id).then(x => {
            renderProduct(x);
            fetchCategory(x.category).then(f => renderCategory(f));
        }).finally(() => {
            // ======== IMAGE SELECTION ========
            const selectorImages = document.querySelectorAll('.selector-image');
            const mainImage = document.getElementById('display-image');

            selectorImages.forEach(image => {
                image.addEventListener('mouseover', function () {
                    selectorImages.forEach(img => img.classList.remove('active'));
                    this.classList.add('active');
                    mainImage.src = this.src;

                    demagnify();
                    magnify("display-image", 2);
                    hide_glass();
                });
            });

            // DYNAMIC CART BUTTON - FOR MOBILE DEVICES
            const mobileWidth = 768; // Max width for mobile devices
            const cartButtons = document.querySelectorAll('.CartBtn');
            const productContainers = document.querySelectorAll('.product-container');

            // Function to check if the div is in the extreme center
            function isInCenter(element) {
                const rect = element.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const middleOfViewport = windowHeight / 2;
                const elementCenter = rect.top + rect.height / 2;
                const tolerance = 100;
                return Math.abs(elementCenter - middleOfViewport) <= tolerance;
            }

            // Function to check each element for centering
            function checkForCentering() {
                if (window.innerWidth <= mobileWidth) { // Apply this only for mobile
                    cartButtons.forEach(button => {
                        if (isInCenter(button)) {
                            button.classList.add('centered');
                        } else {
                            button.classList.remove('centered');
                        }
                    });
                }
            }

            // Add scroll and resize listeners to trigger the check
            window.addEventListener('scroll', checkForCentering);
            window.addEventListener('resize', checkForCentering);

            // Run it once on page load
            checkForCentering();

            setTimeout(document.getElementById('loading-overlay').classList.add('fade-out'), 500);
        });
    }

};

// Update Cart Qty
async function updateCartQty() {
    try {
        const _d = await fetch("/api/myinfo");
        if (_d.ok) _d.json().then(x => document.getElementById("cart-quantity").textContent = Object.keys(x.cart).length);
        else throw new Error(`HTTP error! status: ${_d.status}`);
    } catch (err) {
        console.error(err.error);
    }
}

// async function restoreSession() {
//     try {
//         const response = await fetch("/api/session/restore", { credentials: "include" });
//         if (!response.ok) throw new Error("Session not found");

//         const data = await response.json();
//         console.log("User is Authenticated");
//     } catch (error) {
//         console.log("No active session");
//     }
// }


async function fetchProduct(productId) {
    try {
        const response = await fetch(`/api/product?productId=${productId}`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.error || "Failed to fetch product");

        return data;

    } catch (error) {
        console.error("Error fetching product:", error.message);
    }
}

async function fetchCategory(categ) {
    try {
        const response = await fetch(`/api/products/category/get?category=${categ}`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.error || "Failed to fetch product");

        return data;

    } catch (error) {
        console.error("Error fetching product:", error.message);
    }
}

async function addToCart(pId) {
    try {
        const res = await customFetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId: pId }),
        });
        updateCartQty();
        notify("Product Added To Cart");
    } catch (err) {
        if (err.message.includes("HTTP error! status: 401")) {
            window.location.href = "/auth";
        }
        console.error("Failed to add to cart:", err);
    }
}

async function customFetch(api, callback = {}) {
    const _d = await fetch(api, callback);
    if (!_d.ok) {
        throw new Error(`HTTP error! status: ${_d.status}`);
    }
    return _d.json();
}

