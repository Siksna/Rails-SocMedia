module ProfilesHelper
  def activity_link_path(activity)
    case activity.class.name
    when "Message"
      message_path(activity)
    when "Reply"
      message_path(activity.message)
    when "Comment"
      message_path(activity.commentable)
    else
      profile_path(activity.user)
    end
  rescue NoMethodError
    profile_path(activity.user)
  end
end