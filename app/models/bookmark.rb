class Bookmark < ApplicationRecord
  belongs_to :user
  belongs_to :bookmarkable, polymorphic: true
    validates :bookmarkable, presence: true
  validates :user_id, uniqueness: { scope: [:bookmarkable_type, :bookmarkable_id] }
end
