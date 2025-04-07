import consumer from "./consumer";

let canSendNotification = true;

const NotificationChannel = consumer.subscriptions.create("NotificationChannel", {
  connected() {
    console.log("Connected to the NotificationChannel");
  },

  disconnected() {
    console.log("Disconnected from the NotificationChannel");
  },

  received(data) {
    console.log("New notification received:", data);

    if (data.notification_type === "chats") {

    if (!canSendNotification) {
      console.log("Notification skipped");

    const notificationId = data.notification_id; 
    const chatConversationId = data.chat_conversation_id;

    fetch(`/notifications/${notificationId}?chat_conversation_id=${chatConversationId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
          "Accept": "application/json"
        }
      })
        .then(response => {
          if (response.ok) {
            console.log(`Notification with ID ${data.message_id} has been deleted.`);
          } else {
            console.error("Failed to delete notification from the database");
          }
        })
        .catch(error => console.error("Error deleting notification:", error));

      canSendNotification = true;
      return;
    }

    const messageNotificationCount = document.getElementById("message-notification-count");
    let count = parseInt(messageNotificationCount.textContent, 10) || 0;
    count += 1;

    messageNotificationCount.textContent = count;
    messageNotificationCount.style.display = count > 0 ? "inline-block" : "none";

    canSendNotification = false;

  } else if (data.notification_type === "follow") {
    
    const notificationDropdown = document.getElementById("notifications-dropdown");
    const notificationCount = document.getElementById("notification-count");

    const li = document.createElement("li");
    li.className = "dropdown-item";
    li.textContent = `${data.message} (${data.created_at})`;

    notificationDropdown.prepend(li);
    let count = parseInt(notificationCount.textContent, 10) || 0;
    count += 1;
    notificationCount.textContent = count;
    notificationCount.style.display = "inline-block";
  }
  }
});

export default NotificationChannel;
