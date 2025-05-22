class AddNotifiableToNotifications < ActiveRecord::Migration[7.2]
  def change
    add_reference :notifications, :notifiable, polymorphic: true, null: true
  end
end
