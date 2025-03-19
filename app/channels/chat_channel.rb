class ChatChannel < ApplicationCable::Channel
 
    def subscribed
      stream_from "chat_#{params[:chat_id]}"
    end
  
    def receive(data)
      ActionCable.server.broadcast("chat_#{params[:chat_id]}", message: data['message'])
    end
  

  def unsubscribed
  end

  def send_message(data)
    content = data["content"]
    message = @conversation.chat_conversations.create!(content: content, sender: current_user)
    
    ChatChannel.broadcast_to(@conversation, {
      sender_username: current_user.username,
      content: message.content
    })
  end
end