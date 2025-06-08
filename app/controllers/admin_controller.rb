class AdminController < ApplicationController
  before_action :set_user, only: %i[show edit update destroy]
  before_action :authenticate_user!, except: [:index, :show]
  before_action :correct_user, only: [:edit, :update, :destroy]

  def personas
    @users = User.all

    if params[:username_search].present?
      @users = @users.where("username LIKE ?", "%#{params[:username_search]}%")
    end
    if params[:email_search].present?
      @users = @users.where("email LIKE ?", "%#{params[:email_search]}%")
    end

    case params[:role_filter]
    when 'admin'
      @users = @users.where(admin_type: ['admin', 'head_admin'])   
    when 'user'
      @users = @users.where(admin_type: 'user')   
    end

    @users = @users.order(created_at: :asc, id: :asc).limit(15)
    render 'admin/personas'
  end

  

  def load_more_personas
  @users = User.all

  if params[:username_search].present?
    @users = @users.where("username LIKE ?", "%#{params[:username_search]}%")
  end

  if params[:email_search].present?
    @users = @users.where("email LIKE ?", "%#{params[:email_search]}%")
  end

  case params[:role_filter]
  when 'admin'
    @users = @users.where(admin_type: ['admin', 'head_admin'])
  when 'user'
    @users = @users.where(admin_type: 'user')
  end

  if params[:after].present?
    after_id = params[:after]
    @users = @users.where("id > ?", after_id)
  end

  @users = @users.order(created_at: :asc, id: :asc).limit(15) 

  render partial: 'admin/personas_data', locals: { users: @users }
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
    begin
       @user.profile_picture.purge if params[:user][:remove_profile_picture] == "1"
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
        redirect_to admin_personas_path, notice: 'User account successfully updated.'
      else
        flash[:errors] = @user.errors.full_messages
        render :edit
      end
    rescue ActiveRecord::RecordNotUnique
      flash[:errors] = ['Username or email is already taken.']
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
    @admins          = User.where(admin_type: ['admin', 'head_admin'])
    @unique_actions  = AdminActivity.distinct.pluck(:action)
    @unique_targets  = AdminActivity.distinct.pluck(:target)

    @admin_activities = AdminActivity.includes(:admin)
                                     .order(created_at: :desc)
                                     .limit(20)

    @admin_activities = @admin_activities.where(admin_id: params[:admin]) if params[:admin].present?
    @admin_activities = @admin_activities.where(action: params[:activity_action]) if params[:activity_action].present?

    @admin_activities = @admin_activities.where(target: params[:target]) if params[:target].present?

    if params[:start_date].present? && params[:end_date].present?
      start_date = Date.parse(params[:start_date]).beginning_of_day
      end_date   = Date.parse(params[:end_date]).end_of_day
      @admin_activities = @admin_activities.where(created_at: start_date..end_date)
    elsif params[:start_date].present?
      start_date = Date.parse(params[:start_date]).beginning_of_day
      @admin_activities = @admin_activities.where("created_at >= ?", start_date)
    elsif params[:end_date].present?
      end_date   = Date.parse(params[:end_date]).end_of_day
      @admin_activities = @admin_activities.where("created_at <= ?", end_date)
    end

    render 'admin/history'
  end

  def load_more_history
    after_id         = params[:after]
    @admins          = User.where(admin_type: ['admin', 'head_admin'])
    @unique_actions  = AdminActivity.distinct.pluck(:action)
    @unique_targets  = AdminActivity.distinct.pluck(:target)

    activities = AdminActivity.includes(:admin)

    activities = activities.where(admin_id: params[:admin])            if params[:admin].present?
    activities = activities.where(action: params[:activity_action])    if params[:activity_action].present?
    activities = activities.where(target: params[:target])             if params[:target].present?

    if params[:start_date].present? && params[:end_date].present?
      start_date = Date.parse(params[:start_date]).beginning_of_day
      end_date   = Date.parse(params[:end_date]).end_of_day
      activities = activities.where(created_at: start_date..end_date)
    elsif params[:start_date].present?
      start_date = Date.parse(params[:start_date]).beginning_of_day
      activities = activities.where("created_at >= ?", start_date)
    elsif params[:end_date].present?
      end_date   = Date.parse(params[:end_date]).end_of_day
      activities = activities.where("created_at <= ?", end_date)
    end

    activities = activities.order(created_at: :desc, id: :desc)

    if after_id.present?
      last = AdminActivity.find(after_id)
      activities = activities.where(
        "(created_at < ?) OR (created_at = ? AND id < ?)",
        last.created_at, last.created_at, last.id
      )
    end

    @admin_activities = activities.limit(20)

    if @admin_activities.empty?
      head :no_content
    else
      render partial: "admin/history_data", layout: false
    end
  end







  private

  def set_user
    return if action_name == "show" || action_name == "history"  
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:username, :email, :remove_profile_picture)
  end

  def correct_user
    if current_user.head_admin?
    elsif current_user.admin?
      if @user.admin? || @user.head_admin?
        flash[:errors] = 'You are not authorized to edit other admins'
        redirect_to admin_personas_path
      end
    else
      flash[:errors] = 'You are not authorized to edit this user'
      redirect_to admin_index_path
    end
  end
end
