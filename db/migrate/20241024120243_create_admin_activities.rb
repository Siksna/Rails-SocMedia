class CreateAdminActivities < ActiveRecord::Migration[7.2]
  def change
    create_table :admin_activities do |t|
      t.integer :admin_id
      t.string :action
      t.string :target

      t.timestamps
    end
  end
end
