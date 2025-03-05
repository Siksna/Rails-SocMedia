class AdminController < ApplicationController
  before_action :set_user, only: %i[show edit update destroy]
  before_action :authenticate_user!, except: [:index, :show]
  before_action :correct_user, only: [:edit, :update, :destroy]

  def personas
    @users = User.all

    # Filter by username
    if params[:username_search].present?
      @users = @users.where("username LIKE ?", "%#{params[:username_search]}%")
    end

    # Filter by email
    if params[:email_search].present?
      @users = @users.where("email LIKE ?", "%#{params[:email_search]}%")
    end

    # Filter by role
    case params[:role_filter]
    when 'admin'
      @users = @users.where(admin_type: ['admin', 'head_admin'])   # Replace with the correct column name
    when 'user'
      @users = @users.where(admin_type: 'user')   # Replace with the correct column name
    when 'default', nil
      # No filter for default, so we just return all users
    end
    

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
    @user = User.find(params[:id]) 
  end

  def edit
    @user = User.find(params[:id])
  end
  
  
  def update
    @user = User.find(params[:id])
    previous_username = @user.username 
    previous_email = @user.email  
  
    if request.patch?
      if @user.update(user_params)
        if @user.saved_changes.any?
          changes = @user.saved_changes.except("updated_at").map do |attribute, values|
            "#{attribute}: from #{values[0]} to #{values[1]}"
          end.join(", ")
  
          unless changes.empty?
            AdminActivity.create(
              admin: current_user,
              action: "Updated user",
              description: "#{changes}:",
              target: @user.username
            )
          end
        end
        redirect_to admin_personas_path, notice: 'Lietotāja konts veiksmīgi atjaunots.'
      else
        flash[:errors] = @user.errors.full_messages
        render :edit
      end
    else
      redirect_to edit_admin_path(@user)
    end
  end
  
  
  
  
  

  def destroy
    user = User.find(params[:id])
    previous_username = user.username
  
    user.soft_delete
    user.randomize_attributes
  
    AdminActivity.create(
      admin: current_user,
      action: "Deleted user account",
      description: "Current username: #{user.username}, previous username: #{previous_username}",
      target: user.username
    )
  
    redirect_to admin_personas_path, notice: 'Lietotajs veiksmīgi dzēsts.'
  end
  
  
  def restore
    user = User.find(params[:id])
    previous_username = user.username
  
    user.restore
  
    AdminActivity.create(
      admin: current_user,
      action: "Restored user account",
      description: "Restored username: #{user.username}, previous randomized username: #{previous_username}",
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
        action: "Promoted",
        description: "user to admin",
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
        action: "Demoted",
        description: "admin to user",
        target: user.username
      )
  
      flash[:success] = "#{user.username} is now a regular user."
    else
      flash[:errors] = 'Not authorized to perform this action'
    end
    redirect_to admin_personas_path
  end
  
 def history
  @admins = User.where(admin_type: ['admin', 'head_admin'])
  @unique_actions = AdminActivity.distinct.pluck(:action)
  @admin_activities = AdminActivity.includes(:admin).order(created_at: :desc)

  @admin_activities = @admin_activities.where(admin_id: params[:admin]) if params[:admin].present?
  @admin_activities = @admin_activities.where(action: params[:activity_action]) if params[:activity_action].present?

  if params[:start_date].present? && params[:end_date].present?
    start_date = Date.parse(params[:start_date]).beginning_of_day
    end_date = Date.parse(params[:end_date]).end_of_day
    @admin_activities = @admin_activities.where(created_at: start_date..end_date)
  elsif params[:start_date].present?
    start_date = Date.parse(params[:start_date]).beginning_of_day
    @admin_activities = @admin_activities.where("created_at >= ?", start_date)
  elsif params[:end_date].present?
    end_date = Date.parse(params[:end_date]).end_of_day
    @admin_activities = @admin_activities.where("created_at <= ?", end_date)
  end

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
