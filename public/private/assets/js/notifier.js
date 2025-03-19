function notify(message) {
    const popup = document.getElementById('popupNotification');
    popup.textContent = message;
    popup.style.display = 'block';

    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}
