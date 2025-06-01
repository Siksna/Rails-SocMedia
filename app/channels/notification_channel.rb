class NotificationChannel < ApplicationCable::Channel
 def subscribed
  if current_user.nil?
    Rails.logger.error "NotificationChannel: current_user is nil"
    reject
  else
    Rails.logger.info "NotificationChannel: Subscribed as #{current_user.id}"
    stream_for current_user
  end
end


  def unsubscribed
  logger.debug "[NotificationChannel] Unsubscribed"
  end
end
