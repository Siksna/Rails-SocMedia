class Message < ApplicationRecord
    has_many :replies, dependent: :destroy
    has_one_attached :file
    has_many :likes, as: :likeable
    validates :content, presence: true, length: { maximum: 255 }
    scope :visible, -> { joins(:user).where(users: { deleted_at: nil }) }
    belongs_to :user

    def liked_by?(user)
      likes.exists?(user: user)
    end

    def file_url
      if file.attached?
        Rails.application.routes.url_helpers.rails_blob_path(file, only_path: true)
      end
    end
    


  def comment_count
    replies.where(parent_id: nil).count + replies.joins(:children).count
  end
  end
  