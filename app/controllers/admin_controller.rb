class AdminController < ApplicationController
  before_action :set_user, only: %i[show edit update destroy]
  before_action :authenticate_user!, except: [:index, :show]
  before_action :correct_user, only: [:edit, :update, :destroy]

  def personas
    @users = User.all
     render 'admin/personas'
  end

  def index
    if user_signed_in?
      @users = User.all
    else
      flash[:errors] = 'Jūs nēsat piereģistrēts'
      redirect_to root_path
    end
  end

  def show
  end

  def edit
  end

  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      redirect_to admin_personas_path, notice: 'Lietotājs veiksmīgi atjaunināts.'
    else
      flash[:errors] = @user.errors.full_messages
      render :edit
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.soft_delete          
    @user.randomize_attributes  
    redirect_to admin_personas_path, notice: 'Lietotājs veiksmīgi izslēgts.'
  end
  

  def restore
    @user = User.find(params[:id])
    @user.restore
    redirect_to admin_personas_path, notice: 'Lietotājs veiksmīgi atlsēgts.'
  end
  


  def promote_to_admin
    user = User.find(params[:id])
    if current_user.head_admin?
      user.update(admin_type: :admin)
      flash[:success] = "#{user.username} ir tagad admins."
    else
      flash[:errors] = 'Nēsat autorizēts veikt šo darbību'
    end
    redirect_to admin_personas_path
  end
  
  def demote_admin
    user = User.find(params[:id])
    if current_user.head_admin? && user.admin?
      user.update(admin_type: :user)
      flash[:success] = "#{user.username} ir parasts lietotājs."
    else
      flash[:errors] = 'Nēsat autorizēts veikt šo darbību'
    end
    redirect_to admin_personas_path
  end


  def history
    @admin_activities = AdminActivity.includes(:admin).order(created_at: :desc)
    render 'admin/history'
  end
  


  private

  def set_user
     return if action_name == 'history'
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:username, :email)
  end

  def correct_user
    if current_user.head_admin?
    
    elsif current_user.admin?
      
      if @user.admin? || @user.head_admin?
        flash[:errors] = 'Nēsat autorizēts rediģēt citus administratorus'
        redirect_to admin_personas_path
      end
    else
      
      flash[:errors] = 'Jūs nēsat autorizēts rediģēt šo lietotāju'
      redirect_to admin_index_path
    end
  end
  
end
