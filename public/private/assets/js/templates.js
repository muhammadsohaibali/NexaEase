const HeaderTemplate = (username, email, joinedon, orders, Wishlist = 0) => {
    return `
        <div class="wrapper top-header">
            <div class="wrapper-item">
                <div class="info-username">${username}</div>
                <div class="info-email">${email}</div>
                <div class="info-joinedon">Joined On: ${joinedon}</div>
                <div class="info-joinedon">
                    <a href="/auth/edit" class="edit-acc">
                        <span>Edit Account</span>
                        <i style="margin: auto 3px;" class='bx bx-edit'></i>
                    </a>
                </div>
                <div class="platform-info">
                    <div class="profile-stats">
                        <div class="stat-item">
                            <strong>Orders:</strong> ${orders}
                        </div>
                        <div class="stat-item">
                            <strong>Wishlist:</strong> ${Wishlist}
                        </div>
                    </div>
                </div>
            </div>
            <div class="wrapper-item" style="display: block;">
                <a href="#" id="logoutBtn" class="logout-anchor">
                    Logout
                    <i style="margin: auto 3px;" class='bx bx-log-out bx-rotate-180'></i>
                </a>
            </div>
        </div>
    `
}

function orderDetails(order) {
    return `
    <div class="order-item">
        <span><p><strong>Order #:</strong> ${order.orderNumber}</p> <p><a href=/order/track/?order-id=${order.orderNumber}'>View Order</a><i class='bx bx-link-external'></i> </p></span>
        <p><strong>Total:</strong> $${order.total}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Placed On:</strong> ${order.createdAt.split('at')[0].trim()}</p>
        <details>
            <summary>View Items</summary>
            <div class="order-items">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.price}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </details>
    </div>`;
}
