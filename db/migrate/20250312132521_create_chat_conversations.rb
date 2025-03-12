class CreateChatConversations < ActiveRecord::Migration[7.2]
    def change
      create_table :chat_conversations do |t|
        t.references :sender, null: false, foreign_key: { to_table: :users }
        t.references :receiver, null: false, foreign_key: { to_table: :users }
        t.timestamps
      end
    end  
end
