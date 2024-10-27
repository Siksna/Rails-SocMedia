class AddOriginalUsernameToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :original_username, :string
  end
end
