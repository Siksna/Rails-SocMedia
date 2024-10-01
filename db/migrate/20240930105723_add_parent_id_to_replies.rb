class AddParentIdToReplies < ActiveRecord::Migration[7.2]
  def change
    add_column :replies, :parent_id, :integer
  end
end
