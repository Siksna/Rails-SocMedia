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
  if params[:reply][:remove_file] == '1'
    @reply.file.purge
  end

  if @reply.update(reply_params)
    redirect_to message_path(@message), notice: 'Atbilde atjaunināta.'
  else
    render :edit
  end
end

  def destroy
    @reply.destroy
    redirect_to message_path(@message), notice: 'Atbilde dzēsta.'
  end


  def toggle_like
    @reply = Reply.find(params[:id])
    if current_user.liked?(@reply)
      current_user.unlike(@reply)
    else
      current_user.like(@reply)
    end
    redirect_to request.referer
  end

  private

  def set_message
    @message = Message.find(params[:message_id])
  end

  def set_reply
    @reply = @message.replies.find(params[:id])
  end

  def reply_params
    params.require(:reply).permit(:content, :file, :parent_id)
  end

  def authorize_user!
    unless @reply.user == current_user
      redirect_to message_path(@message), alert: 'Jūs nēsat autorizēts rediģēt vai dzēst šo atbildi.'
    end
  end
end
