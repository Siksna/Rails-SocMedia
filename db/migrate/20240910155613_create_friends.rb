class CreateFriends < ActiveRecord::Migration[7.2]
  def change
    create_table :friends do |t|
      t.string :vards
      t.string :uzvards
      t.string :epasts
      t.string :talrunis
      t.string :twitters

      t.timestamps
    end
  end
end
