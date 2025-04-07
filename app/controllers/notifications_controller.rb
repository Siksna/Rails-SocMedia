class NotificationsController < ApplicationController
    before_action :authenticate_user!
  
    def unread
      unread_notifications = Notification.where(user: current_user, read: false)
    
      respond_to do |format|
        format.json { render json: { unread_count: unread_notifications.count, unread_notifications: unread_notifications.as_json(only: [:id, :conversation_id]) } }
        format.html { redirect_to root_path } 
      end
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
  
