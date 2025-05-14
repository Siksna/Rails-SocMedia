import consumer from "./consumer";

function isNearBottom(container, threshold = 100) {
  return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}

function scrollToBottom() {
  const chatBox = document.querySelector(".chats-box");
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

document.addEventListener("turbo:load", () => {
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
});


document.addEventListener("turbo:load", () => {
  const chatBox = document.querySelector(".chats-box");
  const chatId = chatBox?.dataset?.chatConversationId;

  if (!chatId) {
    return;
  }

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
      
          if (!isScrolledToBottom) {
            const lastMessage = chatMessages.lastElementChild;
            if (lastMessage) lastMessage.classList.add("unseen");
      
            if (!document.querySelector(".unseen-divider")) {
              const divider = document.createElement("div");
              divider.classList.add("unseen-divider");
              chatMessages.appendChild(divider);
            }
      
            if (scrollBtn) scrollBtn.style.display = "block";
          } else {
            scrollToBottom();
          }
      
          const inputField = document.getElementById("inputField_chat");
          if (inputField) inputField.value = "";
      
          const fileInput = document.getElementById("fileInput");
          if (fileInput) fileInput.value = "";
        }
      }
      
    }
  );

  window.chatChannel = chatChannel;
});
