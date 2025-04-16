const sidebarToggle = document.createElement("div");
sidebarToggle.className = "sidebar-toggle";
sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".main-header").prepend(sidebarToggle);

sidebarToggle.addEventListener("click", function () {
    const container = document.querySelector(".dashboard-container");
    container.classList.toggle("sidebar-collapsed");
});

toggleDivLoader('dashboard', 'block', 'loading-overlay', true)

document.addEventListener("DOMContentLoaded", function () {
    let salesChart;
    let fetchedData;

    const API = {
        dashboard: "/api/admin/dashboard",
        sales: "/api/admin/sales",
        products: "/api/admin/products",
        orders: "/api/admin/orders",
    };

    async function fetchDashboardData() {
        const CACHE_KEY = 'dashboardData';
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const { data } = JSON.parse(cachedData);
            fetchFreshData();
            fetchedData = data;
            return;
        }
        fetchedData = await fetchFreshData();
        return;
    }

    async function fetchFreshData() {
        const CACHE_KEY = 'dashboardData';

        try {
            const response = await fetch(API.dashboard);
            if (!response.ok) throw new Error('Network response was not ok');
            const freshData = await response.json();
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const { data: oldData } = JSON.parse(cachedData);
                const isDataDifferent = JSON.stringify(oldData) !== JSON.stringify(freshData);
                if (isDataDifferent)
                    notify('New data available! Click to refresh', 'info', () => location.reload());
            }

            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: freshData
            }));

            return freshData;
        } catch (error) {
            console.error('Background data refresh failed:', error);
            return null;
        }
    }

    async function updateStatsCards() {
        const data = fetchedData;

        const cards = document.querySelectorAll(".stats-cards .card");
        cards[0].querySelector("h3").textContent = `Rs ${data.revenue.toLocaleString()}`;
        cards[1].querySelector("h3").textContent = data.ordersCount.toLocaleString();
        cards[2].querySelector("h3").textContent = data.usersCount.toLocaleString();
        cards[3].querySelector("h3").textContent = data.productsCount.toLocaleString();

        cards[1].onclick = () => location.assign('/admin/orders');
        cards[2].onclick = () => location.assign('/admin/customers');
        cards[3].onclick = () => location.assign('/admin/products');
    }

    async function fetchSalesData(timeframe = "monthly") {
        const dashboardData = fetchedData;
        const orders = dashboardData.recentOrders || [];
        const completedOrders = orders.filter(order => order.status === 'completed');
        const salesByPeriod = {};
        const today = new Date();
        let monthName;

        switch (timeframe.toLowerCase()) {
            case "yearly":
                for (let month = 0; month < 12; month++) {
                    const monthName = new Date(today.getFullYear(), month, 1).toLocaleString('default', { month: 'long' });
                    const periodKey = `${monthName} ${today.getFullYear()}`;
                    salesByPeriod[periodKey] = 0;
                }
                break;
            case "monthly":
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                monthName = today.toLocaleString('default', { month: 'long' });
                for (let day = 1; day <= daysInMonth; day++) {
                    const periodKey = `${day} ${monthName}`;
                    salesByPeriod[periodKey] = 0;
                }
                break;
            case "daily":
            default:
                const day = today.getDate();
                monthName = today.toLocaleString('default', { month: 'long' });
                const year = today.getFullYear();
                for (let hour = 0; hour < 24; hour++) {
                    const periodKey = `${day} ${monthName} ${year} at ${hour.toString().padStart(2, '0')}:00`;
                    salesByPeriod[periodKey] = 0;
                }
        }

        completedOrders.forEach(order => {
            if (!order.createdAt) return;

            const [datePart] = order.createdAt.split(' at ');
            const [day, month, year] = datePart.split(' ');
            const orderDate = new Date(order.createdAt.replace(" at ", " "));

            let includeOrder = false;
            let periodKey;

            switch (timeframe.toLowerCase()) {
                case "yearly":
                    if (orderDate.getFullYear() === today.getFullYear()) {
                        const monthName = orderDate.toLocaleString('default', { month: 'long' });
                        periodKey = `${monthName} ${year}`;
                        includeOrder = true;
                    }
                    break;
                case "monthly":
                    if (orderDate.getFullYear() === today.getFullYear() &&
                        orderDate.getMonth() === today.getMonth()) {
                        const monthName = orderDate.toLocaleString('default', { month: 'long' });
                        periodKey = `${orderDate.getDate()} ${monthName}`;
                        includeOrder = true;
                    }
                    break;
                case "daily":
                default:
                    if (orderDate.toDateString() === today.toDateString()) {
                        const day = orderDate.getDate();
                        const monthName = orderDate.toLocaleString('default', { month: 'long' });
                        const year = orderDate.getFullYear();
                        const hours = orderDate.getHours().toString().padStart(2, '0');
                        const minutes = orderDate.getMinutes().toString().padStart(2, '0');
                        periodKey = `${day} ${monthName} ${year} at ${hours}:${minutes}`;
                        includeOrder = true;
                    }
            }

            if (includeOrder)
                salesByPeriod[periodKey] = (salesByPeriod[periodKey] || 0) + (order.total || 0);

        });

        const result = Object.entries(salesByPeriod)
            .map(([period, amount]) => ({ period, amount }))
            .sort((a, b) => {
                if (timeframe.toLowerCase() === "daily") {
                    return new Date(a.period.replace(' at ', ' ')) - new Date(b.period.replace(' at ', ' '));
                }
                return new Date(a.period) - new Date(b.period);
            });

        if (timeframe.toLowerCase() === "daily") {
            const hourlyData = {};
            result.forEach(item => {
                const hour = item.period.split(' at ')[1].split(':')[0] + ':00';
                const datePart = item.period.split(' at ')[0];
                const hourKey = `${datePart} at ${hour}`;
                hourlyData[hourKey] = (hourlyData[hourKey] || 0) + item.amount;
            });

            return Object.entries(hourlyData)
                .map(([period, amount]) => ({ period, amount }))
                .sort((a, b) => new Date(a.period.replace(' at ', ' ')) - new Date(b.period.replace(' at ', ' ')));
        }
        return result;
    }

    async function updateSalesChart(timeframe = "monthly") {
        try {
            const salesData = await fetchSalesData(timeframe);
            const canvas = document.getElementById("salesChart");

            if (!canvas) {
                console.error("Canvas element not found!");
                return;
            }

            const ctx = canvas.getContext("2d");
            if (salesChart) salesChart.destroy()

            if (salesData.length === 0) {
                console.warn("No data available for chart");
                canvas.style.display = "none";
                return;
            } else {
                canvas.style.display = "block";
            }

            let labels = salesData.map(item => item.period);
            let datasetLabel = `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Revenue`;

            if (timeframe.toLowerCase() === "daily") {
                datasetLabel = "Today's Revenue by Order";
            } else if (timeframe.toLowerCase() === "monthly") {
                datasetLabel = "This Month's Revenue by Day";
            } else if (timeframe.toLowerCase() === "yearly") {
                datasetLabel = "This Year's Revenue by Month";
            }

            salesChart = new Chart(ctx, {
                type: timeframe.toLowerCase() === "daily" ? "bar" : "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: datasetLabel,
                        data: salesData.map(item => item.amount),
                        borderColor: "#4f46e5",
                        backgroundColor: timeframe.toLowerCase() === "daily" ?
                            "#4f46e5" : "rgba(79, 70, 229, 0.1)",
                        borderWidth: 3,
                        tension: 0.4,
                        fill: timeframe.toLowerCase() !== "daily",
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `Rs ${context.parsed.y.toLocaleString()}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: (value) => 'Rs ' + value.toLocaleString()
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                autoSkip: true,
                                maxRotation: timeframe.toLowerCase() === "daily" ? 0 : 45,
                                minRotation: timeframe.toLowerCase() === "daily" ? 0 : 45
                            }
                        }
                    },
                    animation: {
                        duration: 1000
                    }
                }
            });
        } catch (error) {
            console.error("Error creating chart:", error);
        }
    }

    let chartUpdateTimeout;
    document.querySelector(".time-filter select").addEventListener("change", function () {
        clearTimeout(chartUpdateTimeout);
        chartUpdateTimeout = setTimeout(() => {
            updateSalesChart(this.value.toLowerCase());
        }, 300);
    });

    (async function initDashboard() {
        await fetchDashboardData();
        updateStatsCards();
        updateSalesChart("monthly");
    })();

    const formatTitle = str => str
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    async function updateRecentProducts() {
        const data = fetchedData
        const productsContainer = document.querySelector(".small-card .card-body");
        productsContainer.innerHTML = "";

        data.recentProducts.forEach((product, index) => {
            const productItem = document.createElement("div");
            productItem.className = "product-item";
            productItem.onclick = () => location.assign(`/admin/products/?querry=${product.product_id}`)
            productItem.innerHTML = `
                <div class="product-rank">${index + 1}</div>
                <img src="${product.imgs[0] || 'https://via.placeholder.com/40'}" alt="${product.product_name}" />
                <div class="product-info">
                    <h4>${product.product_name}</h4>
                    <p>${formatTitle(product.category) || 'No category'}</p>
                </div>
                <div class="product-sales">Rs ${(product.discounted_price ?? product.regular_price).toLocaleString()}</div>
            `;
            productsContainer.appendChild(productItem);
        });
    }

    async function updateRecentOrders() {
        const data = fetchedData
        const ordersTable = document.querySelector(".orders-table tbody");
        ordersTable.innerHTML = "";

        data.recentOrders.slice(0, 5).forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><a target='_blank' href='/admin/orders/?querry=${order.orderNumber}'>${order.orderNumber}</a></td>
                <td>
                    ${order.username}
                </td>
                <td>${order.createdAt.split('at')[0].trim()}</td>
                <td>Rs ${(order.total).toLocaleString()}</td>
                <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
                <td>
                    <button class="btn-icon">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            ordersTable.appendChild(row);
        });
    }

    async function initDashboard() {
        try {
            await fetchDashboardData();
            updateStatsCards();
            updateSalesChart();
            updateRecentProducts();
            updateRecentOrders();
        } finally {
            toggleDivLoader('dashboard', 'block', 'loading-overlay', false)
        }
    }
    initDashboard();
});