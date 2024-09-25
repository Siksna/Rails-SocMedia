namespace :users do
    desc "Clear all users from the database"
    task clear: :environment do
      User.destroy_all
      puts "All users have been cleared."
    end
  end