class MakeBookmarksPolymorphic < ActiveRecord::Migration[7.2]
  def change
  remove_reference :bookmarks, :message, foreign_key: true
  add_reference :bookmarks, :bookmarkable, polymorphic: true, index: true
end
end
