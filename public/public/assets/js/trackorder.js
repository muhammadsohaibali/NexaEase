function refineOrderID(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

async function renderOrder(orderNumber) {
  const trackButton = document.querySelector('.form-button');
  const orderInput = document.getElementById('orderInput');
  const resultContainer = document.getElementById('result');

  trackButton.classList.add('loading');
  trackButton.disabled = true;
  orderInput.disabled = true;
  resultContainer.style.display = 'block';
  resultContainer.innerHTML = '<div class="loading-state">Loading order details...</div>';

  try {
    const response = await fetch(`/api/orders/${orderNumber}`);
    if (!response.ok) throw new Error(response.status === 404 ? 'Order not found' : 'Server error');

    const data = await response.json();
    if (!data.order) throw new Error('Order data incomplete');

    const { order } = data;
    const orderStatus = order.status || "Unknown";

    const statusClass = {
      "Pending": "status-pending",
      "Completed": "status-completed",
      "Cancelled": "status-cancelled",
      "Processing": "status-processing",
      "Shipped": "status-shipped"
    }[orderStatus] || "status-unknown";

    const formatDateTime = str => {
      const [d, t] = str.split(' at ');
      const [h, m] = t.split(':');
      const hr = ((h % 12) || 12),
        ampm = h >= 12 ? 'PM' : 'AM';
      return `${d} at ${hr}:${m} ${ampm}`;
    };

    resultContainer.innerHTML = `
      <div class="order-container">
        <div class="order-header">
          <nav class="breadcrumb">
            <a href="/">Home</a> &gt; <a href="/orders">Orders</a> &gt; <span>Order ID: ${order.orderNumber}</span>
          </nav>
              
          <div class="order-title">
            <h1>Order Details</h1>
            <div class="order-id">#${order.orderNumber}</div>
          </div>
              
          <div class="order-meta">
            <div class="meta-item">
              <span class="meta-label">Placed on</span>
              <span class="meta-value">${formatDateTime(order.createdAt)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Status</span>
              <span class="status-badge ${statusClass}">${orderStatus}</span>
            </div>
          </div>
          <div class="meta-item" style='margin-top: 15px'>
            <span class="meta-label">Total</span>
            <span class="meta-value"><strong>Rs ${order.total.toLocaleString()}</strong></span>
          </div>
        </div>
              
        <div class="order-content">
          <section class="order-items-section">
            <h2 class="section-title">Items</h2>
            <div class="order-items">
              ${order.items?.length ? order.items.map(item => `
                <div class="item-card" onclick='window.location.href="/product/?id=${item.product_id}"'>
                  <div class="item-image">
                    <img src="${item.img}" alt="${item.product_name}" loading="lazy">
                  </div>
                  <div class="item-info">
                    <h3 class="item-name">${item.product_name}</h3>
                    <div class="item-meta">
                      <span>Color: ${item.color}</span>
                      <span>•</span>
                      <span>Qty: ${item.quantity}</span>
                      <span>•</span>
                      <span>Rs ${item.price} each</span>
                    </div>
                  </div>
                  <div class="item-total">
                    Rs ${item.quantity * item.price}
                  </div>
                </div>
              `).join('') : '<div class="empty-state">No items found in this order</div>'}
            </div>
          </section>
              
          <section class="customer-section">
            <h2 class="section-title">Customer Information</h2>
            <div class="info-card">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name</span>
                  <span class="info-value">${order.username}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">${order.address}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">${order.email}</span>
                </div>
                ${order.phone ? `
                <div class="info-item">
                  <span class="info-label">Phone</span>
                  <span class="info-value">${order.phone}</span>
                </div>
                ` : ''}
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

  } catch (error) {
    console.error("Error fetching order:", error);
    const errorMessage = error.message === 'Order not found'
      ? `We couldn't find an order with ID: <span class="order-not-found-order-id">${orderNumber}</span>`
      : "There was a problem loading your order details. Please try again later.";

    resultContainer.innerHTML = `
      <div class="error-state">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 class="error-title">${error.message === 'Order not found' ? 'Order Not Found' : 'Something Went Wrong'}</h2>
        <p class="error-description">
          ${errorMessage}
          ${error.message !== 'Order not found' ? '<br><small>Error code: ' + (error.code || 'UNKNOWN') + '</small>' : ''}
        </p>
        
        <div class="error-details">
          <div class="error-detail">
            <strong>${error.message === 'Order not found' ? 'No order found with ID:' : 'Technical details:'}</strong>
            <div class="error-id">${orderNumber}</div>
          </div>
          ${error.message !== 'Order not found' ? `
          <div class="error-suggestion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V12" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16H12.01" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Our technical team has been notified</span>
          </div>
          ` : ''}
        </div>
        
        <div class="error-actions">
          <button onclick="reEnterId(event, this.parentElement.parentElement.parentElement)" class="action-button secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Re-enter Order ID
          </button>
          <button onclick="${error.message === 'Order not found' ? 'trackOrder()' : 'location.reload()'}" class="action-button primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.699 2 18.9585 4.01099 20.8273 7.01547M22 12V7.01547M22 12H17.0155" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${error.message === 'Order not found' ? 'Try Again' : 'Reload Page'}
          </button>
        </div>
      </div>
    `;
  } finally {
    trackButton.classList.remove('loading');
    document.getElementById('container').style.display = 'none';
    trackButton.disabled = false;
    orderInput.disabled = false;
  }
}

function trackOrder() {
  const orderID = document.getElementById('orderInput').value.trim();
  const resultContainer = document.getElementById('result');
  const orderInput = document.getElementById('orderInput');

  resultContainer.style.display = 'block';
  resultContainer.innerHTML = '<div class="loading-state">Validating order ID...</div>';

  if (!orderID) {
    resultContainer.innerHTML = `
      <div class="validation-error">
        <div class="error-header">
          <svg class="error-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h2 class="error-title">Order ID Required</h2>
        </div>
        <p class="error-message">Please enter your order ID to track your order status.</p>
        
        <div class="error-guidance">
          <div class="guidance-item">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <span>Check your confirmation email</span>
          </div>
          <div class="guidance-item">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>Look for subject: "Your Order Confirmation"</span>
          </div>
        </div>
        
        <button class="action-button" onclick="reEnterId(event, this.parentElement.parentElement)">
          <svg viewBox="0 0 24 24">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          Enter Order ID Now
        </button>
      </div>
    `;
    orderInput.focus();
    orderInput.classList.add('input-error');
    document.getElementById('container').style.display = 'none';
    return;
  }

  const refinedID = refineOrderID(orderID);
  if (refinedID.length < 6) {
    resultContainer.innerHTML = `
      <div class="validation-error">
        <div class="error-header">
          <svg class="error-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h2 class="error-title">Invalid Order ID Format</h2>
        </div>
        <p class="error-message">The order ID you entered doesn't match our expected format.</p>
        
        <div class="error-example">
          <p>Example of a valid order ID:</p>
          <div class="example-id">NE012345ABCDEF</div>
        </div>
        
        <div class="error-actions">
          <button class="action-button secondary" onclick="reEnterId(event, this)">
            <svg viewBox="0 0 24 24">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Edit Order ID
          </button>
          <button class="action-button primary" onclick="toCont()">
            <svg viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            Contact Support
          </button>
        </div>
      </div>
    `;
    orderInput.classList.add('input-error');
    document.getElementById('container').style.display = 'none';
    return;
  }
  orderInput.classList.remove('input-error');

  renderOrder(refinedID);
}

const reEnterId = (event, t) => {
  document.getElementById('container').style.display = 'block';
  document.getElementById('orderInput').focus();
  t.style.display = 'none'
  console.log(event)
}

const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('order-id');
if (orderId) {
  document.getElementById('container').style.display = 'none';
  renderOrder(refineOrderID(orderId));
  document.getElementById('loading-overlay').style.display = 'none';
} else {
  document.getElementById('loading-overlay').style.display = 'none';
}
