import consumer from "./consumer";

const NotificationChannel = consumer.subscriptions.create("NotificationChannel", {
  connected() {
    console.log("Connected to the NotificationChannel");
  },
  disconnected() {
    console.log("Disconnected from the NotificationChannel");
  },
  received(data) {
    console.log("New notification received:", data);

    const messageNotificationCount = document.getElementById("message-notification-count");
    let count = parseInt(messageNotificationCount.textContent, 10) || 0;
    count += 1;

    messageNotificationCount.textContent = count;
    messageNotificationCount.style.display = count > 0 ? "inline-block" : "none";
  }
});

export default NotificationChannel;
