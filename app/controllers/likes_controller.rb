class LikesController < ApplicationController
    before_action :find_message_or_reply, only: [:toggle]
  
    def toggle
      if @message
        toggle_like(@message)
      elsif @reply
        toggle_like(@reply)
      end
      redirect_back(fallback_location: root_path)
    end
  
    private
  
    def toggle_like(likeable)
      if likeable.liked_by?(current_user)
        likeable.likes.find_by(user: current_user).destroy
      else
        likeable.likes.create(user: current_user)
      end
    end
  
    def find_message_or_reply
      @message = Message.find(params[:message_id]) if params[:message_id]
      @reply = Reply.find(params[:reply_id]) if params[:reply_id]
    end
  end
  