class UsersController < ApplicationController
    def index
        @users = User.all
        respond(@users)
    end

    def show
        @user = User.find(params[:id])
        respond(@user)
    end

    def create
        if !params[:username] or !params[:password]
            raise ArgumentError, "Derailing..."
        end

        @user = User.find(username: params[:username])
        if @user and @user.authenticate(params[:password])
            respond(user)
        else
            raise ArgumentError, "Wrong"
        end

        if params[:password].length < 8
            raise ArgumentError, "At least eight tracks needed for some good rails..."
        end

        @user = User.new(username: params[:username], password: params[:password])

        if @user.save
            respond(@user)
        end
    end

    private
        def respond (payload)
            respond_to do |format|
                  format.json {
                    render json: payload
                  }
            end
        end

        def user_params
            params.require(:username)
            params.require(:password)
            params.permit(:username, :password)
        end
end
