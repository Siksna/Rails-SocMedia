class ProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :find_user, only: [:show, :followers, :following, :load_more_activities]

  def show
if params[:liked] == 'true'
  @activities = @user.likes.includes(:likeable).order(created_at: :desc).limit(10).map(&:likeable).compact
else
  messages = @user.messages.order(created_at: :desc).limit(10)
  replies = @user.replies.order(created_at: :desc).limit(10)
  @activities = (messages + replies).sort_by(&:created_at).reverse
end

    respond_to do |format|
      format.html
      format.js
    end
  end

   def load_more_activities
    @user = User.find(params[:id])
    last_activity_id = params[:last_activity_id]

    if params[:liked] == 'true'
      liked_activities_query = @user.likes.includes(:likeable).order(created_at: :desc)

      if last_activity_id.present?
        last_liked_item = Message.find_by(id: last_activity_id)
        last_liked_item ||= Reply.find_by(id: last_activity_id)

        if last_liked_item
          last_like_record = @user.likes.find_by(likeable: last_liked_item)

          if last_like_record
            liked_activities_query = liked_activities_query
                                     .where("likes.created_at < ?", last_like_record.created_at)
                                     .or(liked_activities_query.where("likes.created_at = ? AND likes.id < ?", last_like_record.created_at, last_like_record.id))
          end
        end
      end

      @activities = liked_activities_query.limit(10).map(&:likeable).compact

    else
      messages_query = @user.messages.order(created_at: :desc)
      replies_query = @user.replies.order(created_at: :desc)

      if last_activity_id.present?
        last_item = (Message.find_by(id: last_activity_id) || Reply.find_by(id: last_activity_id))
        if last_item
          messages_query = messages_query.where("created_at < ?", last_item.created_at)
                                         .or(messages_query.where("created_at = ? AND id < ?", last_item.created_at, last_item.id))
          replies_query = replies_query.where("created_at < ?", last_item.created_at)
                                       .or(replies_query.where("created_at = ? AND id < ?", last_item.created_at, last_item.id))
        end
      end

      messages = messages_query.limit(10)
      replies = replies_query.limit(10)
      @activities = (messages + replies).sort_by(&:created_at).reverse.take(10) # Combine and take top N
    end

    render partial: 'activity', collection: @activities, as: :activity, layout: false
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