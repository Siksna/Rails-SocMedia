class Reply < ApplicationRecord
  belongs_to :message
  has_one_attached :file
  has_many :likes, as: :likeable
  after_create :log_activity


  scope :visible, -> { joins(:user).where(users: { deleted_at: nil }) }
  belongs_to :user

  belongs_to :parent, class_name: 'Reply', optional: true
  has_many :children, class_name: 'Reply', foreign_key: 'parent_id', dependent: :destroy
  attr_accessor :remove_file
  private

  def liked_by?(user)
    likes.exists?(user: user)
  end

  def validate_presence_of_content_or_file
    if content.blank? && file.blank?
      errors.add(:base, 'Cant publish if there isnt a message or a file')
    end
  end

  def log_activity
  Activity.create!(user: self.user, actionable: self, created_at: self.created_at)
rescue => e
  Rails.logger.error "Failed to log activity: #{e.message}"
end
end

