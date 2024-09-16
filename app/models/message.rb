class Message < ApplicationRecord
    has_many :replies, dependent: :destroy
    has_one_attached :file
    validates :content, presence: true
  
  end