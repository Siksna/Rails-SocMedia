class CreateHiddenChats < ActiveRecord::Migration[7.2]
  def change
    create_table :hidden_chats do |t|
      t.references :user, null: false, foreign_key: true
      t.references :conversation, null: false, foreign_key: true

      t.timestamps
    end
  end
end
