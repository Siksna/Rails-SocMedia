class AddForeignKeysToChatReadStatuses < ActiveRecord::Migration[7.2]
  def change
    add_foreign_key :chat_read_statuses, :users,
                    column: :user_id,
                    name: "fk_chat_read_statuses_users"

    add_foreign_key :chat_read_statuses, :conversations,
                    column: :conversation_id,
                    name: "fk_chat_read_statuses_conversations"
  end
end
