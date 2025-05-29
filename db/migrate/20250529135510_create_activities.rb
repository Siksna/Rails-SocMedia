class CreateActivities < ActiveRecord::Migration[7.2]
  def change
    create_table :activities do |t|
  t.references :user, null: false, foreign_key: true
  t.references :actionable, polymorphic: true, null: false
  t.datetime :created_at, null: false
    end
    add_index :activities, [:user_id, :created_at]
  end
end
