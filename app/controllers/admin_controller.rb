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

  #PROBLEMA STARP EDIT UN UPDATE PRIEKS VESTURES
  def edit
    @user = User.find(params[:id])
  end

  def update
  
    if @user.update(user_params)
      AdminActivity.create(
        admin: current_user,
        action: "Updated user",
        target: @user.username
      )
      redirect_to admin_personas_path, notice: 'Lietotāja konts veiksmīgi atjaunots.'
    else
      flash[:errors] = @user.errors.full_messages
      render :edit
    end
  end
  
  

  def destroy
    user = User.find(params[:id])
    user.soft_delete
    user.randomize_attributes
  
    AdminActivity.create(
      admin: current_user,
      action: "Deleted user account",
      target: user.username
    )
    redirect_to admin_personas_path, notice: 'Lietotajs veiksmīgi dzēsts.'
  end
  
  def restore
    user = User.find(params[:id])
    user.restore
  
    AdminActivity.create(
      admin: current_user,
      action: "Restored user account",
      target: user.username
    )
  
    redirect_to admin_personas_path, notice: 'Lietotajs veiksmīgi atjaunināts.'
  end
  

  def promote_to_admin
    user = User.find(params[:id])
    if current_user.head_admin?
      user.update(admin_type: :admin)
      
      AdminActivity.create(
        admin: current_user,
        action: "Promoted user to admin",
        target: user.username
      )
  
      flash[:success] = "#{user.username} is now an admin."
    else
      flash[:errors] = 'Not authorized to perform this action'
    end
    redirect_to admin_personas_path
  end
  

  def demote_admin
    user = User.find(params[:id])
    if current_user.head_admin? && user.admin?
      user.update(admin_type: :user)
  
      AdminActivity.create(
        admin: current_user,
        action: "Demoted admin to user",
        target: user.username
      )
  
      flash[:success] = "#{user.username} is now a regular user."
    else
      flash[:errors] = 'Not authorized to perform this action'
    end
    redirect_to admin_personas_path
  end
  

  def history
    @admin_activities = AdminActivity.includes(:admin).order(created_at: :desc)
    render 'admin/history'
  end

  private

  def set_user
    return if action_name == "show" || action_name == "history"  
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
