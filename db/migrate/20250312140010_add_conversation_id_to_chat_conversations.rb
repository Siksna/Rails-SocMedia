class AddConversationIdToChatConversations < ActiveRecord::Migration[7.2]
  def change
    add_column :chat_conversations, :conversation_id, :integer
  end
end
