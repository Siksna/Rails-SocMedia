class MessagesController < ApplicationController
  before_action :set_message, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!, only: [:edit, :update, :destroy]
  
 

  def index
    @messages = Message.includes(:user).all.order(created_at: :desc)
    messages_data = @messages.map { |message| message_data(message) }
    Rails.logger.debug(messages_data.inspect)
    render json: messages_data
  end
  

  

  def show
    @message = Message.find(params[:id])
    @reply = Reply.new
    @replies = @message.replies.includes(:user, :children).where(parent_id: nil).order(created_at: :desc)
    render 'home/show'
  end
  

  def new
    @message = Message.new
    render 'home/new'
  end

  def create
    @message = current_user.messages.new(message_params)
    if @message.save
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
  

  def edit
    @message = Message.find(params[:id])
    if @message.user != current_user
      redirect_to messages_path, alert: 'Jūs nēsat autorizēts rediģēt šo ziņu.'
    end
    render 'home/edit'
  end

  def update
    if @message.update(message_params)
      if params[:message][:remove_file] == '1'
        @message.file.purge
      end
      redirect_to @message, notice: 'Ziņa un fails ir veiksmīgi rediģēti.'
    else
      render :edit
    end
  end


  def destroy
    @message = Message.find(params[:id])
  if @message.user == current_user
    @message.destroy
    redirect_to root_path, notice: 'Ziņa veiksmīgi dzēsta.'
  else
    redirect_to root_path, alert: 'Jūs nēsat autorizēts dzēst šo ziņu.'
  end
  end

  private

  def set_message
    @message = Message.find(params[:id])
    
  end

  def message_params
    params.require(:message).permit(:content, :file)
  end

  def message_data(message)
    direct_comments = message.replies.where(parent_id: nil).count
    all_replies = message.replies.joins(:children).count
  
    {
      id: message.id,
      content: message.content,
      user: message.user ? {
        id: message.user.id, 
        username: message.user.username,
        profile_picture_url: message.user.profile_picture.attached? ? url_for(message.user.profile_picture) : 'default_profile.png'
      } : {
        username: 'Anonīms',
        profile_picture_url: 'default_profile.png'
      },
      file_url: message.file.attached? ? url_for(message.file) : nil,
      comment_count: direct_comments + all_replies
    }
  end
end
