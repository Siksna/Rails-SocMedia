class ChatConversation < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  has_one_attached :file

  after_create_commit :broadcast_message

  def broadcast_message
    ActionCable.server.broadcast(
      "chat_#{conversation.id}",
      {
        content: content,
        sender_username: sender.username,
        message_id: id,
        conversation_id: conversation.id
      }
    )
  end
end
