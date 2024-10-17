class HomeController < ApplicationController
  def index
   
      @messages = Message.all.includes(:user).all.order(created_at: :desc)
      logger.debug "Ziņas: #{@messages.inspect}"  
   
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

