class AddContentToChatConversations < ActiveRecord::Migration[7.2]
  def change
    add_column :chat_conversations, :content, :text
  end
end
