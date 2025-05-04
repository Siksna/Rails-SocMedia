import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["messages"]
  static values = { conversationId: String }

  connect() {
    console.log("Pagination controller connected")

    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.loadMore()
      }
    }, { threshold: 1 })

    const trigger = document.getElementById("load-more-trigger")
    if (trigger) this.observer.observe(trigger)
  }

  loadMore() {
    const trigger = document.getElementById("load-more-trigger")
    if (!trigger) return
  
    const messageId = trigger.dataset.messageId
  
    fetch(`/chats/${this.conversationIdValue}/load_more?before=${messageId}`, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(response => response.text())
      .then(html => {
        trigger.remove()
        this.messagesTarget.insertAdjacentHTML("afterbegin", html)
  
        const newTrigger = document.getElementById("load-more-trigger")
        if (newTrigger) this.observer.observe(newTrigger)
      })
      .catch(err => console.error("Pagination load error", err))
  }
  

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
  
}