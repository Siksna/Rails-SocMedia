class BookmarksController < ApplicationController
  before_action :authenticate_user!

 def index
    @bookmarked_items = current_user.bookmarks
      .includes(:bookmarkable)
      .order(created_at: :desc)
      .limit(10)

     respond_to do |format|
      format.html { render 'home/bookmarks' }
    end
  end

def load_more
  raw_bookmarks = current_user.bookmarks
    .includes(bookmarkable: [:user, :likes, :replies, { file_attachment: :blob }])
    .order(created_at: :desc)

  if params[:after].present?
    raw_bookmarks = raw_bookmarks.where("bookmarks.id < ?", params[:after])
  end

  valid_bookmarks = raw_bookmarks.select { |b| b.bookmarkable.present? }

  @bookmarks = valid_bookmarks.first(10)

  render partial: 'home/bookmark', collection: @bookmarks, as: :bookmark, layout: false
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
