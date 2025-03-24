import consumer from "./consumer";

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
      
      const chatBox = document.querySelector(".chat-box");
      if (!chatBox) {
        console.warn("Chat message received, but chat box not found on this page.");
        return; 
      }

      const chatMessages = document.getElementById("chat_messages");
      if (!chatMessages) {
        console.warn("Chat messages div not found");
        return; 
      }

      const newMessage = document.createElement("div");

      const currentUser = chatBox.dataset.currentUser || "";
      newMessage.classList.add(data.sender_username === currentUser ? 'sent' : 'received');

      newMessage.innerHTML = `<p><strong>${data.sender_username}:</strong> ${data.content}</p>`;

      chatMessages.appendChild(newMessage);

      chatBox.scrollTop = chatBox.scrollHeight;

      const inputField = document.getElementById("inputField_chat");
      if (inputField) {
        inputField.value = "";
      }
    },
    
    sendMessage(message) {
      this.perform("send_message", { content: message });
    }
  }
);

export default chatChannel;
