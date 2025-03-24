class NotificationChannel < ApplicationCable::Channel
  def subscribed
    if current_user
      puts "Subscribed to NotificationChannel as #{current_user.id}"
      stream_for current_user
    else
      puts "Subscription rejected: No current_user"
      reject
    end
  end

  def unsubscribed
    puts "Unsubscribed from NotificationChannel"
  end
end
