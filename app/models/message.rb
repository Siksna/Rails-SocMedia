class Message < ApplicationRecord
    has_many :replies, dependent: :destroy
    validates :content, presence: true
  end