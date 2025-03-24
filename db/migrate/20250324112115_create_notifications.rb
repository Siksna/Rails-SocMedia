class CreateNotifications < ActiveRecord::Migration[7.2]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :message
      t.references :conversation, null: false, foreign_key: true
      t.boolean :read

      t.timestamps
    end
  end
end
