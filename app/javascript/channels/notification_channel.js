import consumer from "./consumer";

const currentUserId = parseInt(document.querySelector('meta[name="current-user-id"]')?.content, 10);


const NotificationChannel = consumer.subscriptions.create("NotificationChannel", {
  connected() {
    console.log("Connected to the NotificationChannel");
  },

   rejected() {
    console.error("Subscription to NotificationChannel was rejected.");
  },

  

  received(data) {

    if (data.sender_id === currentUserId) {
  return;
}

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

     

    } else if (data.notification_type === "follow" || data.notification_type === "like" || data.notification_type === "reply") {
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
  li.className = "dropdown-item d-flex align-items-start gap-2";

  const dot = document.createElement("span");
  dot.className = "blue-dot mt-1";

  const profileImg = document.createElement("img");
  profileImg.src = data.sender_avatar_url || "/default-avatar.png"; 
  profileImg.alt = "Avatar";
  profileImg.className = "rounded-circle";
  profileImg.style.width = "32px";
  profileImg.style.height = "32px";
  profileImg.style.objectFit = "cover";

  const usernameLink = document.createElement("a");
  usernameLink.href = `/profiles/${data.sender_id}`;
  usernameLink.textContent = data.sender_username;
  usernameLink.className = "username-link";
  usernameLink.style.fontWeight = "bold";
  usernameLink.style.textDecoration = "none";
  usernameLink.style.color = "#007bff";

  const messageLink = document.createElement("a");
  messageLink.href = data.url || "#";
  messageLink.textContent = ` ${data.message_text}`;
  messageLink.className = "notification-link";
  messageLink.style.textDecoration = "none";
  messageLink.style.color = "inherit";
  messageLink.style.display = "block";

  const timeText = document.createElement("small");
  timeText.textContent = timeAgo(new Date(data.created_at * 1000));
  timeText.style.fontSize = "0.75rem";
  timeText.style.color = "#888";
  timeText.style.display = "block";

  const textWrapper = document.createElement("div");
  textWrapper.appendChild(usernameLink);
  textWrapper.appendChild(messageLink);
  textWrapper.appendChild(timeText);

  const mediaWrapper = document.createElement("div");
  mediaWrapper.className = "d-flex gap-2";
  mediaWrapper.appendChild(profileImg);
  mediaWrapper.appendChild(textWrapper);

  li.appendChild(dot);
  li.appendChild(mediaWrapper);

  li.classList.add("clickable-notification");
  li.dataset.url = data.url || "#";

  li.addEventListener("mouseenter", () => {
    markSingleNotificationAsRead(data.notification_id, dot);

    if (dot.style.display !== "none") {
      dot.style.display = "none";
      let count = parseInt(notificationCount.textContent, 10) || 0;
      count = Math.max(count - 1, 0);
      notificationCount.textContent = count;
      notificationCount.style.display = count > 0 ? "inline-block" : "none";
    }
  });

  notificationDropdown.prepend(li);

  const allItems = notificationDropdown.querySelectorAll("li");
  if (allItems.length > 10) {
    for (let i = 10; i < allItems.length; i++) {
      allItems[i].remove();
    }
  }

  let count = parseInt(notificationCount.textContent, 10) || 0;
  count += 1;
  notificationCount.textContent = count;
  notificationCount.style.display = "inline-block";
}




function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const diff = Math.floor(seconds / value);
    if (diff >= 1) return rtf.format(-diff, unit);
  }

  return "just now";
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
