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
        const response = await fetch("/api/me/profile", {
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

async function restoreSession() {
    try {
        const response = await fetch("/api/session/restore", {
            method: "GET",
            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Session Restored");
        } else {
            console.log("No Active Session.");
        }
    } catch (err) {
        console.error("Error restoring session:", err);
    }
}

function renderHead({ name, email, joinedon }, orders) {
    document.getElementById('container-auth').innerHTML = '';
    document.getElementById('container-auth').innerHTML = HeaderTemplate(name, email, joinedon, orders);
}

document.addEventListener("DOMContentLoaded", async () => {
    restoreSession().finally(async () => {
        renderHead(await fetchUserProfile(), (await getOrderHistory()).orders.length);
        document.getElementById("logoutBtn").addEventListener("click", logoutUser);
        toggleLoader(false);
    })

});

