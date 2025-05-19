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

    this.scrollContainer = document.querySelector(".admin-history") || document.querySelector(".chats-box") || document.getElementById("post-container") 
    || document.querySelector(".personas-container") || this.element.querySelector(".reply-list") || document.getElementById("friends-grid");

    this.loading = false;

    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.loading) {
        if (this.directionValue === "up") {
          this.loadMoreUp();
        } else if (this.directionValue === "down") {
          this.loadMoreDown();
        }
      } else {
        console.log("Trigger busy");
      }
    }, {
      threshold: 1,
      root: this.directionValue === "up" ? this.scrollContainer : null,
      rootMargin: this.directionValue === "up" ? "500px 0px 0px 0px" : "0px 0px 1000px 0px"
    });

    const trigger = document.getElementById("load-more-trigger");
    if (trigger) {
      this.observer.observe(trigger);
    } else {
      console.warn("No trigger found");
    }
  }

  loadMoreUp() {
    console.log("Loading");
    const trigger = document.getElementById("load-more-trigger");
    if (!trigger || !this.scrollContainer || this.loading) {
      console.log("Scroll container missing");
      return;
    }

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
          const newScrollHeight = this.scrollContainer.scrollHeight;
          const scrollDiff = newScrollHeight - previousScrollHeight;
          if (this.scrollContainer.scrollTop <= 0) {
            this.scrollContainer.scrollTop += scrollDiff;
          }

          const newTrigger = document.getElementById("load-more-trigger");
          if (newTrigger) {
            this.observer.observe(newTrigger);
          } else {
            console.warn("No new trigger found");
          }

          this.loading = false;
        });
      })
      .catch(err => {
        console.error("Pagination load error", err);
        this.loading = false;
      });
  }

  loadMoreDown() {
    console.log("Loading");
    const trigger = document.getElementById("load-more-trigger");
    if (!trigger || !this.scrollContainer || this.loading) {
      console.log("Scroll container missing");
      return;
    }

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
      case "personas":
        const personasParams = new URLSearchParams(window.location.search);
        personasParams.set("after", messageId);
        url = `/admin/personas/load_more_personas?${personasParams.toString()}`;
        break;
      case "replies":
        url = `/messages/${afterId}/replies/load_more?after=${messageId}`;
        break;
      case "messages":
        url = `/home/load_more?after=${messageId}`;
        break;
      case "friends":
        url = `chats/load_more_conversations?after=${messageId}`;
        break;
    }

    fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(response => response.text())
      .then(html => {
        trigger.remove();
        this.messagesTarget.insertAdjacentHTML("beforeend", html);

        let lastMessage;
      if (this.modeValue === "replies") {
        const parentReplies = Array.from(this.messagesTarget.querySelectorAll("[data-message-id]")).filter(el => !el.dataset.parentId || el.dataset.parentId === "");
        lastMessage = parentReplies[parentReplies.length - 1];
      } else {
        const allMessages = this.messagesTarget.querySelectorAll("[data-message-id]");
        lastMessage = allMessages[allMessages.length - 1];
      }

      if (!lastMessage || lastMessage.dataset.messageId === messageId) {
        console.log("No new messages loaded");
        this.loading = false;
        return;
      }

    const newMessageId = lastMessage.dataset.messageId;

        const newTrigger = document.createElement("div");
        newTrigger.id = "load-more-trigger";
        newTrigger.dataset.messageId = newMessageId;
        newTrigger.dataset.afterId = trigger.dataset.afterId;
        this.messagesTarget.appendChild(newTrigger);
        this.observer.observe(newTrigger);

        this.loading = false;
      })
      .catch(err => {
        console.error("Pagination load error", err);
        this.loading = false;
      });
  }
}
