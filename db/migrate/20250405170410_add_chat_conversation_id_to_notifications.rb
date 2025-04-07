class AddChatConversationIdToNotifications < ActiveRecord::Migration[7.2]
  def change
    add_column :notifications, :chat_conversation_id, :integer
  end
end
