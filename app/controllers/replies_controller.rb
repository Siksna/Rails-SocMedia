class RepliesController < ApplicationController
  before_action :set_message, only: [:create, :edit, :update, :destroy]
  before_action :set_reply, only: [:edit, :update, :destroy]

  def create
    @message = Message.find(params[:message_id])
    @reply = @message.replies.build(reply_params)
    @reply.user = current_user  
    if @reply.save
      redirect_to @message, notice: 'Reply was successfully created.'
    else
      render :new
    end
  end

  def edit
   
  end

  def update
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

  private

  def set_message
    @message = Message.find(params[:message_id])
  end

  def set_reply
    @reply = @message.replies.find(params[:id])
  end

  def reply_params
    params.require(:reply).permit(:content, :file)
  end
end
