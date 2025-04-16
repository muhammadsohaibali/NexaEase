function toggleLoader(show) {
    document.getElementById("loading-overlay").style.display = show ? "flex" : "none";
}

async function logoutUser(event) {
    event.preventDefault();
    try {
        await fetch("/api/logout", {
            method: "POST",
            credentials: "include",
        });
        window.location.href = "/";
    } finally {
        console.log("logged Out")
    }
}

async function fetchUserProfile() {
    try {
        const response = await fetch("/api/me/info", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json", },
        });
        const data = await response.json();
        return data
    } catch (err) {
        console.error("Request Failed:", err);
    }
}

async function getOrderHistory() {
    try {
        const response = await fetch("/api/orders/user", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data
    } catch (err) {
        console.error("Request Failed:", err);
    }
}

async function fetchUserOrders() {
    const ordersList = document.getElementById("orders-list");
    const viewAllBtn = document.getElementById("view-all-orders");
    try {
        const response = await fetch("/api/orders/user");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch orders");
        ordersList.innerHTML = "";
        if (data.orders.length === 0) {
            ordersList.innerHTML = "<p>No orders found.</p>";
            return;
        }
        const totalOrders = data.orders.length;
        const displayCount = Math.max(1, Math.ceil(totalOrders * 0.1));
        let isExpanded = false;
        const parseDate = (dateStr) => {
            const parts = dateStr.match(/(\d+) (\w+) (\d+) at (\d+):(\d+):(\d+).(\d+)/);
            if (!parts) return new Date(0);
            const [_, day, month, year, hour, min, sec, ms] = parts;
            const monthIndex = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ].indexOf(month);
            return new Date(year, monthIndex, day, hour, min, sec, ms);
        };
        const sortedOrders = [...data.orders].sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
        ordersList.innerHTML = sortedOrders.slice(0, displayCount).map(order => orderDetails(order)).join("");
        if (totalOrders > displayCount) viewAllBtn.style.display = "block";
        viewAllBtn.onclick = function () {
            if (!isExpanded) {
                ordersList.innerHTML = sortedOrders.map(order => orderDetails(order)).join("");
                viewAllBtn.innerText = "Show Less";
            } else {
                ordersList.innerHTML = sortedOrders.slice(0, displayCount).map(order => orderDetails(order)).join("");
                viewAllBtn.innerText = "View All";
            }
            isExpanded = !isExpanded;
        };
    } catch (error) {
        console.log(error.message);
        error.message === 'No orders found for this user' && (ordersList.innerHTML = "<p>No orders found</p>");
    }
}

function renderHead({ fullName, email, joinedOn }, orders) {
    document.getElementById('container-auth').innerHTML = '';
    document.getElementById('container-auth').innerHTML = HeaderTemplate(fullName, email, joinedOn, orders);
}

document.addEventListener("DOMContentLoaded", async () => {
    renderHead(await fetchUserProfile(), (await getOrderHistory())?.orders?.length || 0);
    await fetchUserOrders();
    document.getElementById("logoutBtn").addEventListener("click", logoutUser);
    toggleLoader(false);
});

