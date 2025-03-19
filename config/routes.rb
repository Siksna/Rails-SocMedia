Rails.application.routes.draw do



  resources :admin do
    resources :users, only: [ :edit, :update, :show, :destroy]
      collection do
        get :personas
        get :history
      end
      member do
        patch :promote_to_admin
        patch :demote_admin
          patch :restore
          patch :update
      end
  end


  resources :chats, only: [:index, :show] do
    resources :chat_conversations, only: [:create]
  end
  
  


  resources :messages do
    resources :replies, only: [:create, :edit, :update, :destroy] do
      post 'toggle_like', on: :member, controller: 'replies'
    end
    post 'toggle_like', on: :member
  end
  
  resources :profiles, only: [:show] do
    member do
      post 'follow', to: 'relationships#create', as: 'follow'
      delete 'unfollow', to: 'relationships#destroy', as: 'unfollow'
    end
  
    get 'followers', on: :member
    get 'following', on: :member
  end

  devise_for :users
  
  get 'search_users', to: 'home#search_users'
  
  get "admin/edit"
  get "admin/update"
  get "admin/destroy"
  get 'admin/history'



  root "home#index"
  get 'home/about'
  get 'admin/personas'

  get "up" => "rails/health#show", as: :rails_health_check
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest



  mount ActionCable.server => '/cable'

end
