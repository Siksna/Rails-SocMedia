class NotificationsController < ApplicationController
    before_action :authenticate_user!

    def unread
      if request.format.html?
        redirect_to root_path and return
      end
    
      user = current_user
    
      chat_notifications = Notification.where(user: user, notification_type: 'chats', read: false)
      
      general_notifications = Notification.where(user: user)
                                           .where.not(notification_type: 'chats')
                                           .where(read: false)
    
      unread_notifications = chat_notifications.group(:conversation_id).count
    
      render json: {
  chat_unread_count: chat_notifications.count,
  general_unread_count: general_notifications.count,
  general_notifications: general_notifications.includes(:sender).map do |notification|
    {
      id: notification.id,
      message_text: notification.message_text,
      created_at: notification.created_at,
      sender_id: notification.sender_id,
      sender_username: notification.sender&.username,
      url: notification.url,
       sender_avatar_url: notification.sender.profile_picture.attached? ?
                            Rails.application.routes.url_helpers.rails_blob_path(notification.sender.profile_picture, only_path: true) :
                            ActionController::Base.helpers.asset_path("default_profile.png"),
      sender_avatar_color: notification.sender.profile_color
    }
  end,
  unread_notifications: unread_notifications
}


    end
    

    
    
    
  
  
    def mark_as_read
      conversation = Conversation.find_by(id: params[:conversation_id])
    
      if conversation
        current_user.notifications.where(conversation: conversation, read: false).update_all(read: true)
        render json: { success: true }
      else
        render json: { error: "Conversation not found" }, status: :not_found
      end
    end


    def mark_as_read_notification
      notification = Notification.find_by(id: params[:id], user: current_user)
    
      if notification
        notification.update(read: true)
        render json: { success: true }
      else
        render json: { error: "Notification not found" }, status: :not_found
      end
    end
    
    
  
    def destroy
      @notification = Notification.find_by(id: params[:id], chat_conversation_id: params[:chat_conversation_id])
    
      if @notification.nil?
        render json: { error: "Notification not found" }, status: :not_found
        return
      end
    
      if @notification.destroy
        render json: { success: true }, status: :ok
      else
        render json: { error: "Failed to delete notification" }, status: :unprocessable_entity
      end
    end
    
    
  end
  
