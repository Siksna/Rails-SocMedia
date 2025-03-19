import consumer from "./consumer"

consumer.subscriptions.create("NotificationChannel", {
  received(data) {
    const notificationsDropdown = document.getElementById('suggestions-dropdown');
    const notificationItem = document.createElement('li');
    notificationItem.textContent = data.message;
    notificationItem.classList.add('dropdown-item');
    notificationItem.onclick = function() {
      window.location.href = `/conversations/${data.conversation_id}`;
    };
    notificationsDropdown.appendChild(notificationItem);
    
    const notificationCount = document.getElementById('notification-count');
    let count = parseInt(notificationCount.textContent, 10) || 0;
    count += 1;
    notificationCount.textContent = count;
    
    notificationsDropdown.style.display = 'block';
  }
});
