class RepliesController < ApplicationController
    def create
      @message = Message.find(params[:message_id])
      @reply = @message.replies.build(reply_params)
      if @reply.save
        redirect_to message_path(@message), notice: 'Atbilde noūtīta.'
      else
        redirect_to message_path(@message), alert: 'Kļūda, radās problēma nosūtot atbildi.'
      end
    end
  
    private
  
    def reply_params
      params.require(:reply).permit(:content, :file)
    end
  end
  