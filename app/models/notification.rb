class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :conversation, optional: true
  belongs_to :sender, class_name: "User", optional: true
  belongs_to :message, optional: true
  belongs_to :reply, optional: true
  belongs_to :notifiable, polymorphic: true, optional: true

  def url
  Rails.logger.debug("Notification##{id} type: #{notification_type}, notifiable_type: #{notifiable_type}, notifiable_id: #{notifiable_id}")
  
  case notification_type
  when 'reply', 'like'
    if notifiable_type == 'Message'
      Rails.application.routes.url_helpers.message_path(notifiable_id)
    elsif notifiable_type == 'Reply'
       if notifiable.present? && (message = notifiable.message).present?
        Rails.application.routes.url_helpers.message_path(message.id, anchor: "reply-#{notifiable_id}")
      else
        '#'
      end
    else
      '#'
    end

  when 'follow'
    if sender
      Rails.application.routes.url_helpers.profile_path(sender)
    else
      '#'
    end

  when 'chats'
    if defined?(Rails.application.routes.url_helpers.conversation_path)
      Rails.application.routes.url_helpers.conversation_path(conversation_id)
    else
      '#'
    end
  else
    '#'
  end
end


end

