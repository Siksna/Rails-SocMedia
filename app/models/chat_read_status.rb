class ChatReadStatus < ApplicationRecord
  belongs_to :user
  belongs_to :chat, class_name: "Conversation"
end
