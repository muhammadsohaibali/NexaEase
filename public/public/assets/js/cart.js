function _g() {
  // Displays the loading overlay.
  document.getElementById("loading-overlay").style.display = "flex";
}

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
    const cartData = await fetchJson("/api/cart/", { credentials: "include" });
    if (Object.keys(cartData.cart).length) {
      renderCart(Object.keys(cartData.cart), cartData.cart);
      document.title = "NexaEase - Cart";
      document.getElementById("cart-status-heading").innerHTML = `<i class='bx bx-cart-alt bx-md'></i><span style="margin-top: auto; margin-bottom: auto;height:25px"> Your Cart</span>`;
    } else {
      document.title = "NexaEase - Cart";
      document.getElementById("cart-status-heading").innerHTML = `Your Cart is Waiting for You!`;
      document.getElementById("cart-container").innerHTML = `
      <div id="empty-cart-message" class="empty-cart">
        <h2>Find great deals and add your favorites to the cart!</h2>
        <p>Looks like you haven't added anything yet. Start shopping now!</p>
        <a href="/" class="shop-now-btn">Shop Now</a>
      </div>`;
      setTimeout(() => document.getElementById('loading-overlay').classList.add('fade-out'), 100);
    }
  } catch (error) {
    document.title = "NexaEase - Your Cart";
    document.getElementById("cart-status-heading").innerHTML = `<i class='bx bx-cart-alt bx-md'></i><span style="margin-top: auto; margin-bottom: auto;height:25px"> Please Sign In</span>`;
    document.getElementById("cart-table-wrapper").innerHTML = `
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

async function renderCart(productIds, cartQuantities) {
  try {
    const products = await fetchProductsByIds(productIds);
    if (!products || products.length === 0) {
      document.getElementById("cart-container").innerHTML = `
        <div id="empty-cart-message" class="empty-cart">
          <h2>Your cart is empty!</h2>
          <p>Looks like you haven't added anything yet. Start shopping now!</p>
          <a href="/" class="shop-now-btn">Shop Now</a>
        </div>`;
      return;
    }

    let cartHTML = `
      <div class="cart-table-wrapper" id="cart-table-wrapper">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="table-body">
    `;
    let totalPrice = 0;

    products.forEach(product => {
      const quantity = cartQuantities[product.p_id]?.qty || 0;
      const subtotal = product.s_price * quantity;
      totalPrice += subtotal;

      cartHTML += `
        <tr class="cart-item" data-id="${product.p_id}">
          <td>
            <div class="product-details">
              <img src="${product.img1_url}" alt="${product.p_name}" class="product-image">
              <h3 class="product-name">${product.p_name}</h3>
            </div>
          </td>
          <td>
            <div class="quantity-controls">
              <button class="decrement-btn" data-id="${product.p_id}"><i class='bx bx-minus'></i></button>
              <span class="quantity-value">${quantity}</span>
              <button class="increment-btn" data-id="${product.p_id}"><i class='bx bx-plus'></i></button>
            </div>
          </td>
          <td>PKR ${product.s_price}</td>
          <td>
            <button class="remove-btn" data-id="${product.p_id}"><i class='bx bx-trash'></i></button>
          </td>
        </tr>
      `;
    });

    cartHTML += `
          </tbody>
        </table>
        <div class="total-price-container" id="total-price-container">
          <div class="total-price">
            Total Price: PKR <span id="total-price-value">${totalPrice}</span>
          </div>
          <button class="place-order-btn" id="place-order-btn">
            <span id='btn-text' class="btn-text">Place Order</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById("cart-container").innerHTML = cartHTML;

    document.getElementById('place-order-btn').addEventListener('click', async function placeOrder() {
      let detailsDiv = document.createElement('div');
      detailsDiv.className = "shipping-details";
      detailsDiv.id = 'shipping-details'
      detailsDiv.innerHTML = `
          <h3>Shipping Details</h3>
          <div class="detail"><strong>Name:</strong> <span id="ship-name">${window.user.name}</span></div>
          <div class="detail"><strong>Phone:</strong> <span id="ship-phone">${window.user.phoneNumber}</span></div>
          <div class="detail"><strong>Email:</strong> <span id="ship-email">${window.user.email}</span></div>
          <div class="detail"><strong>Address:</strong> <span id="ship-address">${window.user.address}</span></div>
      `;

      document.getElementById('cart-table-wrapper').insertBefore(detailsDiv, document.getElementById("total-price-container"));
      document.getElementById('btn-text').textContent = 'Confirm Order';

      document.querySelector('#shipping-details').scrollIntoView({ behavior: "smooth", block: "center" })

      this.removeEventListener('click', placeOrder);
      this.addEventListener('click', confirmOrder);
    });

    async function confirmOrder() {
      try {
        document.getElementById('btn-text').textContent = 'Processing...';

        let response = await fetch('/api/place-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: window.user.id,
            cartItems: window.cartItems
          })
        });

        let data = await response.json();
        if (response.ok) {
          notify("Order placed successfully!")
          setTimeout(() => { window.location.href = '/' }, 1000);
        } else {
          console.error("Order failed:", data.error);
        }
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
    const response = await fetch("/api/me/profile", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      window.user = data;
    } else {
      // data.message === 'User not authenticated' ? window.location.href = "/auth" : console.error("Profile Fetch Error:", data.message);
    }
  } catch (err) {
    console.error("Request Failed:", err);
  }
}

async function updateCartItem(productId, action, quantityElement) {
  try {
    const updatedItem = await fetchJson("/api/cart/items/", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, action }),
    });
    quantityElement.innerText = updatedItem.qty;
    return updatedItem.qty;
  } catch (error) {
    console.error(`Failed to ${action} product:`, error);
    return null;
  }
}

async function removeCartItem(productId, cartItemElement) {
  try {
    await fetchJson("/api/cart/items/", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    cartItemElement.remove();
    fetchCartData()
    return true;
  } catch (error) {
    console.error("Failed to remove product:", error);
    return false;
  }
}

document.addEventListener("click", async (e) => {
  if (e.target.closest(".increment-btn") || e.target.closest(".decrement-btn")) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.target.closest("button");
    const productId = btn.dataset.id;
    const action = btn.classList.contains("increment-btn") ? "increase" : "decrease";
    const quantityElement = btn.parentElement.querySelector(".quantity-value");
    const updatedQuantity = await updateCartItem(productId, action, quantityElement);
    fetchCartData();
    if (updatedQuantity !== null) {
      const productIds = Object.keys(window.y);
      await renderCart(productIds, window.y);
    }
  }

  if (e.target.closest(".remove-btn")) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.target.closest("button");
    const productId = btn.dataset.id;
    const cartItemElement = btn.closest(".cart-item");
    if (await removeCartItem(productId, cartItemElement)) {
      const productIds = Object.keys(window.y);
      await renderCart(productIds, window.y);
    }
  }

  const cartItem = e.target.closest(".cart-item");
  if (cartItem && !e.target.closest(".increment-btn, .decrement-btn, .remove-btn")) {
    window.location.href = `/product/?id=${cartItem.dataset.id}`;
  }
});

// async function restoreSession() {
//   try {
//     const response = await fetch("/api/session/restore", { credentials: "include" });
//     if (!response.ok) throw new Error("Session not found");

//     const data = await response.json();
//     console.log("User is Authenticated");
//   } catch (error) {
//     console.log("No active session");
//   }
// }

window.onload = async function () {
  _g();

  // await restoreSession();
  await fetchUserProfile();
  await fetchCartData();

}
