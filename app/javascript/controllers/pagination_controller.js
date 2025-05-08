import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["messages"]
  static values = {
    conversationId: String,
    direction: { type: String, default: "up" }
  }

  connect() {
    console.log("Pagination controller connected");

    this.scrollContainer = document.querySelector(".chats-box") || document.getElementById("post-container");
    this.loading = false;

    this.observer = new IntersectionObserver(entries => {
      console.log(entries);
      if (entries[0].isIntersecting && !this.loading) {
        if (this.directionValue === "up") {
          this.loadMoreUp();
        } else if (this.directionValue === "down") {
          this.loadMoreDown();
        }
      }
    }, {
      threshold: 1,
      root: this.scrollContainer,
      rootMargin: this.directionValue === "up" ? "500px 0px 0px 0px" : "0px 0px 200px 0px"
    });

    const trigger = document.getElementById("load-more-trigger");
    if (trigger) this.observer.observe(trigger);
  }

  loadMoreUp() {
    console.log("Loading up");
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
        console.error("Pagination load error (up)", err);
        this.loading = false;
      });
  }

  loadMoreDown() {
    console.log("Loading down");

    const trigger = document.getElementById("load-more-trigger");
    if (!trigger || !this.scrollContainer || this.loading) return;

    this.loading = true;
    this.observer.unobserve(trigger);

    const messageId = trigger.dataset.messageId;

    fetch(`/home/load_more?after=${messageId}`, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(response => response.text())
      .then(html => {
        trigger.remove();
        this.messagesTarget.insertAdjacentHTML("beforeend", html);

        const newTrigger = document.getElementById("load-more-trigger");
        if (newTrigger) this.observer.observe(newTrigger);

        this.loading = false;
      })
      .catch(err => {
        console.error("Pagination load error (down)", err);
        this.loading = false;
      });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
