import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["messages"]
  static values = { conversationId: String }

  connect() {
    console.log("Pagination controller connected");

    this.scrollContainer = document.querySelector(".chats-box");
    this.loading = false;

    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.loading) {
        this.loadMore();
      }
    }, {
      threshold: 1,
      root: this.scrollContainer,
      rootMargin: "500px 0px 0px 0px"
    });

    const trigger = document.getElementById("load-more-trigger");
    if (trigger) this.observer.observe(trigger);
  }


  
  loadMore() {
    console.log("Loading");
  
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
          const newScrollHeight = this.scrollContainer.scrollHeight;
          
          if (this.scrollContainer.scrollTop <= 0) {
            const scrollDiff = newScrollHeight - previousScrollHeight;
            this.scrollContainer.scrollTop += scrollDiff;  
          }
  
          const newTrigger = document.getElementById("load-more-trigger");
          if (newTrigger) this.observer.observe(newTrigger);
  
          this.loading = false;
        });
      })
      .catch(err => {
        console.error("Pagination load error", err);
        this.loading = false;
      });
  }
  

  
  
  
  

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
