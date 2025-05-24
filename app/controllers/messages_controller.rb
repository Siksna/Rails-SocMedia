class MessagesController < ApplicationController
  before_action :set_message, only: [:show, :edit, :update, :destroy, :toggle_like]
  before_action :authenticate_user!
  

  def show
    @message = Message.find(params[:id])
    @reply = Reply.new
    @replies = @message.replies.includes(:user, :children).where(parent_id: nil).order(created_at: :desc).limit(15)
    @comment_count = message_data(@message)[:comment_count]
    render 'home/show'
  end
  

  

  def new
    @message = Message.new
    render 'home/new'
  end

  def create
    @message = current_user.messages.new(message_params)
    if @message.save
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
  

  def edit
    @message = Message.find(params[:id])
    if @message.user != current_user && !(current_user&.admin? || current_user&.moderator?)
      redirect_to messages_path, alert: 'You are not authorized to edit this message.' and return
    end
    render 'home/edit'
  end
  
  def update
    old_content = @message.content 
  
    if @message.update(message_params)
      if current_user&.admin? && old_content != @message.content
        AdminActivity.create(
          admin: current_user,
          action: "Edited message",
          description: "from #{old_content.truncate(100)} to #{@message.content.truncate(100)}",
          target: @message.user.username
        )
      end
  
      if params[:message][:remove_file] == '1'
        @message.file.purge
      end
      redirect_to @message, notice: 'Message and file succesfuly edited.'
    else
      render :edit
    end
  end
  
  

  def destroy
    @message = Message.find(params[:id])
  
    if @message.user == current_user || current_user&.admin?
      if current_user&.admin?
        AdminActivity.create(
          admin: current_user,
          action: "Deleted message",
          description: "Content: #{@message.content.truncate(100)}",
          target: @message.user.username
        )
      end
  
      @message.destroy
      redirect_to root_path, notice: 'Message deleted.'
    else
      redirect_to root_path, alert: 'You are not authorized to delete the message.'
    end
  end
  
  


  def toggle_like
    @message = Message.find(params[:id])
    if current_user.liked?(@message)
      current_user.unlike(@message)
      liked = false
    else
      current_user.like(@message)
      liked = true

      if @message.user != current_user
        notification = Notification.create!(
          user: @message.user,
          sender_id: current_user.id,
          message_text: "liked your message",
          notification_type: "like",
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
    end
    respond_to do |format|
      format.json { render json: { likes_count: @message.likes.count, liked: liked } }
      format.html { redirect_to request.referer } 
    end
  end

  private

  def set_message
    @message = Message.find(params[:id])
    
  end

  def message_params
    params.require(:message).permit(:content, :file)
  end

  def message_data(message)
    direct_comments = message.replies.where(parent_id: nil).count
    all_replies = message.replies.joins(:children).count
  
    {
  id: message.id,
  content: message.content,
  user: message.user ? {
    id: message.user.id, 
    username: message.user.username,
    profile_picture_url: message.user.profile_picture.attached? ? url_for(message.user.profile_picture) : 'assets/images/default_profile.png'
  } : {
    username: 'Anonimous',
    profile_picture_url: 'assets/images/default_profile.png'
  },
  file_url: message.file.attached? ? url_for(message.file) : nil,
  comment_count: direct_comments + all_replies,
  created_at: message.created_at.iso8601
}

  end
end
