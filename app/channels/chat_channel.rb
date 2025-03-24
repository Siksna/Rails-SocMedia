class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_#{params[:chat_id]}"
  end

  def receive(data)
  end

  def send_message(data)
    content = data["content"]
    message = @conversation.chat_conversations.create!(content: content, sender: current_user)
    
    ActionCable.server.broadcast(
      "chat_#{@conversation.id}",
      {
        content: message.content,
        sender_username: current_user.username
      }
    )
  end

  def unsubscribed
  end
end
