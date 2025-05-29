class ProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :find_user, only: [:show, :followers, :following, :load_more_activities]

def show
  @user = User.find(params[:id])

 if params[:liked] == 'true'
  @activities = @user.likes
                     .includes(:likeable)
                     .order(created_at: :desc)
                     .limit(10)
else
    @activities = @user.activities
                       .includes(:actionable)
                       .order(id: :desc)
                       .limit(10)
  end

  respond_to do |format|
    format.html
    format.js
  end
end


def load_more_activities
  @user = User.find(params[:id])
  last_id = params[:last_activity_id]

if params[:liked] == 'true'
  likes = @user.likes.includes(:likeable).order(created_at: :desc)
  likes = likes.where('likes.id < ?', last_id) if last_id.present?
  @activities = likes.limit(10)
else
    activities = @user.activities.includes(:actionable).order(id: :desc)
    activities = activities.where('activities.id < ?', last_id) if last_id.present?
    @activities = activities.limit(10)
  end

  render partial: 'profiles/activity',
         collection: @activities,
         as:         :activity,
         layout:     false
end







  def followers
    @user = User.find(params[:id])
    @followers = @user.followers
  end

  def following
    @user = User.find(params[:id])
    @following = @user.following
  end

  private

  def find_user
    @user = User.find(params[:id])
  end
end