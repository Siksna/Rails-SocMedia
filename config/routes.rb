Rails.application.routes.draw do

get 'admin/history/load_more_history', to: 'admin#load_more_history', as: 'load_more_history'
get 'admin/personas/load_more_personas', to: 'admin#load_more_personas', as: 'load_more_personas'

 get 'home/load_more', to: 'home#load_more', as: 'load_more_home'
  get 'admin/load_more_history', to: 'admin#load_more_history'
  get 'chats/load_more_conversations', to: 'chats#load_more_conversations'

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
    resources :chat_conversations, only: [:create, :destroy]
    post 'hide', on: :member
    post 'update_last_read_at', on: :member
    member do
      get :load_more
    end
  end
  
  


  resources :messages do
    resources :replies, only: [:create, :edit, :update, :destroy] do
      post 'toggle_like', on: :member, controller: 'replies'
      collection do
      get 'load_more'
    end
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

  devise_for :users, controllers: { sessions: "sessions" }

  resources :notifications, only: [:destroy]  do
    collection do
      get :unread
    end
    collection do
      post "mark_as_read_notification/:id", to: "notifications#mark_as_read_notification", as: :mark_notification_as_read
      post "mark_as_read/:conversation_id", to: "notifications#mark_as_read", as: :mark_chat_as_read
    end    
  end
  


  get 'search_users', to: 'home#search_users'
  
  get "admin/edit"
  get "admin/update"
  get "admin/destroy"
  get 'admin/history'



  root "home#index"
  get 'home/about'
  get 'admin/personas'
  get 'home/notifications', to: 'home#notifications'


  get "up" => "rails/health#show", as: :rails_health_check
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest



  mount ActionCable.server => '/cable'

end
