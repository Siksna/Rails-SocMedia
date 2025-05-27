class UsersController < ApplicationController
    before_action :set_user, only: [:edit, :update, :show, :destroy]
  
    def edit
    end
  
   def update
  if params[:user][:profile_picture].present? && params[:user][:profile_picture].start_with?("data:image")
    base64_image = params[:user][:profile_picture].split(',')[1]
    decoded_image = Base64.decode64(base64_image)
    filename = "cropped_profile_#{Time.now.to_i}.png"

    file = Tempfile.new([filename, '.png'])
    file.binmode
    file.write(decoded_image)
    file.rewind

    current_user.profile_picture.attach(
      io: file,
      filename: filename,
      content_type: 'image/png'
    )

    file.close
  end

  params[:user].delete(:profile_picture)

  if current_user.update(user_params)
    redirect_to edit_user_registration_path, notice: "Profile updated successfully."
  else
    flash.now[:alert] = "There was a problem updating your profile."
    render :edit, status: :unprocessable_entity
  end
end

      
      
  
    def show
    end
  
    def destroy
    end
  
    private
  
    def set_user
      @user = User.find(params[:id])
    end
  
    def user_params
      params.require(:user).permit(:username, :email) 
    end
  end
  
