const sidebarToggle = document.createElement("div");
sidebarToggle.className = "sidebar-toggle";
sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".main-header").prepend(sidebarToggle);

sidebarToggle.addEventListener("click", function () {
    const container = document.querySelector(".dashboard-container");
    container.classList.toggle("sidebar-collapsed");
});

const searchInput = document.getElementById('search-users');
const sortBySelect = document.getElementById('sort-by');
const filterDateSelect = document.getElementById('filter-date');
const resetFiltersBtn = document.getElementById('reset-filters');
const usersTableBody = document.getElementById('users-table-body');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfoSpan = document.getElementById('page-info');

toggleDivLoader('users-table', 'table', 'loading-overlay', true)

let users = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 10;
let currentSort = 'aplphabeticals';
let currentDateFilter = 'all';

fetchUsers();

searchInput.addEventListener('input', filterUsers);
sortBySelect.addEventListener('change', handleSortChange);
filterDateSelect.addEventListener('change', handleDateFilterChange);
resetFiltersBtn.addEventListener('click', resetFilters);
prevPageBtn.addEventListener('click', goToPreviousPage);
nextPageBtn.addEventListener('click', goToNextPage);

async function fetchUsers() {
    const CACHE_KEY = 'usersData';
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            users = JSON.parse(cached);
            filteredUsers = [...users];
            resetFilters();
            updatePagination();
        }

        const res = await fetch('/api/admin/users');
        const processed = (await res.json()).map(user => ({
            ...user,
            initials: getInitials(user.fullName),
            lastActiveText: getLastActiveText(user.lastLoggedIn)
        }));

        if (cached && JSON.stringify(processed) !== cached) {
            notify('New users available!', 'info', () => location.reload());
        }

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(processed));
        users = processed;
        filteredUsers = [...processed];
        resetFilters();
        updatePagination();
    } catch (err) {
        console.error('Fetch users error:', err);
    }
}

function renderUsers() {
    usersTableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, filteredUsers.length);
    const usersToDisplay = filteredUsers.slice(startIndex, endIndex);

    if (usersToDisplay.length === 0) {
        usersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-users">No users found</td>
                </tr>
            `;
        return;
    }

    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td class="user-avatar">
                    <div class="avatar">
                        <span>${user.initials}</span>
                    </div>
                    <div class="user-info">
                        <span class="user-name">${user.fullName}</span>
                    </div>
                </td>
                <td>
                    <span class="contact-phone">${user.email}</span>
                </td>
                <td>
                    <div class="contact-phone">${user.phoneNumber}</div>
                </td>
                <td>
                    <div class="contact-phone">${user.address}</div>
                </td>
                <td>${formatDate(user.joinedOn)}</td>
                <td>
                    <div class="last-active">${user.lastActiveText}</div>
                </td>
                <td class="actions">
                    <button class="btn-icon btn-delete" title="Delete" data-id="${user.email}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        usersTableBody.appendChild(row);
    });

    document.getElementById('users-count').textContent = `${filteredUsers.length} users found`;
    toggleDivLoader('users-table', 'table', 'loading-overlay', false)
}

function confirmDeleteUser(userEmail) {
    if (confirm('Are you sure you want to delete this user?')) {
        console.log(`Deleting user with email: ${userEmail}`);
        alert(`User ${userEmail} would be deleted in a real implementation`);
    }
}

function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();

    filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.split('@')[0].toLowerCase().includes(searchTerm) ||
        user.phoneNumber.toLowerCase().includes(searchTerm)
    );

    currentPage = 1;
    renderUsers();
    updatePagination();
}

function handleSortChange(e) {
    currentSort = e.target.value;

    switch (currentSort) {
        case 'aplphabetical':
            filteredUsers.sort((a, b) => a.fullName.localeCompare(b.fullName));
            break;
        case "old-to-new":
            filteredUsers.sort((a, b) => new Date(a.joinedOn) - new Date(b.joinedOn));
            break;
        default:
            filteredUsers.sort((a, b) => new Date(b.joinedOn) - new Date(a.joinedOn));
    }

    currentPage = 1;
    renderUsers();
    updatePagination();
}

function handleDateFilterChange(e) {
    currentDateFilter = e.target.value;
    const now = new Date();

    filteredUsers = users.filter(user => {
        const joinedDate = new Date(user.joinedOn);

        switch (currentDateFilter) {
            case 'today':
                return isSameDay(joinedDate, now);
            case 'week':
                return isSameWeek(joinedDate, now);
            case 'month':
                return isSameMonth(joinedDate, now);
            default:
                return true;
        }
    });

    currentPage = 1;
    renderUsers();
    updatePagination();
}

function resetFilters() {
    searchInput.value = '';
    sortBySelect.value = 'aplphabetical';
    filterDateSelect.value = 'all';
    currentSort = 'aplphabetical';
    currentDateFilter = 'all';
    filteredUsers = [...users];
    currentPage = 1;
    renderUsers();
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderUsers();
        updatePagination();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        renderUsers();
        updatePagination();
    }
}

function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
}

function getLastActiveText(lastLoggedIn) {
    const lastActiveDate = new Date(lastLoggedIn);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} Minutes Ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} Hours Ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} Days Ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} Weeks Ago`;

    return formatDate(lastLoggedIn);
}

function formatLastActiveDetailed(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function isSameWeek(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays < 7 && date1.getDay() <= date2.getDay();
}

function isSameMonth(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth();
}