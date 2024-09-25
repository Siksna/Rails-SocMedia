class Message < ApplicationRecord
    has_many :replies, dependent: :destroy
    has_one_attached :file
    validates :content, presence: true
  
    belongs_to :user

    def file_url
      Rails.application.routes.url_helpers.url_for(file) if file.attached?
    end
  end