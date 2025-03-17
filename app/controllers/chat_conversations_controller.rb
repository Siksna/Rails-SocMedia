class ChatConversationsController < ApplicationController
  before_action :authenticate_user!
  
  def create
    logger.debug "Request format: #{request.format}"  # Log the format for debugging
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
  
      respond_to do |format|
        format.json { render json: { id: @chat_conversation.id, sender_username: @chat_conversation.sender.username, content: @chat_conversation.content, sender: @chat_conversation.sender.username }, status: :created }
      end
    else
      render json: { error: "Message could not be sent" }, status: :unprocessable_entity
    end
  end
  
  

  private

  def chat_message_params
    params.require(:chat_conversation).permit(:content)
  end
end
