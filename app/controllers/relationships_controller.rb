class RelationshipsController < ApplicationController
  before_action :authenticate_user!
  before_action :find_user

  def create
    unless current_user.following?(@user)
      current_user.follow(@user)

      if @user.following?(current_user)
        Friendship.find_or_create_by(user: current_user, friend: @user)
        Friendship.find_or_create_by(user: @user, friend: current_user)
      end

      if @user != current_user
        @notification = Notification.create!(
          user: @user,
          sender: current_user,
          message_text: "started following you",
          notification_type: "follow",
          read: false,
          notifiable: @user
        )
        NotificationChannel.broadcast_to(
          @user,
          notification_id: @notification.id,
          message_text: @notification.message_text,
          sender_id: current_user.id,
          notification_type: @notification.notification_type,
          sender_username: current_user.username,
          created_at: @notification.created_at.to_i,
          url: profile_path(current_user)
        )
      end
    end

    respond_to do |format|
      format.json {
        render json: {
          following: true,
          followers_count: @user.followers.count,
          friends_with: current_user.friends_with?(@user)
        }
      }
      format.html { redirect_to profile_path(@user) }
    end
  end

  def destroy
    current_user.unfollow(@user)

    Friendship.where(user: current_user, friend: @user).destroy_all
    Friendship.where(user: @user, friend: current_user).destroy_all

    respond_to do |format|
      format.json {
        render json: {
          following: false,
          followers_count: @user.followers.count,
          friends_with: current_user.friends_with?(@user)
        }
      }
      format.html { redirect_to profile_path(@user) }
    end
  end

  private

  def find_user
    @user = User.find(params[:id])
  end
end