class ChatConversationsController < ApplicationController
  before_action :authenticate_user!
  def create
    logger.debug "Request format: #{request.format}"  

    @conversation = Conversation.find(params[:chat_id])
    @chat_conversation = @conversation.chat_conversations.build(chat_message_params)
    @chat_conversation.sender = current_user
    @chat_conversation.receiver = @conversation.sender == current_user ? @conversation.receiver : @conversation.sender
  
    if @chat_conversation.save
      ChatChannel.broadcast_to(
        @conversation,
        sender_username: @chat_conversation.sender.username,
        content: @chat_conversation.content,
        chat_id: @conversation.id
      )
  
      NotificationChannel.broadcast_to(
        @chat_conversation.receiver,
        message: "New message from #{@chat_conversation.sender.username}: #{@chat_conversation.content}",
        conversation_id: @conversation.id
      )
  
      render json: { id: @chat_conversation.id, sender_username: @chat_conversation.sender.username, content: @chat_conversation.content, receiver: @chat_conversation.receiver.username }, status: :created
    else
      render json: { error: "Message could not be sent" }, status: :unprocessable_entity
    end
  end
  
  
  
  

  private

  def chat_message_params
    params.require(:chat_conversation).permit(:content)
  end

end
