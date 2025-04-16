const sidebarToggle = document.createElement("div");
sidebarToggle.className = "sidebar-toggle";
sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".main-header").prepend(sidebarToggle);

sidebarToggle.addEventListener("click", function () {
    const container = document.querySelector(".dashboard-container");
    container.classList.toggle("sidebar-collapsed");
});


document.addEventListener('DOMContentLoaded', function () {
    const contactsTableBody = document.getElementById('contacts-table-body');
    const loadingOverlay = document.getElementById('loading-overlay');
    const contactsTableDiv = document.getElementById('contacts-table-div');
    const contactsCount = document.getElementById('contacts-count');
    const searchInput = document.getElementById('search-contacts');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const contactModal = document.getElementById('contact-modal');
    const closeModalBtn = document.querySelector('.close-modal');

    const urlParams = new URLSearchParams(window.location.search);
    const querryEmail = urlParams.get('querry');

    let urlEmail;
    if (querryEmail) urlEmail = querryEmail

    let contacts = [];
    let filteredContacts = [];
    let currentPage = 1;
    const itemsPerPage = 10;

    loadContacts();

    searchInput.addEventListener('input', filterContacts);
    document.getElementById('filter-date').addEventListener('change', filterContacts);
    document.getElementById('filter-user-type').addEventListener('change', filterContacts);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    closeModalBtn.addEventListener('click', closeModal);
    document.getElementById('export-contacts').addEventListener('click', exportContacts);

    async function loadContacts() {
        showLoading();
        const CACHE_KEY = 'contactsData';

        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            contacts = JSON.parse(cached);
            filteredContacts = [...contacts];
            filterContacts();
            updatePagination();
            hideLoading();
        }

        try {
            const response = await fetch('/api/admin/contacts');
            if (!response.ok) throw new Error('Failed to fetch contacts');

            const freshContacts = await response.json();

            if (cached && JSON.stringify(freshContacts) !== cached) {
                notify('New contacts available!', 'info', () => location.reload());
            }

            sessionStorage.setItem(CACHE_KEY, JSON.stringify(freshContacts));
            contacts = freshContacts;
            filteredContacts = [...freshContacts];
            filterContacts();
            updatePagination();
        } catch (error) {
            console.error('Error loading contacts:', error);
            if (!cached) contacts = [];
        } finally {
            hideLoading();
        }
    }

    function renderContacts() {
        contactsTableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

        if (paginatedContacts.length === 0) {
            contactsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-results">No contacts found</td>
                </tr>
            `;
            return;
        }

        paginatedContacts.forEach(contact => {
            const lastMessage = contact.forms[0];
            const lastSubmitted = new Date(lastMessage.submittedOn).toLocaleString();
            const messagesCount = contact.forms.length;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="contact-messages-count">${messagesCount}</span></td>
                <td>${contact.name || 'N/A'}</td>
                <td>${contact.email.split('@')[0]}</td>
                <td>${contact.number || 'N/A'}</td>
                <td>${lastSubmitted}</td>
                <td>
                    <span class="user-type-badge ${contact.isUser ? 'registered-user' : 'guest-user'}">
                        ${contact.isUser ? 'User' : 'Guest'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-text view-contact" data-id="${contact.email}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;

            contactsTableBody.appendChild(row);
        });

        document.querySelectorAll('.view-contact').forEach(btn => {
            btn.addEventListener('click', () => viewContactDetails(btn.dataset.id));
            console.log(btn.dataset.id)
        });

        contactsCount.textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, filteredContacts.length)} of ${contacts.length} contacts`;
    }

    function filterContacts() {
        const dateFilter = document.getElementById('filter-date').value;
        const userTypeFilter = document.getElementById('filter-user-type').value;
        let searchTerm = searchInput.value.toLowerCase();

        filteredContacts = contacts.filter(contact => {
            if (urlEmail) {
                searchTerm = urlEmail.toLowerCase()
                searchInput.value = urlEmail
                viewContactDetails(urlEmail)
                urlEmail = null
            }

            if (searchTerm &&
                !contact.name.toLowerCase().includes(searchTerm) &&
                !contact.email.toLowerCase().includes(searchTerm) &&
                !(contact.number && contact.number.includes(searchTerm))) {
                return false;
            }

            if (userTypeFilter === 'registered' && !contact.isUser) return false;
            if (userTypeFilter === 'guest' && contact.isUser) return false;

            if (dateFilter !== 'all') {
                const now = new Date();
                const lastSubmitted = new Date(contact.forms[0].submittedOn);

                switch (dateFilter) {
                    case 'today':
                        if (!isSameDay(lastSubmitted, now)) return false;
                        break;
                    case 'yesterday':
                        const yesterday = new Date(now);
                        yesterday.setDate(yesterday.getDate() - 1);
                        if (!isSameDay(lastSubmitted, yesterday)) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        if (lastSubmitted < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        if (lastSubmitted < monthAgo) return false;
                        break;
                }
            }
            return true;
        });

        currentPage = 1;
        renderContacts();
        updatePagination();
    }

    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    function resetFilters() {
        document.getElementById('filter-date').value = 'all';
        document.getElementById('filter-user-type').value = 'all';
        searchInput.value = '';
        filterContacts();
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderContacts();
            updatePagination();
        }
    }

    function goToNextPage() {
        const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderContacts();
            updatePagination();
        }
    }

    function viewContactDetails(email) {
        const contact = contacts.find(c => c.email || c.email.split('@')[0] === email);
        if (!contact) return;

        document.getElementById('modal-contact-name').textContent = contact.name || 'Unknown';
        document.getElementById('modal-contact-email').textContent = contact.email;
        document.getElementById('modal-contact-phone').textContent = contact.number || 'N/A';
        document.getElementById('modal-contact-type').textContent = contact.isUser ? 'Registered User' : 'Guest User';
        document.getElementById('modal-contact-count').textContent = contact.forms.length;

        const messagesList = document.getElementById('contact-messages-list');
        messagesList.innerHTML = '';

        contact.forms.forEach(form => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';

            const date = new Date(form.submittedOn).toLocaleString();
            messageItem.innerHTML = `
                <div class="message-date">${date}</div>
                <div class="message-content">${form.message}</div>
            `;

            messagesList.appendChild(messageItem);
        });

        contactModal.style.display = 'flex';
        contactModal.style.visibility = 'visible';
        contactModal.style.opacity = '1';
    }

    function closeModal() {
        contactModal.style.display = 'none';
    }

    function exportContacts() {
        alert('Export functionality would generate a CSV file with all filtered contacts');
    }

    function showLoading() {
        loadingOverlay.style.display = 'flex';
        contactsTableDiv.style.display = 'none';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
        contactsTableDiv.style.display = 'block';
    }

    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            closeModal();
        }
    });
});
