class CreateReplies < ActiveRecord::Migration[7.2]
  def change
    create_table :replies do |t|
      t.text :content
      t.references :message, null: false, foreign_key: true

      t.timestamps
    end
  end
end