class ChatConversationsController < ApplicationController
  before_action :authenticate_user!

  def create
    @conversation = Conversation.find(params[:chat_id])
    @chat_conversation = @conversation.chat_conversations.build(chat_message_params)
    @chat_conversation.sender = current_user
    @chat_conversation.receiver = @conversation.sender == current_user ? @conversation.receiver : @conversation.sender


  
    if @chat_conversation.save

      Notification.create!(
        user: @chat_conversation.receiver,
        conversation: @conversation,
        read: false
      )

      NotificationChannel.broadcast_to(
      @chat_conversation.receiver,
      conversation_id: @conversation.id,
      unread_count: Notification.where(user: @chat_conversation.receiver, read: false).count
)


    else
      render plain: "Message could not be sent", status: :unprocessable_entity
    end
  end

  private

  def chat_message_params
    params.require(:chat_conversation).permit(:content)
  end
end
