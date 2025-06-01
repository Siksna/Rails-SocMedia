class RenameChatIdToConversationIdInChatReadStatuses < ActiveRecord::Migration[7.2]
  def change
     rename_column :chat_read_statuses, :chat_id, :conversation_id
    add_foreign_key :chat_read_statuses, :conversations 
  end
end
