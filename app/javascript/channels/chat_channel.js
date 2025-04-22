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
});


function handleNewMessage() {
  const chatBox = document.querySelector(".chats-box");
  const newMessageBtn = document.getElementById("newMessageBtn");

  if (chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 100) {
    chatBox.scrollTop = chatBox.scrollHeight;
  } else if (newMessageBtn) {
    newMessageBtn.style.display = "block";
  }
}


document.addEventListener("DOMContentLoaded", () => {
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

        if (!data.content || data.content.trim() === "") {
          console.warn("Empty message. Ignoring...");
          return;
        }

        const chatBox = document.querySelector(".chats-box");
        const chatMessages = document.getElementById("chats_messages");
        const scrollBtn = document.getElementById("scrollToLatestBtn");
        
        const isScrolledToBottom = isNearBottom(chatBox);

        const newMessage = document.createElement("div");
        newMessage.classList.add(data.sender_username === chatBox.dataset.currentUser ? 'sent' : 'received');
        newMessage.innerHTML = `<p><strong>${data.sender_username}:</strong> ${data.content}</p>`;

        if (!isScrolledToBottom) {
          newMessage.classList.add("unseen");
      
          if (!document.querySelector(".unseen-divider")) {
            const divider = document.createElement("div");
            divider.classList.add("unseen-divider");
            chatMessages.appendChild(divider);
          }
      
          if (scrollBtn) scrollBtn.style.display = "block";
        }

        newMessage.classList.add("chat-message", "unseen");
        chatMessages.appendChild(newMessage);
        handleNewMessage();


        const inputField = document.getElementById("inputField_chat");
        if (inputField) {
          inputField.value = "";
        }

      }
    }
  );

  window.chatChannel = chatChannel;
});
