class ChangeUsernameConstraintsInUsers < ActiveRecord::Migration[7.0]
  def change
    User.where(username: nil).update_all(username: 'Noklusējuma lietotājs') 

    change_column :users, :username, :string, null: false
    add_index :users, :username, unique: true
  end
end
