class AddAdminTypeToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :admin_type, :integer, default: 0
  end
end
