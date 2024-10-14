class LikesController < ApplicationController
  before_action :find_message_or_reply, only: [:toggle]

  def toggle
    if @message
      toggle_like(@message)
      render json: { liked_by_user: @message.liked_by?(current_user), like_count: @message.likes.count }
    elsif @reply
      toggle_like(@reply)
      render json: { liked_by_user: @reply.liked_by?(current_user), like_count: @reply.likes.count }
    else
      render json: { error: "Invalid object" }, status: :unprocessable_entity
    end
  end

  private

  def toggle_like(likeable)
    if likeable.liked_by?(current_user)
      likeable.likes.find_by(user: current_user)&.destroy
    else
      likeable.likes.create(user: current_user)
    end
  end

  def find_message_or_reply
    @message = Message.find(params[:message_id]) if params[:message_id]
    @reply = Reply.find(params[:reply_id]) if params[:reply_id]
  end
end
