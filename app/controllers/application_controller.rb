class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :restrict_deleted_user_access

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :password_confirmation, :username])
    devise_parameter_sanitizer.permit(:account_update, keys: [:email, :password, :password_confirmation, :current_password, :username, :profile_picture])
  end

  private
  def restrict_deleted_user_access
    return unless user_signed_in? && current_user.deleted?

    if request.path != root_path && request.path != destroy_user_session_path
      redirect_to root_path
      flash[:alert] = "Jūsu konts tika bloķēts. Lūdzu ziņot mums."
    
    end
  end

end
