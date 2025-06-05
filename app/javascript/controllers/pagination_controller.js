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
console.log("Pagination controller connected");
    this.scrollContainer = this.element;

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
      rootMargin: this.directionValue === "up" ? "700px 0px 0px 0px" : "0px 0px 1000px 0px"
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
  const trigger = document.getElementById("load-more-trigger");
  if (!trigger) {
    console.log("🚫 No trigger element found.");
  }
  if (!this.scrollContainer) {
    console.log("🚫 Scroll container is missing.");
  }

  if (!trigger || !this.scrollContainer || this.loading) {
    console.log("⏳ Exiting early: Missing trigger/scrollContainer or already loading.");
    return;
  }

  console.log("🚀 Starting loadMoreDown...");

  this.loading = true;
  this.observer.unobserve(trigger);

  const userId = trigger.dataset.userId;
  const lastId = trigger.dataset.messageId;
  const lastScore = trigger.dataset.messageScore;
  const afterIdForReplies = trigger.dataset.afterId;

  console.log(`📌 Mode: ${this.modeValue}`);
  if (lastScore) console.log(`⭐ lastScore: ${lastScore}`);
  if (userId) console.log(`👤 userId: ${userId}`);

  function rebindReplyEvents(container) {
    console.log("🔁 Rebinding reply events...");
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
    case "profile_activities":
      url = `/profiles/${userId}/load_more_activities?last_activity_id=${lastId}`;
      break;
    case "profile_liked_activities":
      url = `/profiles/${userId}/load_more_activities?liked=true&last_activity_id=${lastId}`;
      break;
    case 'notifications':
      url = `/load_more_notifications?after=${lastId}`;
      break;
    case 'bookmarks':
      url = `/bookmarks/load_more?after=${lastId}`;
      break;
    default:
      console.error("❌ Unknown mode:", this.modeValue);
      this.loading = false;
      return;
  }

  console.log("🌐 Fetching URL:", url);

  fetch(url, {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  })
    .then(response => {
      console.log("✅ Response received");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      console.log("📦 HTML content loaded");
      trigger.remove();

      this.messagesTarget.insertAdjacentHTML("beforeend", html);
      rebindReplyEvents(this.messagesTarget);

      let lastLoadedMessageElement;

      if (this.modeValue === "replies") {
        const parentReplies = Array.from(this.messagesTarget.querySelectorAll("[data-message-id]")).filter(el => !el.dataset.parentId || el.dataset.parentId === "");
        lastLoadedMessageElement = parentReplies[parentReplies.length - 1];
      } else if (this.modeValue === "bookmarks") {
        const allBookmarks = this.messagesTarget.querySelectorAll("[data-bookmark-id]");
        lastLoadedMessageElement = allBookmarks[allBookmarks.length - 1];
      } else {
        const allMessages = this.messagesTarget.querySelectorAll("[data-message-id]");
        lastLoadedMessageElement = allMessages[allMessages.length - 1];
      }

      if (!lastLoadedMessageElement) {
        console.log("⚠️ No new messages loaded.");
        this.loading = false;
        return;
      }

      const newLastId = lastLoadedMessageElement.dataset.messageId || lastLoadedMessageElement.dataset.bookmarkId;
      console.log("🆕 Last loaded message ID:", newLastId);

      if (newLastId === lastId) {
        console.log("🔁 Last message ID is the same as previous – nothing new loaded.");
        this.loading = false;
        return;
      }

      const newTrigger = document.createElement("div");
      newTrigger.id = "load-more-trigger";
      newTrigger.dataset.messageId = lastLoadedMessageElement.dataset.messageId;

      if (this.modeValue === "messages") {
        newTrigger.dataset.messageScore = lastLoadedMessageElement.dataset.messageScore;
      } else if (this.modeValue === "replies") {
        newTrigger.dataset.afterId = afterIdForReplies;
      } else if (this.modeValue === "profile_activities" || this.modeValue === "profile_liked_activities") {
        newTrigger.dataset.activityType = lastLoadedMessageElement.dataset.activityType;
        newTrigger.dataset.userId = userId;
        newTrigger.dataset.likedMode = trigger.dataset.likedMode;
      } else if (this.modeValue === "bookmarks") {
        newTrigger.dataset.messageId = lastLoadedMessageElement.dataset.bookmarkId;
      }

      this.messagesTarget.appendChild(newTrigger);
      this.observer.observe(newTrigger);

      console.log("✅ New trigger added and observed.");
      this.loading = false;
    })
    .catch(err => {
      console.error("❌ Pagination load error:", err);
      this.loading = false;
    });
}



}
