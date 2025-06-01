class FixChatReadStatusForeignKeys < ActiveRecord::Migration[7.2]
  def change
    remove_foreign_key :chat_read_statuses, column: :conversation_id rescue nil

    remove_foreign_key :chat_read_statuses, column: :user_id rescue nil

    add_foreign_key :chat_read_statuses,
                    :conversations,
                    column: :conversation_id,
                    name: "fk_chat_read_statuses_conversations"

    add_foreign_key :chat_read_statuses,
                    :users,
                    column: :user_id,
                    name: "fk_chat_read_statuses_users"
  end
end
