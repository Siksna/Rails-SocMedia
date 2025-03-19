import { consumer } from "./index";

const chatChannel = consumer.subscriptions.create("ChatChannel", {
  connected() {
    console.log("Connected to the ChatChannel!");
  },
  disconnected() {
    console.log("Disconnected from the ChatChannel.");
  },
  received(data) {
    console.log("Received data from ChatChannel:", data);
  },
  sendMessage(message) {
    this.perform("send_message", { content: message });
  },
});

export default chatChannel;
