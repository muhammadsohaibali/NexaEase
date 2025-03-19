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