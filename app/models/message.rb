class Message < ApplicationRecord
    has_many :replies, dependent: :destroy
    has_one_attached :file
    has_many :likes, dependent: :destroy
    validates :content, presence: true
  
    belongs_to :user

    def liked_by?(user)
      likes.exists?(user: user)
    end

    def file_url
      Rails.application.routes.url_helpers.url_for(file) if file.attached?
    end
  end
  