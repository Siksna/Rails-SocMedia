import consumer from "./consumer";


const NotificationChannel = consumer.subscriptions.create("NotificationChannel", {
  connected() {
    console.log("Connected to the NotificationChannel");
  },

  disconnected() {
    console.log("Disconnected from the NotificationChannel");
  },

  received(data) {
    console.log("New notification received:", data);

    
    const currentChatBox = document.querySelector(".chats-box");
    const currentConversationId = currentChatBox?.dataset.chatConversationId;
  
    if (data.notification_type === "chats") {


      if (currentChatBox && currentConversationId == data.conversation_id) {
        console.log("In current chat conversation, skipping notification");
        return;
      }
      const messageNotificationCount = document.getElementById("message-notification-count");
      let count = parseInt(messageNotificationCount.textContent, 10) || 0;
      count += 1;

      messageNotificationCount.textContent = count;
      messageNotificationCount.style.display = count > 0 ? "inline-block" : "none";

     

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


/* live sort un messages index.html.erb lapa*/
const convoCard = document.querySelector(`[data-convo-id="${data.conversation_id}"]`);
if (convoCard) {
  convoCard.setAttribute("data-last-message-at", Math.floor(Date.now() / 1000));

  const snippet = convoCard.querySelector(".last-message-snippet"); 
  function truncate(str, maxLength) {
      if (typeof str !== "string") return "";
      return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
    }    

    if (snippet) {
    snippet.textContent = truncate(data.content, 30);
    console.log("Last message content:", data.content);

  }

  const grid = document.getElementById("friends-grid");
  const cards = Array.from(grid.children);

  cards.sort((a, b) => {
    const aTime = parseInt(a.getAttribute("data-last-message-at"), 10);
    const bTime = parseInt(b.getAttribute("data-last-message-at"), 10);
    return bTime - aTime;
  });

  cards.forEach(card => grid.appendChild(card));
}

    
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
