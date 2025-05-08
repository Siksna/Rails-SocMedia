class HomeController < ApplicationController
  def index
   
      @messages = Message.all.includes(:user).all.order(created_at: :desc).limit(10)
      logger.debug "Ziņas: #{@messages.inspect}"  
   
  end


  def load_more
    if params[:before]
      messages = Message.visible.where("messages.id < ?", params[:before]).order(id: :desc).limit(10)
    elsif params[:after]
      messages = Message.visible.where("messages.id > ?", params[:after]).order(id: :asc).limit(10)
    else
      messages = Message.visible.order(id: :desc).limit(10)
    end

    render partial: "home/message", collection: messages, formats: [:html]
  end

  def about
  end

  def search_users
    if params[:query].present?
      query = params[:query].downcase
      @users_start_with = User.where("LOWER(username) LIKE ?", "#{query}%").limit(10)
      @users_rest = User.where("LOWER(username) LIKE ?", "%#{query}%")
                         .where.not("LOWER(username) LIKE ?", "#{query}%")
                         .limit(10)
      
      @users = @users_start_with + @users_rest
    else
      @users = []
    end
    
    respond_to do |format|
      format.html 
      format.json { render json: @users.pluck(:username) } 
    end
  end
end

