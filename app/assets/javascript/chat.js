import { Controller } from "stimulus";
import consumer from "channels/consumer";

export default class extends Controller {
  static targets = ["messages"];

  connect() {
    this.channel = consumer.subscriptions.create(
      { channel: "ChatChannel", chat_id: this.data.get("conversationId") },
      {
        received: this.handleReceivedMessage.bind(this),  
      }
    );
  }

  disconnect() {
    this.channel.unsubscribe(); 
  }

  handleReceivedMessage(data) {
    const messageHtml = `
      <div class="${data.sender === this.data.get("currentUser") ? 'sent' : 'received'}">
        <p><strong>${data.sender}:</strong> ${data.content}</p>
      </div>
    `;
    this.messagesTarget.innerHTML += messageHtml;  
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight;
  }

  fetchMessages() {
    fetch(`/conversations/${this.data.get("conversationId")}/messages`)
      .then((response) => response.json())
      .then((data) => {
        this.messagesTarget.innerHTML = data.messages;
      });
  }
}
