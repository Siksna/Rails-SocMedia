class RelationshipsController < ApplicationController
  before_action :set_user

  def create
    current_user.following << @user unless current_user.following.include?(@user)
    respond_to do |format|
      format.html { redirect_to profile_path(@user) }
      format.js
    end
  end

  def destroy
    current_user.following.delete(@user)
    respond_to do |format|
      format.html { redirect_to profile_path(@user) }
      format.js
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end
end
