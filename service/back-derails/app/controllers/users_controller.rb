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
end
