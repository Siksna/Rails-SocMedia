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
      redirect_to @message, notice: 'Atbilde veiksmīgi izveidota.'
    else
      render :new
    end
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
  
      redirect_to message_path(@message), notice: 'Atbilde atjaunināta.'
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
    redirect_to message_path(@message), notice: 'Atbilde dzēsta.'
  else
    redirect_to message_path(@message), alert: 'Jūs nēsat autorizēts dzēst šo atbildi.'
  end
end



  def toggle_like
    @reply = Reply.find(params[:id])
    if current_user.liked?(@reply)
      current_user.unlike(@reply)
    else
      current_user.like(@reply)

      if @reply.user != current_user
        notification = Notification.create!(
          user: @reply.user,
          sender_id: current_user.id,
          message: "#{current_user.username} liked your message",
          notification_type: "like",
          read: false
        )
  
        NotificationChannel.broadcast_to(
          @message.user,
          notification_id: notification.id,
          message: notification.message,
          notification_type: notification.notification_type,
          sender_username: current_user.username,
          created_at: notification.created_at.strftime("%b %d, %H:%M")
        )
      end
    end
    redirect_to request.referer
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
      redirect_to message_path(@message), alert: 'Jūs nēsat autorizēts rediģēt vai dzēst šo atbildi.'
    end
  end  
end
