class ChatChannel < ApplicationCable::Channel
  def subscribed
    @conversation = Conversation.find(params[:chat_id])
    stream_for @conversation 
  end

  def unsubscribed
  end
end
