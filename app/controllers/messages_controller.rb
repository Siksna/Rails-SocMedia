class MessagesController < ApplicationController
  before_action :set_message, only: [:show, :edit, :update, :destroy]

  def index
    @messages = Message.all.order(created_at: :desc)
    render json: @messages.map { |message| message_data(message) }
  end

  def show
    @message = Message.find(params[:id])
    @reply = Reply.new
    @replies = @message.replies
    render 'home/show'
  end

  def new
    @message = Message.new
    render 'home/new'
  end

  def create
    @message = Message.new(message_params)
    if @message.save
      render json: message_data(@message), status: :created
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def edit
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
    @message.destroy
    redirect_to root_path, notice: 'Ziņa veiksmīgi dzēsta.'
  end

  private

  def set_message
    @message = Message.find(params[:id])
  end

  def message_params
    params.require(:message).permit(:content, :file)
  end

  def message_data(message)
    data = {
      id: message.id,
      content: message.content
    }

    data[:file_url] = url_for(message.file) if message.file.attached?

    data
  end
end
