import { Turbo } from "@hotwired/turbo-rails"
Turbo.session.drive = false

import Rails from "@rails/ujs"
Rails.start()

import "../channels/chat_channel"
import "../channels/notification_channel"
import "../channels/consumer"
import "../channels"
import "../controllers"
import "../java.js"
