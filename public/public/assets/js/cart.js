function _g() {
  // Displays the loading overlay.
  document.getElementById("loading-overlay").style.display = "flex";
}

const spinner = (toggle) => toggle
  ? document.getElementById('spinner-loader').style.display = 'inline-block'
  : document.getElementById('spinner-loader').style.display = 'none';

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function capitalizeFirstLetter(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

async function fetchCartData() {
  try {
    const cartData = await fetchJson("/api/cart", { credentials: "include" });
    if (Object.keys(cartData.cart).length) {
      renderCart(Object.keys(cartData.cart), cartData.cart);
      document.title = "NexaEase - Cart";
      document.querySelector(".cart-header h1").innerHTML = `
        <i class='bx bxs-shopping-bag'></i>
        Your Cart
        <span class="item-count">${Object.keys(cartData.cart).length} items</span>
      `;
    } else {
      document.title = "NexaEase - Cart";
      document.querySelector(".cart-content").innerHTML = `
        <div id="empty-cart-message" class="empty-cart">
          <h2>Your Cart is Empty!</h2>
          <p>Looks like you haven't added anything yet. Start shopping now!</p>
          <a href="/" class="shop-now-btn">Shop Now</a>
        </div>`;
      setTimeout(() => document.getElementById('loading-overlay').classList.add('fade-out'), 100);
    }
  } catch (error) {
    document.title = "NexaEase - Your Cart";
    document.querySelector(".cart-content").innerHTML = `
      <div id="sign-in-message" class="empty-cart">
        <h2>You are not signed in</h2>
        <p>Please sign in to access your cart and continue shopping.</p>
        <a href="/auth" class="shop-now-btn">Sign In</a>
      </div>`;
    setTimeout(() => document.getElementById('loading-overlay').classList.add('fade-out'), 100);
  }
}

async function fetchProductsByIds(productIds) {
  try {
    return await fetchJson("/api/products", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

const formatTitle = str => str
  .replace(/-/g, ' ')
  .split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(' ');

async function renderCart(productIds, cartQuantities) {
  try {
    const products = await fetchProductsByIds(productIds);
    if (!products || products.length === 0) {
      document.querySelector(".cart-content").innerHTML = `
        <div id="empty-cart-message" class="empty-cart">
          <h2>Your Tech Toolkit is Empty!</h2>
          <p>Looks like you haven't added anything yet. Start shopping now!</p>
          <a href="/" class="shop-now-btn">Shop Now</a>
        </div>`;
      return;
    }

    let cartHTML = `
      <div class="cart-items">
    `;

    let totalPrice = 0;
    let totalDiscount = 0;

    products.forEach(product => {
      const quantity = cartQuantities[product.product_id]?.qty || 0;
      const subtotal = product.discounted_price * quantity;
      const originalSubtotal = product.regular_price * quantity;
      const itemDiscount = originalSubtotal - subtotal;
      const color = cartQuantities[product.product_id]?.color || null

      totalPrice += subtotal;
      totalDiscount += itemDiscount;

      cartHTML += `
        <div class="cart-item" data-id="${product.product_id}">
          <div class="item-image">
            <img src="${product.imgs[0]}" alt="${product.product_name}">
          </div>
          <div class="item-details">
            <h3 class="item-name">${product.product_name}</h3>
            ${color ? `
              <div class='item-sku' style='margin-bottom: 0;'>
                <p style='margin: 5px 0;'>Color: <span style='color: ${color}'>${color}</span></p>
              </div>
            ` : ''}
            <p class="item-sku">From ${formatTitle(product.category)}</p> 
            <div class="item-actions">
              <button class="quantity-btn minus" data-id="${product.product_id}">−</button>
              <span class="quantity">${quantity}</span>
              <button class="quantity-btn plus" data-id="${product.product_id}">+</button>
              <button class="remove-btn" data-id="${product.product_id}">Remove</button>
            </div>
          </div>
          <div class="item-price">
            <span class="price">Rs ${product.discounted_price.toLocaleString()}</span>
            ${product.regular_price > product.discounted_price ?
          `<span class="original-price">Rs ${product.regular_price.toLocaleString()}</span>` : ''}
          </div>
        </div>
      `;
    });

    cartHTML += `</div>`;

    // Add summary column
    cartHTML += `
      <div class="cart-summary">
        <div class="summary-card">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal (${products.length} items)</span>
            <span>Rs ${(totalPrice + totalDiscount).toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span class="free">FREE</span>
          </div>
          ${totalDiscount > 0 ? `
          <div class="summary-row">
            <span>Discount</span>
            <span class="discount">-Rs ${totalDiscount.toLocaleString()}</span>
          </div>` : ''}
          <div class="divider"></div>
          <div class="summary-row total">
            <span>Total</span>
            <span>Rs ${totalPrice.toLocaleString()}</span>
          </div>
          <button class="checkout-btn" id="place-order-btn">
            <span id="btn-text" class="btn-text">Proceed to Checkout</span>
          </button>
        </div>
      </div>
    `;

    document.querySelector(".cart-content").innerHTML = cartHTML;

    document.getElementById('place-order-btn').addEventListener('click', async function placeOrder() {
      let detailsDiv = document.createElement('div');
      detailsDiv.className = "shipping-details";
      detailsDiv.id = 'shipping-details';
      detailsDiv.innerHTML = `
        <h3>Shipping Details</h3>
        <div class="detail"><strong>Name:</strong> <span id="ship-name">${window.user.fullName}</span></div>
        <div class="detail"><strong>Phone:</strong> <span id="ship-phone">${window.user.phoneNumber}</span></div>
        <div class="detail"><strong>Email:</strong> <span id="ship-email">${window.user.email}</span></div>
        <div class="detail"><strong>Address:</strong> <span id="ship-address">${window.user.address}</span></div>
      `;

      document.querySelector('.cart-items').appendChild(detailsDiv);
      document.getElementById('btn-text').textContent = 'Confirm Order';
      document.getElementById('step-2').classList.add('active');

      document.querySelector('#shipping-details').scrollIntoView({ behavior: "smooth", block: "center" });

      this.removeEventListener('click', placeOrder);
      this.addEventListener('click', confirmOrder);
    });

    async function confirmOrder() {
      try {
        spinner(true);
        document.getElementById('btn-text').textContent = 'Processing';

        let response = await fetch('/api/place-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        let data = await response.json();
        if (response.ok) {
          notify("Order placed successfully!", 'success');
          setTimeout(() => { location.assign(`/order/track/?order-id=${data.orderId}`) }, 1000);
        } else {
          console.error("Order failed:", data.error);
        }
        spinner(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  } catch (error) {
    console.error("Failed to render cart:", error);
  }
  setTimeout(() => document.getElementById('loading-overlay').classList.add('fade-out'), 100);
}

async function fetchUserProfile() {
  try {
    const response = await fetch("/api/me/info", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) window.user = data;
  } catch (err) {
    console.error("Request Failed:", err);
  }
}

async function updateCartItem(productId, action, quantityElement) {
  try {
    spinner(true);
    const updatedItem = await fetchJson("/api/cart/items", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, action }),
    });

    if (updatedItem.type) {
      notify(updatedItem.message, updatedItem.type)
    }

    quantityElement.innerText = updatedItem.qty;
    spinner(false);
    return updatedItem.qty;
  } catch (error) {
    console.error(`Failed to ${action} product:`, error);
    return null;
  }
}

async function removeCartItem(productId, cartItemElement) {
  try {
    spinner(true);
    await fetchJson("/api/cart/items", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    cartItemElement.remove();
    fetchCartData();
    spinner(false);
    return true;
  } catch (error) {
    console.error("Failed to remove product:", error);
    return false;
  }
}

document.addEventListener("click", async (e) => {
  if (e.target.closest(".quantity-btn")) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.target.closest("button");
    if (btn.classList.contains("plus") || btn.classList.contains("minus")) {
      const productId = btn.dataset.id;
      const action = btn.classList.contains("plus") ? "increase" : "decrease";
      const quantityElement = btn.parentElement.querySelector(".quantity");
      const updatedQuantity = await updateCartItem(productId, action, quantityElement);
      fetchCartData();
    }
  }

  if (e.target.closest(".remove-btn")) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.target.closest("button");
    const productId = btn.dataset.id;
    const cartItemElement = btn.closest(".cart-item");
    await removeCartItem(productId, cartItemElement);
  }

  const cartItem = e.target.closest(".cart-item");
  if (cartItem && !e.target.closest(".quantity-btn, .remove-btn")) {
    location.assign(`/product/?id=${cartItem.dataset.id}`);
  }
});

window.onload = async function () {
  _g();
  await fetchUserProfile();
  await fetchCartData();
};