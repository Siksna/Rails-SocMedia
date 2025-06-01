class ChatsController < ApplicationController
  before_action :authenticate_user!
  def index
    hidden_convo_ids = HiddenChat.where(user: current_user).pluck(:conversation_id)
  
    @conversations = Conversation.includes(:sender, :receiver, chat_conversations: [:sender, :receiver]).where("sender_id = :id OR receiver_id = :id", id: current_user.id)
  
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
  
    @sorted_conversations = convo_times.sort_by { |_, time| -time }.map(&:first).first(10)
  
    @last_messages = {}
    @sorted_conversations.each do |convo|
      last_message = convo.chat_conversations.order(created_at: :desc).first
      @last_messages[convo.id] = last_message&.content

    end
  end
  
  
  def load_more_conversations
  after_timestamp = Time.at(params[:after].to_i)

  hidden_convo_ids = HiddenChat.where(user: current_user).pluck(:conversation_id)

  conversations = Conversation
    .includes(:sender, :receiver, chat_conversations: [:sender, :receiver])
    .where("sender_id = :id OR receiver_id = :id", id: current_user.id)
    .reject { |c| hidden_convo_ids.include?(c.id) }

  sorted = conversations.select do |convo|
    last_time = convo.chat_conversations.maximum(:created_at)&.to_i
    last_time.present? && last_time < after_timestamp.to_i
  end

  convo_times = sorted.index_with do |convo|
    convo.chat_conversations.maximum(:created_at)&.to_i || 0
  end
  sorted_convos = convo_times.sort_by { |_, time| -time }.map(&:first)
  @index_conversations = sorted_convos.first(10) 
  @has_more = sorted_convos.size > 10

  @last_messages = {}
  @index_conversations.each do |convo|
    last_message = convo.chat_conversations.order(created_at: :desc).first
    @last_messages[convo.id] = last_message&.content
  end

  render partial: "chats/index_conversation", locals: {
    index_conversations: @index_conversations,
    has_more: @has_more
  }
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
  
    @conversation = Conversation.find(params[:id])

@read_status = ChatReadStatus.find_by(user: current_user, conversation: @conversation)

if @read_status.nil?
  @read_status = ChatReadStatus.create(user: current_user, conversation: @conversation, last_read_at: Time.current)
elsif @read_status.last_read_at.nil?
  @read_status.update(last_read_at: Time.current)
end




  end
  



 def load_more
  # Atrod sarunu (conversation) pēc ID, kas tika padots kā parametrs.
  @conversation = Conversation.find(params[:id])

  # Pārbauda, vai pašreizējais lietotājs ir vai nu sarunas sūtītājs vai saņēmējs.
  unless [@conversation.sender, @conversation.receiver].include?(current_user)
    head :forbidden # Ja nav, nosūta kļūdas ziņojumu.
    return
  end

  # Pārbauda vai tika padots `before` parametrs
  if params[:before]
    # Atrod konkrēto ziņu, no kuras jāsāk filtrēt vecākas ziņas
    before_message = @conversation.chat_conversations.find_by(id: params[:before])

    # Ja tā ziņa tika atrasta, tiek atgrieztas 20 ziņas, vecākas par to
    @chat_conversations = if before_message
      @conversation.chat_conversations
        .where("created_at < ?", before_message.created_at) # Ņemtas tikai ziņas, kas izveidotas pirms šīs
        .order(created_at: :desc)                          # Sakārto pēc auguma dilstoši, jaunākās vispirms
        .limit(20)                                          # Tikai 20 ziņas atgriež
    else
      [] # Ja ziņa netika atrasta, atgriež tukšu masīvu
    end
  else
    # Ja `before` parametrs nav padots, ielādē pēdējās 20 ziņas šajā sarunā
    @chat_conversations = @conversation.chat_conversations
      .order(created_at: :desc)
      .limit(20)
  end

  # Ziņas tiek apgrieztas, lai tās būtu hronoloģiskā secībā (vecākās vispirms, kā parasti tiek rādīts čatā)
  @chat_conversations = @chat_conversations.reverse

  # Tiek apskatīts vai lietotājs ir redzējis sūtītās ziņas no otras personas
  @read_status = ChatReadStatus.find_by(user: current_user, conversation: @conversation)

# Atgriež tikai HTML fragmentu (_chat_conversation.html.erb), kas tiks ielādēts dinamiski ar JavaScript
# Padod tam mainīgo `chat_conversations`, kas satur iepriekš atlasītās ziņas
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
  @conversation = Conversation.find(params[:id])

  if [@conversation.sender_id, @conversation.receiver_id].include?(current_user.id)
    HiddenChat.find_or_create_by(user: current_user, conversation: @conversation)

    respond_to do |format|
      format.js   { head :ok }
      format.html { redirect_to chats_path, notice: "Chat hidden." }
    end
  else
    respond_to do |format|
      format.js   { head :unauthorized }
      format.html { redirect_to root_path, alert: "Unauthorized" }
    end
  end
end

  
end
