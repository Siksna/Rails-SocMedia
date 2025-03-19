import { Controller } from "stimulus";

export default class extends Controller {
  static targets = ["messages"];

  connect() {
    console.log("Stimulus controller connected");
    console.log("Consumer:", window.consumer);

    this.channel = window.consumer.subscriptions.create(
      { channel: "ChatChannel", chat_id: this.data.get("conversationId") },
      {
        received: this.handleReceivedMessage.bind(this),
        connected() {
          console.log("Connected to ChatChannel");
        }
      }
    );
  }

  handleReceivedMessage(data) {
    console.log("Received message:", data);
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${data.sender_username}:</strong> ${data.content}`;
    this.messagesTarget.appendChild(messageElement);
  }
}
