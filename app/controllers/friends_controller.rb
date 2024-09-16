class FriendsController < ApplicationController
  before_action :set_friend_params, only: %i[show edit update destroy]
  before_action :authenticate_user!, except: [:index, :show]
  before_action :correct_user, only: [:edit, :update, :destroy]


  def personas
    @friends = Friend.all
  end

  def index
    if user_signed_in?
    @friends = Friend.all
    else
      flash[:errors] = 'Jūs nēsat piereģistrēts'
     redirect_to friends_path
    end

  end

  def new
    #@friend = Friend.new
    @friend= current_user.friends.build
  end

  def create
   # @friend = Friend.create(friend_params)

   @friend = current_user.friends.build(friend_params)
  
   if @friend.save 
     flash[:notice] = 'Draugs veiksmīgi izveidots'
     redirect_to friends_path
   else
     flash[:errors] = @friend.errors.full_messages
     render :new
   end
  end

  def show
   end

  def edit
   end

  def update
    if @friend.update(friend_params)
      flash[:errors] = 'Draugs veiksmīgi atjaunināts'
      redirect_to friends_path(@friend)
    else
      flash[:errors] = @friend.errors.full_messages
      redirect_to edit_friend_path
    end
  end

  def destroy
    if @friend.delete
      flash[:errors] = 'Draugs vieksmīgi dzēsts'
      redirect_to friends_path(@friend)
    else
      flash[:errors] = @friend.errors.full_messages
      redirect_to destroy_friend_path
    end
  end


def correct_user
@friend = current_user.friends.find_by(id:params[:id])
 if @friend.nil?
 flash[:errors] = 'Nēsat autorizēts rediģēt šo personu'
 redirect_to friends_path
 end
end

  private

  def set_friend_params
    @friend = Friend.find(params[:id])
  end

  def friend_params
    params.require(:friend).permit(:vards, :uzvards, :epasts, :talrunis, :twitters, :user_id )
  end
end