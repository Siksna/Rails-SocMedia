class MessagesController < ApplicationController
    before_action :set_message, only: [:show, :edit, :update, :destroy]
  
    def index
        @messages = Message.all.order(created_at: :desc)
        render json: @messages
        render 'home/index'
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
          file_url = url_for(@message.file) if @message.file.attached?
          render json: @message.as_json.merge(file_url: file_url), status: :created
        else
          render json: @message.errors, status: :unprocessable_entity
        end
      end
  
    def edit
        render 'home/edit'
    end
  
    def update
      if @message.update(message_params)
        redirect_to @message, notice: 'Ziņa rediģēta.'
      else
        render :edit
      end
      render 'home/update'
    end
  
    def destroy
      @message.destroy
      redirect_to messages_url, notice: 'Ziņa dzēsta.'
      
    end
  
    private
      def set_message
        @message = Message.find(params[:id])
      end
  
      def message_params
        params.require(:message).permit(:content, :file)
      end
  end
  