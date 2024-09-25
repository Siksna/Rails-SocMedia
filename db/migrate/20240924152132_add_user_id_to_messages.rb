class AddUserIdToMessages < ActiveRecord::Migration[7.2]
  def change
    add_column :messages, :user_id, :integer
  end
end
