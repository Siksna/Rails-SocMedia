class RelationshipsController < ApplicationController
  before_action :find_user

  def create
    current_user.follow(@user) unless current_user.following?(@user)

    if @user.following?(current_user)
      Friendship.create(user: current_user, friend: @user)
      Friendship.create(user: @user, friend: current_user)
    end

    @notification = Notification.create!(
      user: @user,
      sender: current_user,
      message_text: "new follower",
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
      created_at: @notification.created_at.strftime("%b %d, %H:%M"),
      url: profile_path(current_user)
    )

    respond_to do |format|
      format.html { redirect_to profile_path(@user) }
      format.js
    end
  end

  def destroy
    current_user.unfollow(@user)

    Friendship.where(user: current_user, friend: @user).destroy_all
    Friendship.where(user: @user, friend: current_user).destroy_all

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
