class RelationshipsController < ApplicationController
  before_action :find_user

  def create
    current_user.follow(@user) unless current_user.following?(@user)

    if @user.following?(current_user)
      Friendship.create(user: current_user, friend: @user)
      Friendship.create(user: @user, friend: current_user)
    end

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
