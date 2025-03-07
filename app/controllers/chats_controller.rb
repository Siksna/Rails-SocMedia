class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    @friends = current_user.friends
  end


 def show
  @friend = User.find(params[:id])

  @chat = Chat.where(user1: current_user, user2: @friend)
              .or(Chat.where(user1: @friend, user2: current_user))
              .first_or_create(user1: current_user, user2: @friend)


  if @chat.persisted?
    @chat_messages = @chat.chat_messages.order(created_at: :asc)
  else
    @chat_messages = []  
  end

  @chat_message = ChatMessage.new
end

  


  def create_chat_message
    @chat = Chat.find(params[:chat_id])
    @chat_message = @chat.chat_messages.new(chat_message_params)
    @chat_message.user = current_user 

    if @chat_message.save
      redirect_to chat_path(@chat), notice: "Message sent successfully!"
    else
      render 'show', alert: "Failed to send message."
    end
  end

  private

  def chat_message_params
    params.require(:chat_message).permit(:content, :file)
  end
end
