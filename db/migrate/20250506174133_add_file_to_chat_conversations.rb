class AddFileToChatConversations < ActiveRecord::Migration[7.2]
  def change
    add_reference :chat_conversations, :file, foreign_key: { to_table: :active_storage_attachments }
  end
end
