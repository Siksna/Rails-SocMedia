class BookmarksController < ApplicationController
  before_action :authenticate_user!

def index
  @bookmarked_items = current_user.bookmarks.includes(:bookmarkable).order(created_at: :desc)

  render 'home/bookmarks'
end

def create
  bookmarkable = find_bookmarkable
  bookmark = current_user.bookmarks.find_or_create_by(bookmarkable: bookmarkable)

  render json: { bookmarked: true }
end

def destroy
  bookmarkable = find_bookmarkable
  current_user.bookmarks.where(bookmarkable: bookmarkable).destroy_all

  render json: { bookmarked: false }
end

private

def find_bookmarkable
  if params[:message_id]
    Message.find(params[:message_id])
  elsif params[:id] && request.path.include?('/replies/')
    Reply.find(params[:id])
  else
    raise ActiveRecord::RecordNotFound
  end
end

end
