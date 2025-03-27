class AddFieldsToNotifications < ActiveRecord::Migration[7.2]
  def change
    add_reference :notifications, :sender, foreign_key: { to_table: :users }, null: true
    add_column :notifications, :notification_type, :string
  end
end
