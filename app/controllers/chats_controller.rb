class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    hidden_convo_ids = HiddenChat.where(user: current_user).pluck(:conversation_id)
  
    @conversations = Conversation
      .includes(:sender, :receiver, chat_conversations: [:sender, :receiver])
      .where("sender_id = :id OR receiver_id = :id", id: current_user.id)
  
      @conversations = @conversations.reject do |convo|
        hidden = HiddenChat.find_by(user: current_user, conversation: convo)
        last_message_time = convo.chat_conversations.maximum(:created_at)
      
        other_user = convo.sender == current_user ? convo.receiver : convo.sender
        are_friends = current_user.friends.include?(other_user)
      
        if hidden
          if (last_message_time && last_message_time > hidden.created_at) || are_friends
            hidden.destroy
            false
          else
            true
          end
        else
          false
        end
      end
      
      
      
  
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
  

  def hide
    conversation = Conversation.find(params[:id])
  
    if [conversation.sender_id, conversation.receiver_id].include?(current_user.id)
      HiddenChat.find_or_create_by(user: current_user, conversation: conversation)
      redirect_to chats_path, notice: "Chat hidden."
    else
      redirect_to root_path, alert: "Unauthorized"
    end
  end
  
end
