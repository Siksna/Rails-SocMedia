class Reply < ApplicationRecord
  belongs_to :message
  has_one_attached :file
  has_many :likes, as: :likeable


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
      errors.add(:base, 'Nevar publicēt ja nav pievienots teksts vai fails')
    end
  end
end

