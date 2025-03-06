class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    @friends = current_user.friends
  end
end