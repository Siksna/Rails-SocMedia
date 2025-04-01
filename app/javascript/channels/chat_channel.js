import consumer from "./consumer";

let canSendMessage = true; // Toggle flag to block every second message

const chatChannel = consumer.subscriptions.create(
  { channel: "ChatChannel", chat_id: 1 }, 
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

      if (!canSendMessage) {
        console.log("Message skipped");
        canSendMessage = true;
        return;
      }

      const chatBox = document.querySelector(".chats-box");
      if (!chatBox) return;

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

      canSendMessage = false;
    }
  }
);

export default chatChannel;
