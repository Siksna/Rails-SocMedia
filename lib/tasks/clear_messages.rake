namespace :messages do
    desc "Clear all messages from the database"
    task clear: :environment do
      Message.destroy_all
      puts "All messages have been cleared."
    end
  end