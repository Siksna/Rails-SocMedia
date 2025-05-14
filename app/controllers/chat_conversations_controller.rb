class ChatConversationsController < ApplicationController
  before_action :authenticate_user!

  

  def create
    @conversation = Conversation.find(params[:chat_id])
    @chat_conversation = @conversation.chat_conversations.build(chat_message_params)
    @chat_conversation.sender = current_user
    @chat_conversation.receiver = @conversation.sender == current_user ? @conversation.receiver : @conversation.sender


  
    if @chat_conversation.save

      @notification = Notification.create!(
        user: @chat_conversation.receiver,
        conversation: @conversation,
        notification_type: "chats",
        chat_conversation_id: @chat_conversation.id,
        read: false
      )

      unread_notifications = Notification.where(user: @chat_conversation.receiver, notification_type: "chats", read: false).as_json(only: [:id, :conversation_id])

      NotificationChannel.broadcast_to(
      @chat_conversation.receiver,
      notification_id: @notification.id,
      chat_conversation_id: @chat_conversation.id,
      notification_type: @notification.notification_type,
      conversation_id: @conversation.id,
      unread_count: Notification.where(user: @chat_conversation.receiver, read: false).count,
      unread_notifications: unread_notifications,
      content: @chat_conversation.content
      )


      rendered_message = ApplicationController.renderer.render(
        partial: 'chats/chat_conversation',
        locals: { chat_conversations: [@chat_conversation], current_user: current_user }
      )
    
      ActionCable.server.broadcast("chat_#{@conversation.id}", {
        html: rendered_message
      })
    
      render plain: "Message sent"

    else
      render plain: "Message could not be sent", status: :unprocessable_entity
    end
  end


  def destroy
    @chat_conversation = ChatConversation.find_by(id: params[:id], conversation_id: params[:chat_id])
  
    if @chat_conversation.nil?
      Rails.logger.error("Chat not found")
    end
  
    if @chat_conversation.destroy
      head :no_content
    else
      Rails.logger.error("Failed")
    end
  end
  

  private

  def chat_message_params
    params.require(:chat_conversation).permit(:content, :file)
  end
end
