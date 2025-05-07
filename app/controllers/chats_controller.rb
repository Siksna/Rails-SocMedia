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
  
    unless [@conversation.sender, @conversation.receiver].include?(current_user)
      redirect_to root_path, alert: "You are not authorized to access this chat."
      return
    end
  
    if params[:before]
      before_message = @conversation.chat_conversations.find_by(id: params[:before])
      @chat_conversations = if before_message
        @conversation.chat_conversations.where("created_at < ?", before_message.created_at).order(created_at: :desc).limit(50)
      else
        []
      end
    else
      @chat_conversations = @conversation.chat_conversations.order(created_at: :desc).limit(100)
    end
  
    @chat_conversations = @chat_conversations.reverse
  
    @read_status = ChatReadStatus.find_by(user: current_user, chat: @conversation)
  
    if @read_status.nil?
      @read_status = ChatReadStatus.create(user: current_user, chat: @conversation, last_read_at: Time.current)
    elsif @read_status.last_read_at.nil?
      @read_status.update(last_read_at: Time.current)
    end

  end
  



  def load_more
    @conversation = Conversation.find(params[:id])
  
    unless [@conversation.sender, @conversation.receiver].include?(current_user)
      head :forbidden
      return
    end
  
    if params[:before]
      before_message = @conversation.chat_conversations.find_by(id: params[:before])
      @chat_conversations = if before_message
        @conversation.chat_conversations.where("created_at < ?", before_message.created_at).order(created_at: :desc).limit(20)
      else
        []
      end
    else
      @chat_conversations = @conversation.chat_conversations.order(created_at: :desc).limit(20)
    end
  
    @chat_conversations = @chat_conversations.reverse
  
    @read_status = ChatReadStatus.find_by(user: current_user, chat: @conversation)
  
    render partial: "chats/chat_conversation", locals: { chat_conversations: @chat_conversations }
  end
  




  def update_last_read_at
    read_status = ChatReadStatus.find_or_initialize_by(user: current_user, chat_id: params[:id])
  
    if read_status.last_read_at.nil? || read_status.last_read_at < Time.current
      read_status.last_read_at = Time.current
      read_status.save!
    else
      Rails.logger.debug "last_read_at is up to date: #{read_status.last_read_at}"
    end
  
    render json: { success: true }
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
