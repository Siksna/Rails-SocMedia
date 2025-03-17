class ChatChannel < ApplicationCable::Channel
  def subscribed
    @conversation = Conversation.find(params[:chat_id])
    stream_for @conversation
    puts "User subscribed to ChatChannel for conversation #{@conversation.id}"
  end

  def unsubscribed
  end

  def send_message(data)
    content = data["content"]
    message = @conversation.chat_conversations.create!(content: content, sender: current_user)
    
    broadcast_to @conversation, {
      sender_username: current_user.username,
      content: message.content
    }
  end
end