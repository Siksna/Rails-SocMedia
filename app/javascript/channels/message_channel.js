import { consumer } from "./index";

const messageChannel = consumer.subscriptions.create("MessageChannel", {
  connected() {
    console.log("Connected to the MessageChannel!");
  },
  disconnected() {
    console.log("Disconnected from the MessageChannel.");
  },
  received(data) {
    console.log("Received data from MessageChannel:", data);
  },
  sendMessage(message) {
    this.perform("send_message", { content: message });
  },
});

export default messageChannel;
