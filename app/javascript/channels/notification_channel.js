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

    } else if (data.notification_type === "follow" || data.notification_type === "like") {
      addGeneralNotification(data);
    }

    const convoCounts = {};

    (data.unread_notifications || []).forEach(n => {
      console.log(`Processing notification for conversation ID: ${n.conversation_id}`);
      convoCounts[n.conversation_id] = (convoCounts[n.conversation_id] || 0) + 1;
    });

    document.querySelectorAll("[data-convo-id]").forEach(card => {
      const convoId = card.getAttribute("data-convo-id");
      const badge = card.querySelector(".chat-unread-count");

      if (badge && convoCounts[convoId] > 0) {
        badge.textContent = convoCounts[convoId];
        badge.style.display = "inline-block";
      } else if (badge) {
        badge.style.display = "none";
      } else {
        console.warn(`No badge element found inside card with convo ID ${convoId}`);
      }
    });
  }
});

function addGeneralNotification(data) {
  const notificationDropdown = document.getElementById("notifications-dropdown");
  const notificationCount = document.getElementById("notification-count");

  const noNotifMessage = notificationDropdown.querySelector(".text-muted");
  if (noNotifMessage) noNotifMessage.remove();

  const li = document.createElement("li");
  li.className = "dropdown-item";

  const dot = document.createElement("span");
  dot.className = "blue-dot";

  const messageText = document.createElement("span");
  messageText.textContent = ` ${data.message} (${data.created_at})`;

  li.appendChild(dot);
  li.appendChild(messageText);

  li.addEventListener("mouseenter", () => {
    markSingleNotificationAsRead(data.notification_id, dot);
  });

  notificationDropdown.prepend(li);

  let count = parseInt(notificationCount.textContent, 10) || 0;
  count += 1;
  notificationCount.textContent = count;
  notificationCount.style.display = "inline-block";
}


function markSingleNotificationAsRead(notificationId, dotElement) {
  fetch(`/notifications/mark_as_read_notification/${notificationId}`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (dotElement) dotElement.style.display = "none";
      } else {
        console.error("Failed to mark notification as read:", data.error);
      }
    })
    .catch(error => console.error("Error marking notification as read:", error));
}

export default NotificationChannel;
