import consumer from "./consumer";

let canSendMessage = true;

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

      // if (!data.message_id || !data.conversation_id) {
      //   console.error("Missing message_id or conversation_id. Cannot delete message.");
      //   return;
      // }

      if (!canSendMessage) {
        console.log("Message skipped");

        console.log("Conversation ID:", data.conversation_id);
        console.log("Message ID:", data.message_id);
        

        fetch(`/chats/${data.conversation_id}/chat_conversations/${data.message_id}`, {
          method: "DELETE",
          headers: {
            "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
            "Accept": "application/json"
          }
        })
        .then(response => {
          if (response.ok) {
            console.log(`Message with ID ${data.message_id} has been deleted.`);
          } else {
            console.error("Failed to delete message from database");
          }
        })
        .catch(error => console.error("Error deleting message:", error));

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
