import consumer from "./consumer";


function formatMessageTimestamps() {
  const messages = document.querySelectorAll(".chat-message");

  messages.forEach(msg => {
    const createdAt = msg.dataset.createdAt;
    if (!createdAt) return;

    const createdDate = new Date(createdAt);
    const now = new Date();

    const pad = num => String(num).padStart(2, "0");

    const hours = pad(createdDate.getHours());
    const minutes = pad(createdDate.getMinutes());
    const time = `${hours}:${minutes}`;

    const day = pad(createdDate.getDate());
    const month = pad(createdDate.getMonth() + 1);
    const year = createdDate.getFullYear();
    const dateTime = `${day}/${month}/${year} ${time}`;

    const todayStr = now.toDateString();
    const msgStr = createdDate.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let label;
    if (msgStr === todayStr) {
      label = time;
    } else if (msgStr === yesterdayStr) {
      label = `Yesterday ${time}`;
    } else {
      label = dateTime;
    }

    const existing = msg.querySelector(".timestamp");
    if (existing) {
      existing.textContent = label;
    } else {
      const timeSpan = document.createElement("div");
      timeSpan.classList.add("timestamp");
      timeSpan.style.fontSize = "0.75rem";
      timeSpan.style.color = "#666";
      timeSpan.textContent = label;
      timeSpan.style.display = "flex";
      timeSpan.style.justifyContent = "flex-end";
      msg.appendChild(timeSpan);
    }
  });
}

window.formatMessageTimestamps = formatMessageTimestamps;


function insertDateLinesBetweenMessages(newMessages = null) {
  const container = document.querySelector(".chat-message-wrapper")?.parentNode 
    || document.querySelector(".messages") 
    || document.querySelector(".messages-target");

  if (!container) return;

  container.querySelectorAll(".day-separator").forEach(div => div.remove());

  const messages = newMessages || document.querySelectorAll(".chat-message");
  const messagesArray = Array.from(messages).sort((a, b) => {
    return new Date(a.dataset.createdAt) - new Date(b.dataset.createdAt);
  });

  let lastDate = null;

  for (let i = 0; i < messagesArray.length; i++) {
    const msg = messagesArray[i];
    const createdAt = msg.dataset.createdAt;
    if (!createdAt) continue;

    const createdDate = new Date(createdAt);
    const msgDateStr = createdDate.toDateString();

    if (msgDateStr !== lastDate) {
      lastDate = msgDateStr;

      const now = new Date();
      const todayStr = now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let label;
      if (msgDateStr === todayStr) {
        label = "Today";
      } else if (msgDateStr === yesterdayStr) {
        label = "Yesterday";
      } else {
        const options = { day: "numeric", month: "short", year: "numeric" };
        label = createdDate.toLocaleDateString("en-GB", options);
      }

      const wrapper = msg.closest(".chat-message-wrapper");
      if (wrapper && wrapper.parentNode) {
        const divider = document.createElement("div");
        divider.classList.add("day-separator");
        divider.textContent = label;
        wrapper.parentNode.insertBefore(divider, wrapper);
      }
    }
  }
}




window.insertDateLinesBetweenMessages = insertDateLinesBetweenMessages;


function correctMessageClasses(message) {
  const chatBox = document.querySelector(".chats-box");
  const currentUserId = chatBox?.dataset?.currentUserId;
  const senderId = message.dataset.senderId;
  const wrapper = message.closest(".chat-message-wrapper");


  console.log("Sender:", senderId, "Current:", currentUserId);

  if (!senderId || !currentUserId) return;

   if (senderId === currentUserId) {
    message.classList.add("sent");
    message.classList.remove("received");

    wrapper.classList.add("justify-end");
    wrapper.classList.remove("justify-start");
  } else {
    message.classList.add("received");
    message.classList.remove("sent");

    wrapper.classList.add("justify-start");
    wrapper.classList.remove("justify-end");
  }

}

function isNearBottom(container, threshold = 100) {
  return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}

function scrollToBottom() {
  const chatBox = document.querySelector(".chats-box");
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const scrollBtn = document.getElementById("scrollToLatestBtn");

  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      scrollToBottom();

      document.querySelectorAll(".chat-message.unseen").forEach(msg => msg.classList.remove("unseen"));
      const divider = document.querySelector(".unseen-divider");
      if (divider) divider.remove();

      scrollBtn.style.display = "none";
    });
  }

  const chatBox = document.querySelector(".chats-box");
  const chatId = chatBox?.dataset?.chatConversationId;

  if (!chatId) return;

  const chatChannel = consumer.subscriptions.create(
    { channel: "ChatChannel", chat_id: chatId },
    {
      connected() {
        console.log("Connected to the ChatChannel");
      },
      disconnected() {
        console.log("Disconnected from the ChatChannel");
      },
      received(data) {
        console.log("Received data from ChatChannel:", data);

        const chatBox = document.querySelector(".chats-box");
        const chatMessages = document.getElementById("chats_messages");
        const scrollBtn = document.getElementById("scrollToLatestBtn");

        const isScrolledToBottom = isNearBottom(chatBox);

        if (data.html) {
          chatMessages.insertAdjacentHTML("beforeend", data.html);

          const wrapper = chatMessages.lastElementChild;
          const newMessage = wrapper?.querySelector(".chat-message");
          if (newMessage) correctMessageClasses(newMessage);


          if (!isScrolledToBottom) {
            const wrapper = chatMessages.lastElementChild;
          if (wrapper) {
            wrapper.querySelector(".chat-message")?.classList.add("unseen");

          if (!document.querySelector(".unseen-divider")) {
            const divider = document.createElement("div");
            divider.classList.add("unseen-divider");
            chatMessages.insertBefore(divider, wrapper);
            }
          }


            if (scrollBtn) scrollBtn.style.display = "block";
            const newMessageBtn = document.getElementById("newMessageBtn");
            if (newMessageBtn) newMessageBtn.style.display = "block";

            if (newMessage) {
            correctMessageClasses(newMessage);
              }
            formatMessageTimestamps();
            insertDateLinesBetweenMessages();
          } else {
            if (newMessage) {
            correctMessageClasses(newMessage);
              }
            formatMessageTimestamps();
            insertDateLinesBetweenMessages();
            scrollToBottom();
          }

          


          

          const fileInput = document.getElementById("fileInput");
          if (fileInput) fileInput.value = "";
        }
      }
    }
  );

  window.chatChannel = chatChannel;
   formatMessageTimestamps();
   insertDateLinesBetweenMessages();

});
