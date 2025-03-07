class ChatMessagesController < ApplicationController
    before_action :set_chat
  
    def create
      @chat_message = @chat.chat_messages.new(chat_message_params)
      @chat_message.user = current_user
  
      if @chat_message.save
        redirect_to chat_path(@chat)
      else
        flash[:alert] = "Failed to send message."
        render 'chats/show'
      end
    end
  
    private
  
    def set_chat
      @chat = Chat.find(params[:chat_id])
    end
  
    def chat_message_params
      params.require(:chat_message).permit(:content, :user_id, :file)
    end
  end
  