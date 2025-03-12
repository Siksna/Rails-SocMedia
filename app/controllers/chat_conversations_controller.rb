class ChatConversationsController < ApplicationController
  before_action :authenticate_user!

  def create
    @conversation = Conversation.find(params[:chat_id])

    @chat_conversation = @conversation.chat_conversations.build(chat_message_params)
    @chat_conversation.sender = current_user
    
    @chat_conversation.receiver = @conversation.sender == current_user ? @conversation.receiver : @conversation.sender

    if @chat_conversation.save
      respond_to do |format|
        format.html { redirect_to request.referer } 
        format.json { render json: @chat_conversation }
      end
    else
      render 'chats/show'
    end
  end

  private

  def chat_message_params
    params.require(:chat_conversation).permit(:content)
  end
end
