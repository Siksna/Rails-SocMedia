class ChatMessage < ApplicationRecord
  belongs_to :chat
  belongs_to :user
  validates :content, presence: true

  scope :visible, -> { joins(:user).where(users: { deleted_at: nil }) }
end
