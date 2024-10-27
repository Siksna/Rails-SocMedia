class ProfilesController < ApplicationController
  before_action :find_user, only: [:follow, :unfollow]

    def show
      @user = User.find(params[:id])
  
      if params[:liked] == 'true'
        liked_messages = @user.liked_messages
        liked_replies = @user.liked_replies
  
        @activities = (liked_messages + liked_replies).sort_by { |activity| activity.likes.find_by(user: @user).created_at }.reverse
      else
        @posts = @user.messages.order(created_at: :desc)
        @replies = @user.replies.order(created_at: :desc)
        @activities = (@posts + @replies).sort_by(&:created_at).reverse
      end
    end


    def followers
      @user = User.find(params[:id])
      @followers = @user.followers
    end
    
    def following
      @user = User.find(params[:id])
      @following = @user.following
    end


    
    def follow
      current_user.following << @user unless current_user.following.include?(@user)
      respond_to do |format|
        format.html { redirect_to profile_path(@user) }
        format.js
      end
    end
  
    def unfollow
      current_user.following.delete(@user)
      respond_to do |format|
        format.html { redirect_to profile_path(@user) }
        format.js
      end
    end

  private

  def find_user
    @user = User.find(params[:id])
  end
  end
  