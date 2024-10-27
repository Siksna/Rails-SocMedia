class UsersController < ApplicationController
    before_action :set_user, only: [:edit, :update, :show, :destroy]
  
    def edit
    end
  
    def update
        if @user.update(user_params)
          redirect_to admin_personas_path, notice: 'Lietotājs veiksmīgi atjaunināts.'
        else
          render :edit
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
  
