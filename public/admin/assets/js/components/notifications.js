document.addEventListener('DOMContentLoaded', function () {
    const notificationIcon = document.querySelector('.notification-icon');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationList = document.getElementById('notificationList');
    const notificationCount = document.getElementById('notificationCount');
    const clearAllBtn = document.getElementById('clearAllNotifications');

    let currentData = {
        recentOrders: [],
        recentContacts: []
    };
    let previousData = {
        recentOrders: [],
        recentContacts: []
    };
    let notifications = [];

    notificationIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        notificationDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function () {
        notificationDropdown.classList.remove('show');
    });

    clearAllBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        notifications = [];
        updateNotificationUI();
        saveCurrentDataAsPrevious();
    });

    async function fetchData() {
        try {
            const response = await fetch('/api/admin/dashboard');
            const data = await response.json();

            currentData = {
                recentOrders: data.recentOrders || [],
                recentContacts: []
            };

            const contactsResponse = await fetch('/api/admin/contacts');
            const contactsData = await contactsResponse.json();
            currentData.recentContacts = contactsData || [];

            const prevResponse = await fetch('/api/admin/variables/notifications');
            const prevData = await prevResponse.json();

            if (prevData) {
                previousData = {
                    recentOrders: prevData.recentOrders || [],
                    contactMessages: prevData.contactMessages || []
                };
            }

            findNewNotifications();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function findNewNotifications() {
        notifications = [];

        const newOrders = currentData.recentOrders.filter(order =>
            !previousData.recentOrders.some(prevOrder => prevOrder.orderNumber === order.orderNumber)
        );

        newOrders.forEach(order => {
            notifications.push({
                type: 'new-order',
                title: 'New Order',
                orderNumber: order.orderNumber,
                message: `Order #${order.orderNumber} received`,
                time: order.createdAt,
                data: order,
                read: false
            });
        });

        const allMessages = [];
        currentData.recentContacts.forEach(contact => {
            contact.forms.forEach(form => {
                allMessages.push({
                    submittedOn: form.submittedOn,
                    message: form.message,
                    name: contact.name,
                    email: contact.email,
                    number: contact.number
                });
            });
        });

        const newMessages = allMessages.filter(message =>
            !previousData.contactMessages.includes(message.submittedOn)
        );

        newMessages.forEach(msg => {
            notifications.push({
                type: 'new-contact',
                title: 'New Contact Message',
                message: `New message from ${msg.name}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`,
                time: formatTimestamp(msg.submittedOn),
                data: msg,
                read: false
            });
        });

        currentData.contactMessages = allMessages.map(msg => msg.submittedOn);

        const cancelledOrders = currentData.recentOrders.filter(order =>
            order.status.toLowerCase() === 'cancelled' &&
            !previousData.recentOrders.some(prevOrder =>
                prevOrder.orderNumber === order.orderNumber &&
                prevOrder.status.toLowerCase() === 'cancelled'
            )
        );

        cancelledOrders.forEach(order => {
            notifications.push({
                type: 'cancelled-order',
                title: 'Order Cancelled',
                message: `Order #${order.orderNumber} was cancelled`,
                time: order.createdAt,
                data: order,
                read: false
            });
        });

        updateNotificationUI();
    }

    function formatTimestamp(timestamp) {
        const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
        return date.toLocaleString();
    }

    function updateNotificationUI() {
        const unreadCount = notifications.filter(n => !n.read).length;
        notificationCount.textContent = unreadCount;
        notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';

        if (notifications.length === 0) {
            notificationList.innerHTML = '<li class="empty-notifications">No new notifications</li>';
            return;
        }

        notificationList.innerHTML = '';
        notifications.forEach(notification => {
            const li = document.createElement('li');
            li.className = `notification-item ${notification.type} ${notification.read ? '' : 'unread'}`;

            let iconClass, href;
            switch (notification.type) {
                case 'new-order':
                    iconClass = 'fas fa-shopping-cart';
                    href = `'/admin/orders/?querry=${notification.orderNumber}'`
                    break;
                case 'new-contact':
                    iconClass = 'fas fa-envelope';
                    href = `'/admin/contacts/?querry=${notification.data.email.split('@')[0]}'`
                    break;
                case 'cancelled-order':
                    iconClass = 'fas fa-times-circle';
                    href = `'/admin/orders/?querry=ENTER_DATA_HERE'`
                    break;
                default:
                    iconClass = 'fas fa-bell';
            }

            li.innerHTML = `
                <div class="notification-content" onclick="location.assign(${href})">
                    <div class="notification-icon-container">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="notification-details">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${notification.time}</div>
                    </div>
                </div>
            `;

            li.addEventListener('click', (e) => {
                e.stopPropagation();
                notification.read = true;
                li.classList.remove('unread');
                updateNotificationUI();
            });

            notificationList.appendChild(li);
        });
    }

    async function saveCurrentDataAsPrevious() {
        try {
            await fetch('/api/admin/variables/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentTitle: 'notifications',
                    recentOrders: currentData.recentOrders,
                    contactMessages: currentData.contactMessages
                })
            });
        } catch (error) {
            console.error('Error saving notification data:', error);
        }
    }

    fetchData();

    setInterval(fetchData, 60000);
});