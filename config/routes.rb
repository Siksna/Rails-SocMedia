Rails.application.routes.draw do

  resources :friends do
    collection do
      get :personas
    end
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
  resources :friends
  get 'search_users', to: 'home#search_users' 
  get "friends/index"
  get "friends/new"
  get "friends/create"
  get "friends/show"
  get "friends/edit"
  get "friends/update"
  get "friends/destroy"
  root "home#index"
  get 'home/about'
  get 'friends/personas'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"

 
end
