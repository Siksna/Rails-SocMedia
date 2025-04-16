import consumer from "./consumer";

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

        const chatMessages = document.getElementById("chats_messages");
        if (!chatMessages) return;

        const newMessage = document.createElement("div");
        newMessage.classList.add(data.sender_username === chatBox.dataset.currentUser ? 'sent' : 'received');
        newMessage.innerHTML = `<p><strong>${data.sender_username}:</strong> ${data.content}</p>`;

        chatMessages.appendChild(newMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        const inputField = document.getElementById("inputField_chat");
        if (inputField) {
          inputField.value = "";
        }

      }
    }
  );

  window.chatChannel = chatChannel;
});
