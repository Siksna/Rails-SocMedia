class RebuildChatReadStatuses < ActiveRecord::Migration[7.2]
  def up
    # 1) Create a new temp table WITHOUT any indexes
    create_table :chat_read_statuses_new do |t|
      t.integer  :user_id,         null: false
      t.integer  :conversation_id, null: false
      t.datetime :last_read_at
      t.datetime :created_at,      null: false
      t.datetime :updated_at,      null: false

      # Note: no t.index lines here, so no collisions on index names.
    end

    # 2) Copy all existing rows from the old table into this new one
    execute <<-SQL.squish
      INSERT INTO chat_read_statuses_new (user_id, conversation_id, last_read_at, created_at, updated_at)
      SELECT user_id, conversation_id, last_read_at, created_at, updated_at
      FROM chat_read_statuses;
    SQL

    # 3) Drop the old table (which still has the wrong "→ chats" FK)
    drop_table :chat_read_statuses

    # 4) Rename the new table to the original name
    rename_table :chat_read_statuses_new, :chat_read_statuses

    # 5) Now that the table is back to "chat_read_statuses", add the two correct indexes:
    add_index :chat_read_statuses, :user_id,         name: "index_chat_read_statuses_on_user_id"
    add_index :chat_read_statuses, :conversation_id, name: "index_chat_read_statuses_on_conversation_id"

    # 6) Finally, add the two foreign‐key constraints:
    add_foreign_key :chat_read_statuses,
                    :users,
                    column: :user_id,
                    name:   "fk_chat_read_statuses_users"

    add_foreign_key :chat_read_statuses,
                    :conversations,
                    column: :conversation_id,
                    name:   "fk_chat_read_statuses_conversations"
  end

  def down
    # In a rollback, drop and recreate the old schema (if needed):
    drop_table :chat_read_statuses

    create_table :chat_read_statuses do |t|
      t.integer  :user_id,         null: false
      t.integer  :conversation_id, null: false
      t.datetime :last_read_at
      t.datetime :created_at,      null: false
      t.datetime :updated_at,      null: false
      t.index ["conversation_id"], name: "index_chat_read_statuses_on_conversation_id"
      t.index ["user_id"],         name: "index_chat_read_statuses_on_user_id"
    end

    add_foreign_key :chat_read_statuses,
                    :users,
                    column: :user_id

    add_foreign_key :chat_read_statuses,
                    :conversations,
                    column: :conversation_id
  end
end
