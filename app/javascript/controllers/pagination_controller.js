import { Controller } from "@hotwired/stimulus"
import { bindClickableReplyEvent } from "../java";

export default class extends Controller {
  static targets = ["messages"]
  static values = {
    conversationId: String,
    direction: { type: String, default: "up" },
    url: String,
    mode: String,
    lastMessageScore: Number,
    lastMessageId: String  
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

           this.messagesTarget.querySelectorAll(".date-divider").forEach(divider => divider.remove());
        const allMessages = Array.from(this.messagesTarget.querySelectorAll(".chat-message"));
        insertDateLinesBetweenMessages(allMessages);

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
          formatMessageTimestamps();

          this.loading = false;
        });
      })
      .catch(err => {
        console.error("Pagination load error", err);
        this.loading = false;
      });
  }

  loadMoreDown() {
    console.log("Loading more down");
    const trigger = document.getElementById("load-more-trigger");
    if (!trigger || !this.scrollContainer || this.loading) {
      console.log("Scroll container missing or loading is true");
      return;
    }

    this.loading = true;
    this.observer.unobserve(trigger);

   
    const lastId = trigger.dataset.messageId;
    const lastScore = trigger.dataset.messageScore;

    const afterIdForReplies = trigger.dataset.afterId;

    function rebindReplyEvents(container) {
      container.querySelectorAll('.clickable-reply').forEach(replyElement => {
        bindClickableReplyEvent(replyElement);
      });
    }

    let url;

    switch (this.modeValue) {
      case "admin":
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set("after", lastId);
        url = `/admin/history/load_more_history?${currentParams.toString()}`;
        break;
      case "personas":
        const personasParams = new URLSearchParams(window.location.search);
        personasParams.set("after", lastId);
        url = `/admin/personas/load_more_personas?${personasParams.toString()}`;
        break;
      case "replies":
        url = `/messages/${afterIdForReplies}/replies/load_more?after=${lastId}`;
        break;
      case "messages":
        const feed = new URLSearchParams(window.location.search).get("feed") || "all";
        url = `/home/load_more?after=${lastScore},${lastId}&feed=${feed}`;
        break;
      case "friends":
        url = `chats/load_more_conversations?after=${lastId}`;
        break;
      default:
        console.error("Unknown mode:", this.modeValue);
        this.loading = false;
        return;
    }

    fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(response => response.text())
      .then(html => {
        trigger.remove(); 

        this.messagesTarget.insertAdjacentHTML("beforeend", html);
        rebindReplyEvents(this.messagesTarget);

        let lastLoadedMessageElement; 

        if (this.modeValue === "replies") {
          const parentReplies = Array.from(this.messagesTarget.querySelectorAll("[data-message-id]")).filter(el => !el.dataset.parentId || el.dataset.parentId === "");
          lastLoadedMessageElement = parentReplies[parentReplies.length - 1];
        } else {
          const allMessages = this.messagesTarget.querySelectorAll("[data-message-id]");
          lastLoadedMessageElement = allMessages[allMessages.length - 1];
        }

        
      if (!lastLoadedMessageElement) {
        console.log("No new messages loaded");
        this.loading = false;
        return;
      }

        if (lastLoadedMessageElement &&
            this.modeValue === "messages" &&
            lastLoadedMessageElement.dataset.messageId === lastId) {
            console.log("Last message the same");
            this.loading = false;
            return;
        }


        console.log("Next Trigger Data - ID:", lastLoadedMessageElement.dataset.messageId, "Score:", lastLoadedMessageElement.dataset.messageScore);
        const newTrigger = document.createElement("div");
        newTrigger.id = "load-more-trigger";
        newTrigger.dataset.messageId = lastLoadedMessageElement.dataset.messageId;
        newTrigger.dataset.messageScore = lastLoadedMessageElement.dataset.messageScore;
        newTrigger.dataset.afterId = afterIdForReplies; 

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
