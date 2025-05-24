class RenameMessageToBodyInNotifications < ActiveRecord::Migration[7.2]
   def change
    rename_column :notifications, :message, :message_text
  end
end
