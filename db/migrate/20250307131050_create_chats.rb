class CreateChats < ActiveRecord::Migration[7.2]
  def change
    create_table :chats do |t|
      t.bigint :user1_id, null: false
      t.bigint :user2_id, null: false

      t.timestamps
    end

    add_foreign_key :chats, :users, column: :user1_id
    add_foreign_key :chats, :users, column: :user2_id
  end
end
