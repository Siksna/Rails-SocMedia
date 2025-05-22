class HomeController < ApplicationController
  def index
    base_scope = Message.visible.includes(:user).order(created_at: :desc)
    
    if params[:feed] == "following"
       @messages = base_scope.from_followed_users(current_user).limit(10)
    else
      @messages = base_scope.limit(10)
    end
  
end



 def load_more
  puts "PARAMS FEED: #{params[:feed].inspect}"

  base_scope = Message.visible.order(id: :desc)

  if params[:feed] == 'following'
    base_scope = base_scope.from_followed_users(current_user)
  end

  if params[:before]
    messages = base_scope.where("messages.id > ?", params[:before]).limit(10)
  elsif params[:after]
    messages = base_scope.where("messages.id < ?", params[:after]).limit(10)
  else
    messages = base_scope.limit(10)
  end

  render partial: "home/message", collection: messages, formats: [:html]
end

   def notifications
    @notifications = current_user.notifications.includes(:sender).where.not(notification_type: 'chats').order(created_at: :desc)
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

