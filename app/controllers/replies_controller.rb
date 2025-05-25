class RepliesController < ApplicationController
  before_action :set_message, only: [:create, :edit, :update, :destroy, :toggle_like]
  before_action :set_reply, only: [:edit, :update, :destroy, :toggle_like]
  before_action :authorize_user!, only: [:edit, :update, :destroy]

def create
  @message = Message.find(params[:message_id])
  @reply = @message.replies.build(reply_params)
  @reply.user = current_user  
  @reply.parent_id = params[:reply][:parent_id]

  if @reply.save
    if @message.user != current_user
      notification = Notification.create!(
        user: @message.user,
        sender_id: current_user.id,
        message_text: "replied to your message",
        notification_type: "reply",
        read: false,
        notifiable: @message
      )

      NotificationChannel.broadcast_to(
        @message.user,
        notification_id: notification.id,
        message_text: notification.message_text,
        sender_id: current_user.id,
        notification_type: notification.notification_type,
        sender_username: current_user.username,
        created_at: notification.created_at.strftime("%b %d, %H:%M"),
        url: message_path(@message) 
      )
    end

    parent_reply = Reply.find_by(id: @reply.parent_id) if @reply.parent_id.present?
    if parent_reply && parent_reply.user != current_user && parent_reply.user != @message.user
      notification = Notification.create!(
        user: parent_reply.user,
        sender_id: current_user.id,
        message_text: "replied to your reply",
        notification_type: "reply",
        read: false,
        notifiable: @reply
      )

      NotificationChannel.broadcast_to(
        parent_reply.user,
        notification_id: notification.id,
        message_text: notification.message_text,
        sender_id: current_user.id,
        notification_type: notification.notification_type,
        sender_username: current_user.username,
        created_at: notification.created_at.strftime("%b %d, %H:%M"),
        url: message_path(@message)

      )
    end

    if @reply.content.present? && @reply.content.match(/^@(\w+)/)
      mentioned_username = @reply.content.match(/^@(\w+)/)[1]
      mentioned_user = User.find_by(username: mentioned_username)

      if mentioned_user &&
         mentioned_user != current_user &&
         mentioned_user != @message.user &&
         (!parent_reply || mentioned_user != parent_reply.user)

        notification = Notification.create!(
          user: mentioned_user,
          sender_id: current_user.id,
          message_text: "mentioned you in a reply",
          notification_type: "reply",
          read: false
        )

        NotificationChannel.broadcast_to(
          mentioned_user,
          notification_id: notification.id,
          message_text: notification.message_text,
          sender_id: current_user.id,
          notification_type: notification.notification_type,
          sender_username: current_user.username,
          created_at: notification.created_at.strftime("%b %d, %H:%M"),
          url: message_path(@message)
        )
      end
    end

    respond_to do |format|
      format.html do
        render partial: 'home/reply', locals: { reply: @reply }
      end
      format.turbo_stream
      format.json do
        render partial: 'home/reply', locals: { reply: @reply }, formats: [:html]
      end
    end
  else
    render json: { error: 'Could not save reply' }, status: :unprocessable_entity
  end
end




def load_more
  if params[:message_id].blank?
    render plain: "Missing message_id", status: :bad_request and return
  end

  @message = Message.find(params[:message_id])

  @replies = @message.replies.where(parent_id: nil).where('id < ?', params[:after]).order(id: :desc).limit(15)
@last_reply_id = @replies.last&.id

render partial: 'home/reply', collection: @replies, as: :reply, locals: { last_reply: @last_reply_id }
      end



  def edit
    render 'home/_edit_replies'
  end

  def update
    old_content = @reply.content  
  
    if params[:reply][:remove_file] == '1'
      @reply.file.purge
    end
  
    if @reply.update(reply_params)
      if current_user&.admin? && old_content != @reply.content
        AdminActivity.create(
          admin: current_user,
          action: "Edited reply",
          description: "from #{old_content.truncate(100)}, to #{@reply.content.truncate(100)})",
          target: @reply.user.username
        )
      end
  
      redirect_to message_path(@message), notice: 'Reply renewed.'
    else
      render :edit
    end
  end
  

def destroy
  if @reply.user == current_user || current_user&.admin?
    if current_user&.admin?
      AdminActivity.create(
        admin: current_user,
        action: "Deleted reply",
        description: "Content: #{@reply.content.truncate(100)}",
        target: @reply.user.username
      )
    end

    @reply.destroy
    redirect_to message_path(@message), notice: 'Deleted reply.'
  else
    redirect_to message_path(@message), alert: 'You are not autherized to delete this reply.'
  end
end



  def toggle_like
    @reply = Reply.find(params[:id])
    if current_user.liked?(@reply)
      current_user.unlike(@reply)
      liked = false
    else
      current_user.like(@reply)
      liked = true

      if @reply.user != current_user
        notification = Notification.create!(
          user: @reply.user,
          sender_id: current_user.id,
          message_text: "liked your reply",
          notification_type: "like",
          read: false
        )
  
        NotificationChannel.broadcast_to(
          @reply.user,
          notification_id: notification.id,
          message_text: notification.message_text,
          sender_id: current_user.id,
          notification_type: notification.notification_type,
          sender_username: current_user.username,
          created_at: notification.created_at.strftime("%b %d, %H:%M"),
          url: message_path(@message)

        )
      end
    end
    respond_to do |format|
      format.json { render json: { likes_count: @reply.likes.count, liked: liked } }
      format.html { redirect_to request.referer } 
    end 
    end

  private

  def set_message
    @message = Message.find(params[:message_id])
  end

  def set_reply
    @reply = @message.replies.visible.find(params[:id])
  end

  def reply_params
    params.require(:reply).permit(:content, :file, :parent_id)
  end

  def authorize_user!
    unless @reply.user == current_user || (current_user&.admin? || current_user&.moderator?)
      redirect_to message_path(@message), alert: 'You are not autherized to delete or edit the reply.'
    end
  end  
end
