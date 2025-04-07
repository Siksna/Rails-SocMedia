class ChangeConversationIdToBeNullableInNotifications < ActiveRecord::Migration[7.2]
  def change
    change_column_null :notifications, :conversation_id, true
  end
end
