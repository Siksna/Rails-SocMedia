class ChatConversation < ApplicationRecord
    belongs_to :conversation
    belongs_to :sender, class_name: 'User'
    belongs_to :receiver, class_name: 'User'


    after_create_commit do
      broadcast_message
    end
  
    def broadcast_message
      ActionCable.server.broadcast(
        "chat_#{conversation.id}",
        {
          content: content,
          sender_username: sender.username
        }
      )
    end
    
  end
  