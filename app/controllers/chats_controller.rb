class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    @friends = current_user.friends
  end

  def show
    @conversation = Conversation.find(params[:id])
  
    @chat_conversations = @conversation.chat_conversations.order(created_at: :asc)
  
    unless [@conversation.sender, @conversation.receiver].include?(current_user)
      redirect_to root_path, alert: "You are not authorized to access this chat."
    end
  end
  
end
