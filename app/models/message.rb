class Message < ApplicationRecord
    attr_accessor :relevance_score

      after_create :log_activity

    has_many :replies, dependent: :destroy
    has_one_attached :file
    has_many :likes, as: :likeable
    has_many :bookmarks, as: :bookmarkable, dependent: :destroy
    has_many :bookmarked_by, through: :bookmarks, source: :user
    validates :content, presence: true, length: { maximum: 800 }, unless: -> { file.attached? }

    scope :visible, -> { joins(:user).where(users: { deleted_at: nil }) }
    scope :from_followed_users, ->(user) { where(user_id: user.following.select(:id)) }

    belongs_to :user

    def liked_by?(user)
      likes.exists?(user: user)
    end

    def file_url
      if file.attached?
        Rails.application.routes.url_helpers.rails_blob_path(file, only_path: true)
      end
    end
    
def log_activity
  Activity.create!(user: self.user, actionable: self, created_at: self.created_at)
rescue => e
  Rails.logger.error "Failed to log activity: #{e.message}"
end

  def comment_count
    replies.where(parent_id: nil).count + replies.joins(:children).count
  end
  end
  