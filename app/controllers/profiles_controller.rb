class ProfilesController < ApplicationController

    def show
        
              @user = User.find(params[:id])
              @posts = @user.messages.order(created_at: :desc)
              @replies = @user.replies.order(created_at: :desc)
    end

end
