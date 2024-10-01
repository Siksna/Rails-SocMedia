class Reply < ApplicationRecord
  belongs_to :message
  has_one_attached :file
  
  belongs_to :user

  belongs_to :parent, class_name: 'Reply', optional: true
  has_many :children, class_name: 'Reply', foreign_key: 'parent_id', dependent: :destroy
  attr_accessor :remove_file
  private

  def validate_presence_of_content_or_file
    if content.blank? && file.blank?
      errors.add(:base, 'Nevar publicēt ja nav pievienots teksts vai fails')
    end
  end
end