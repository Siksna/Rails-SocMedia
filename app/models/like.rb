class Like < ApplicationRecord
    belongs_to :user
    belongs_to :message, optional: true
    belongs_to :reply, optional: true
    belongs_to :likeable, polymorphic: true
  end
  