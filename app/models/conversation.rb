class Conversation < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'

  has_many :chat_conversations, dependent: :destroy

  scope :between, ->(user1, user2) {
    where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", user1.id, user2.id, user2.id, user1.id)
  }
end
