const sidebarToggle = document.createElement("div");
sidebarToggle.className = "sidebar-toggle";
sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".main-header").prepend(sidebarToggle);

sidebarToggle.addEventListener("click", function () {
    const container = document.querySelector(".dashboard-container");
    container.classList.toggle("sidebar-collapsed");
});


document.addEventListener('DOMContentLoaded', function async() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-spinner"></div>
        <div class="loader-text">Loading orders...</div>
    `;
    document.body.appendChild(loader);

    const ordersTable = document.querySelector('.orders-table tbody');
    const searchInput = document.querySelector('.search-box input');
    const statusFilter = document.querySelectorAll('.filters-section select')[0];
    const dateFilter = document.querySelectorAll('.filters-section select')[1];
    const sortFilter = document.querySelectorAll('.filters-section select')[2];
    const resetBtn = document.querySelector('.filters-section .btn-text');
    const exportBtn = document.querySelector('.quick-actions .btn-primary');
    const showingCount = document.querySelector('.card-header span');

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('querry');

    let urlOrderId;
    if (orderId) urlOrderId = orderId

    let allOrders = [];
    let filteredOrders = [];

    async function init() {
        showLoader();
        try {
            await fetchOrders();
            renderOrders(allOrders);
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing orders page:', error);
        } finally {
            hideLoader();
        }
    }

    async function fetchOrders() {
        const CACHE_KEY = 'ordersData';

        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            allOrders = JSON.parse(cached);
            filteredOrders = [...allOrders];

            fetchFreshOrders();
            return;
        }

        return await fetchFreshOrders();
    }

    async function fetchFreshOrders() {
        const CACHE_KEY = 'ordersData';

        try {
            const response = await fetch('/api/admin/orders');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const processedOrders = data.map(order => ({
                ...order,
                createdAt: parseCustomDate(order.createdAt),
                formattedDate: formatDate(order.createdAt.split('at')[0].trim()),
                formattedTotal: formatCurrency(order.total),
                statusClass: getStatusClass(order.status),
                displayStatus: capitalizeFirstLetter(order.status)
            }));

            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached && JSON.stringify(processedOrders) !== cached) {
                notify('New orders available!', 'info', () => location.reload());
            }

            sessionStorage.setItem(CACHE_KEY, JSON.stringify(processedOrders));
            allOrders = processedOrders;
            filteredOrders = [...processedOrders];

            return processedOrders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    function parseCustomDate(dateString) {
        const parts = dateString.split(' at ');
        if (parts.length === 2) return new Date(parts[0]);
        return new Date(dateString);
    }

    function renderOrders(orders) {
        ordersTable.innerHTML = '';

        if (orders.length === 0) {
            ordersTable.innerHTML = `
                <tr>
                    <td colspan="7" class="no-orders">No orders found matching your criteria</td>
                </tr>
            `;
            showingCount.textContent = 'Showing 0 orders';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a>${order.orderNumber}</a></td>
                <td>
                    <div class="customer-info">
                        <div class="customer-avatar">${getInitials(order.username)}</div>
                        <div>
                            <div class="customer-name">${order.username}</div>
                            <div class="customer-email">${order.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="order-items-preview">
                        ${renderOrderItemsPreview(order.items)}
                        ${order.items.length > 2 ? `<div class="order-items-count">+${order.items.length - 2}</div>` : ''}
                    </div>
                </td>
                <td>${order.formattedDate}</td>
                <td>${order.formattedTotal}</td>
                <td><span class="status-badge ${order.statusClass}">${order.displayStatus}</span></td>
                <td>
                    <div class="order-actions">
                        <button class="action-btn" title="View" data-order-id="${order.orderNumber}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" title="Edit" data-order-id="${order.orderNumber}">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            ordersTable.appendChild(row);
        });

        showingCount.textContent = `Showing ${orders.length} of ${allOrders.length} orders`;
    }

    function renderOrderItemsPreview(items) {
        const visibleItems = items.slice(0, 2);
        return visibleItems.map(item => `
            <div class="order-item-thumb">
                <img src="${item.img}" alt="${item.product_name}" onerror="this.src='https://via.placeholder.com/40'">
            </div>
        `).join('');
    }

    function setupEventListeners() {
        searchInput.addEventListener('input', debounce(() => {
            applyFilters();
        }, 300));

        statusFilter.addEventListener('change', applyFilters);
        dateFilter.addEventListener('change', applyFilters);
        sortFilter.addEventListener('change', applyFilters);

        resetBtn.addEventListener('click', resetFilters);

        exportBtn.addEventListener('click', exportOrders);

        ordersTable.addEventListener('click', function (e) {
            const actionBtn = e.target.closest('.action-btn');
            if (!actionBtn) return;

            const orderId = actionBtn.dataset.orderId;
            const action = actionBtn.title.toLowerCase();

            if (action === 'view') {
                viewOrderDetails(orderId);
            } else if (action === 'edit') {
                editOrder(orderId);
            }
        });
    }

    function applyFilters() {
        let filtered = [...allOrders];

        const statusValue = statusFilter.value;
        if (statusValue !== 'All Statuses') {
            filtered = filtered.filter(order => order.displayStatus.toLowerCase() === statusValue.toLowerCase());
        }

        const dateValue = dateFilter.value;
        if (dateValue !== 'All Time') {
            const now = new Date();
            let startDate;

            switch (dateValue) {
                case 'Today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'Yesterday':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 1);
                    filtered = filtered.filter(order =>
                        order.createdAt >= startDate && order.createdAt < endDate
                    );
                    break;
                case 'Last 7 Days':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'Last 30 Days':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 30);
                    break;
            }

            if (dateValue !== 'Yesterday') {
                filtered = filtered.filter(order => order.createdAt >= startDate);
            }
        }

        let searchTerm = searchInput.value.toLowerCase();

        if (urlOrderId) {
            searchTerm = urlOrderId.toLowerCase()
            searchInput.value = urlOrderId
            urlOrderId = null
        }

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(searchTerm) ||
                order.username.toLowerCase().includes(searchTerm) ||
                order.email.toLowerCase().includes(searchTerm)
            );
        }

        const sortValue = sortFilter.value;
        switch (sortValue) {
            case 'Newest First':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'Oldest First':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'Total: Low to High':
                filtered.sort((a, b) => a.total - b.total);
                break;
            case 'Total: High to Low':
                filtered.sort((a, b) => b.total - a.total);
                break;
        }

        filteredOrders = filtered;
        renderOrders(filteredOrders);
    }

    function resetFilters() {
        searchInput.value = '';
        statusFilter.value = 'All Statuses';
        dateFilter.value = 'All Time';
        sortFilter.value = 'Newest First';
        applyFilters();
    }

    function viewOrderDetails(orderId) {
        const order = allOrders.find(o => o.orderNumber === orderId);
        if (!order) return;

        console.log('Viewing order:', order);
    }

    function editOrder(orderId) {
        const order = allOrders.find(o => o.orderNumber === orderId);
        if (!order) return;

        console.log('Editing order:', order);
    }

    function exportOrders() {
        console.log('Exporting orders:', filteredOrders);
    }

    function formatDate(dateString) {
        const dateParts = dateString.split(' ');
        if (dateParts.length !== 3) {
            console.error('Invalid date format:', dateString);
            return dateString;
        }

        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];

        const date = new Date(`${month} ${day}, ${year}`);

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatCurrency(amount) {
        return 'Rs ' + amount.toLocaleString('en-PK', { minimumFractionDigits: 0 });
    }

    function getStatusClass(status) {
        return `status-${status.toLowerCase()}`;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }

    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function showLoader() {
        loader.style.display = 'flex';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    init().then(() => toggleDivLoader('orders-table-div', 'block', 'loading-overlay', false))
});