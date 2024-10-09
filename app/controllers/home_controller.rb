class HomeController < ApplicationController
  def index
  end

  def about
  end

  def search_users
    if params[:query].present?
      @users = User.where("username LIKE ?", "%#{params[:query]}%").limit(10)
    else
      @users = []
    end
  
    respond_to do |format|
      format.html 
      format.json { render json: @users.pluck(:username) } 
    end
  end
  
end
