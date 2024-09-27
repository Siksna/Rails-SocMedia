class Reply < ApplicationRecord
  belongs_to :message
  has_one_attached :file
  
  belongs_to :user


  attr_accessor :remove_file
  private

  def validate_presence_of_content_or_file
    if content.blank? && file.blank?
      errors.add(:base, 'Nevar publicēt ja nav pievienots teksts vai fails')
    end
  end
end