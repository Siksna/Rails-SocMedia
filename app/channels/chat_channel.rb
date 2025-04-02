class ChatChannel < ApplicationCable::Channel
  def subscribed
    @conversation = Conversation.find_by(id: params[:chat_id])
    stream_from "chat_#{@conversation.id}" if @conversation
  end

  def send_message(data)
    @conversation = Conversation.find_by(id: params[:chat_id])

    if @conversation
      message = @conversation.chat_conversations.create!(content: data["content"], sender: current_user)
      
      Rails.logger.info "Broadcasting: ID=#{message.id}, conversation_id=#{@conversation.id}"


      ActionCable.server.broadcast(
  "chat_#{@conversation.id}",
  {
    content: message.content,
    sender_username: current_user.username,
    message_id: message.id,
    conversation_id: @conversation.id
  }
)

    else
      logger.error("Conversation not found: chat_id=#{params[:chat_id]}")
    end
  end

  def unsubscribed
  end
end
