class SessionsController < Devise::SessionsController
    after_action :set_user_cookie, only: [:create]
  
    
    private
  
    def set_user_cookie
      cookies.signed[:user_id] = current_user.id if current_user
    end
  end
  