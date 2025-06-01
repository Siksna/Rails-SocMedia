class AddConversationForeignKeyToChatReadStatuses < ActiveRecord::Migration[7.2]
  def change
    add_foreign_key :chat_read_statuses, :conversations, column: :chat_id
  end
end
