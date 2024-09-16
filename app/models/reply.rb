class Reply < ApplicationRecord
  belongs_to :message
  validates :content, presence: true
end