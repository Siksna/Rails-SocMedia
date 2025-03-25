class NotificationsController < ApplicationController
    before_action :authenticate_user!
  
    def unread
      unread_count = Notification.where(user: current_user, read: false).count
  
      render json: { unread_count: unread_count }
    end
  
  
    def mark_as_read
      conversation = Conversation.find(params[:conversation_id])
      current_user.notifications.where(conversation: conversation).update_all(read: true)
  
      render json: { success: true }
    end
  end
  