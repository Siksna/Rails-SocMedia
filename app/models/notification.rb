class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :conversation, optional: true
  belongs_to :sender, class_name: "User", optional: true
end
