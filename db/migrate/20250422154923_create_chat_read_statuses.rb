class CreateChatReadStatuses < ActiveRecord::Migration[7.2]
  def change
    create_table :chat_read_statuses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :chat, null: false, foreign_key: true
      t.datetime :last_read_at

      t.timestamps
    end
  end
end
