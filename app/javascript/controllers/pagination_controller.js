import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["messages"]
  static values = {
    conversationId: String,
    direction: { type: String, default: "up" },
    url: String,
    mode: String
  }

  connect() {
    console.log("✅ Pagination controller connected");
    console.log("↕️ Direction:", this.directionValue);

this.scrollContainer = document.querySelector(".admin-history") || document.querySelector(".chats-box") || document.getElementById("post-container") || this.element.querySelector(".reply-list");

    if (!this.scrollContainer) {
      console.warn("⚠️ No scrollContainer found");
    }

    this.loading = false;

    this.observer = new IntersectionObserver(entries => {
      console.log("👀 Observer triggered", entries[0]);
      if (entries[0].isIntersecting && !this.loading) {
        console.log("✅ Entry is intersecting and not loading");
        if (this.directionValue === "up") {
          console.log("⬆️ Calling loadMoreUp()");
          this.loadMoreUp();
        }

        if (this.directionValue === "down") {
          console.log("⬇️ Calling loadMoreDown()");
          this.loadMoreDown();
        }
      } else {
        console.log("🚫 Not intersecting or loading");
      }
    }, {
      threshold: 1,
      root: this.directionValue === "up" ? this.scrollContainer : null,
      rootMargin: this.directionValue === "up" ? "500px 0px 0px 0px" : "0px 0px 1000px 0px"
    });

    const trigger = document.getElementById("load-more-trigger");
    if (trigger) {
      console.log("📍 Found load-more-trigger, starting observer");
      this.observer.observe(trigger);
    } else {
      console.warn("❌ No #load-more-trigger found at connect");
    }
  }

  loadMoreUp() {
    console.log("⬆️ Loading up");
    const trigger = document.getElementById("load-more-trigger");
    if (!trigger || !this.scrollContainer || this.loading) return;

    this.loading = true;
    this.observer.unobserve(trigger);

    const messageId = trigger.dataset.messageId;
    const previousScrollHeight = this.scrollContainer.scrollHeight;

    fetch(`/chats/${this.conversationIdValue}/load_more?before=${messageId}`, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(response => response.text())
      .then(html => {
        trigger.remove();
        this.messagesTarget.insertAdjacentHTML("afterbegin", html);

        requestAnimationFrame(() => {
          if (this.scrollContainer.scrollTop <= 0) {
            const newScrollHeight = this.scrollContainer.scrollHeight;
            const scrollDiff = newScrollHeight - previousScrollHeight;
            this.scrollContainer.scrollTop += scrollDiff;
          }
          const newTrigger = document.getElementById("load-more-trigger");
          if (newTrigger) this.observer.observe(newTrigger);
          this.loading = false;
        });
      })
      .catch(err => {
        console.error("❌ Pagination load error (up)", err);
        this.loading = false;
      });
  }

  loadMoreDown() {
    console.log("⬇️ Loading down");
    const trigger = document.getElementById("load-more-trigger");
    if (!trigger || !this.scrollContainer || this.loading) return;

    this.loading = true;
    this.observer.unobserve(trigger);

    const messageId = trigger.dataset.messageId;
    const afterId = trigger.dataset.afterId;

let url;

switch (this.modeValue) {
  case "admin":
  const currentParams = new URLSearchParams(window.location.search);
  currentParams.set("after", messageId); 
  url = `/admin/history/load_more_history?${currentParams.toString()}`;
  break;

  case "replies":
    url = `/messages/${messageId}/replies/load_more?after=${afterId}`;
    break;
  case "messages":
    url = `/home/load_more?after=${messageId}`;
    break;
}
   console.log("🌐 Fetching from:", url);

    fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(response => response.text())
      .then(html => {
        trigger.remove();
        this.messagesTarget.insertAdjacentHTML("beforeend", html);

        const allMessages = this.messagesTarget.querySelectorAll("[data-message-id]");
        const lastMessage = allMessages[allMessages.length - 1];

        if (!lastMessage || lastMessage.dataset.messageId === messageId) {
          console.log("⚠️ No new messages loaded");
          this.loading = false;
          return;
        }

        const newMessageId = lastMessage.dataset.messageId;
        console.log("🆕 New trigger messageId:", newMessageId);

        const newTrigger = document.createElement("div");
        newTrigger.id = "load-more-trigger";
        newTrigger.dataset.messageId = newMessageId;
        this.messagesTarget.appendChild(newTrigger);
        this.observer.observe(newTrigger);

        this.loading = false;
      })
      .catch(err => {
        console.error("Pagination load error (down)", err);
        this.loading = false;
      });
  }

}
