class AddChangeDescriptionToAdminActivities < ActiveRecord::Migration[7.2]
  def change
    add_column :admin_activities, :description, :text
  end
end
