import consumer from "./consumer";

document.addEventListener("DOMContentLoaded", () => {
  let canSendMessage = true;
  const chatBox = document.querySelector(".chats-box");
  const chatId = chatBox?.dataset?.chatConversationId;

  if (!chatId) {
    console.error("Chat ID not found. Cannot subscribe to chat.");
    console.log("ChatBox info:", chatBox?.dataset);
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

        if (!canSendMessage) {
          console.log("Message skipped");

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

  window.chatChannel = chatChannel;
});
