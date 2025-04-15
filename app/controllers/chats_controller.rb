class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    @conversations = Conversation
      .includes(:sender, :receiver, chat_conversations: [:sender, :receiver])
      .where("sender_id = :id OR receiver_id = :id", id: current_user.id)
  
    convo_times = @conversations.index_with do |convo|
      convo.chat_conversations.maximum(:created_at)&.to_i || 0
    end
  
    @sorted_conversations = convo_times.sort_by { |_, time| -time }.map(&:first)
  
    @last_messages = {}
    @sorted_conversations.each do |convo|
      last_message = convo.chat_conversations.order(created_at: :desc).first
      @last_messages[convo.id] = last_message&.content
    end
  end
  
  

  def show
    @conversation = Conversation.find(params[:id])
  
    @chat_conversations = @conversation.chat_conversations.order(created_at: :asc)
  
    unless [@conversation.sender, @conversation.receiver].include?(current_user)
      redirect_to root_path, alert: "You are not authorized to access this chat."
    end
  end
  
end
