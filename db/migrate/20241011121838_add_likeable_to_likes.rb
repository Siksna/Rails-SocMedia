class AddLikeableToLikes < ActiveRecord::Migration[7.2]
  def change
    add_reference :likes, :likeable, polymorphic: true, null: false
  end
end
