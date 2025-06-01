class HomeController < ApplicationController
  def index
    base_scope = Message.visible

    if params[:feed] == "following" && user_signed_in?
      base_scope = base_scope.from_followed_users(current_user)
    end

    @messages = apply_relevance_cte_ordering(base_scope, 10) 
                                                             
  end

 def load_more
    base_scope = Message.visible

    if params[:feed] == 'following' && user_signed_in?
      base_scope = base_scope.from_followed_users(current_user)
    end

    @messages = apply_relevance_cte_ordering(base_scope, 10, params[:after])
    if params[:after].present? && @messages.any?
      @messages.shift
    end
    @messages.each do |message|
    end
    render partial: "home/message", collection: @messages, formats: [:html]
  end



   def notifications
    @notifications = current_user.notifications.includes(:sender, :message, reply: [:message, file_attachment: :blob]).where.not(notification_type: 'chats').order(created_at: :desc, id: :desc).limit(10)
  end

  def load_more_notifications
  last_notification_id = params[:after]
  notifications_query = current_user.notifications
                                    .includes(:sender, :message, reply: [:message, file_attachment: :blob])
                                    .where.not(notification_type: 'chats')
                                    .order(id: :desc)

  if last_notification_id.present?
    notifications_query = notifications_query.where('id < ?', last_notification_id)
  end

  @notifications = notifications_query.limit(10)

  render partial: 'home/notification', collection: @notifications, as: :notification, layout: false
end



  def search_users
    if params[:query].present?
      query = params[:query].downcase
      @users_start_with = User.where("LOWER(username) LIKE ?", "#{query}%").limit(10)
      @users_rest = User.where("LOWER(username) LIKE ?", "%#{query}%").where.not("LOWER(username) LIKE ?", "#{query}%").limit(10)
      
      @users = @users_start_with + @users_rest
    else
      @users = []
    end
    
    respond_to do |format|
      format.html 
      format.json { render json: @users.pluck(:username) } 
    end
  end


    private

  def relevance_score_sql_expression
    weights = ApplicationController::RELEVANCE_WEIGHTS
    <<-SQL
      (
        (COUNT(DISTINCT likes.id) * #{weights[:likes]}) +
        (COUNT(DISTINCT replies.id) * #{weights[:replies]}) -
        (CAST(STRFTIME('%s', 'now') - STRFTIME('%s', messages.updated_at) AS REAL) / 3600.0 * #{weights[:decay_updated_at]}) -
        (CAST(STRFTIME('%s', 'now') - STRFTIME('%s', messages.created_at) AS REAL) / 3600.0 * #{weights[:decay_created_at]})
      )
    SQL
  end

  def apply_relevance_cte_ordering(scope, limit_count, after_param = nil)
    cte_name = 'scored_messages_cte'

   
    cte_base_query = scope.select("messages.*, (#{relevance_score_sql_expression}) AS relevance_score").left_joins(:likes, :replies).group('messages.id').order(Arel.sql("relevance_score DESC, messages.id DESC"))

    outer_select_sql = "SELECT * FROM #{cte_name}"
    where_clause = ""

   
  if after_param.present?
    last_score_str, last_id_str = after_param.split(',')

    last_score_as_int = last_score_str.to_i
    last_score = last_score_as_int.to_f / 1_000_000.0

    last_id = last_id_str.to_i

    where_clause = " WHERE relevance_score < #{last_score} OR (relevance_score = #{last_score} AND id < #{last_id})"
  end

    full_sql_with_cte = "WITH #{cte_name} AS (#{cte_base_query.to_sql}) #{outer_select_sql}#{where_clause} LIMIT #{limit_count}"

    
    raw_results = ActiveRecord::Base.connection.execute(full_sql_with_cte)

    return [] if raw_results.empty?

    ordered_ids_with_scores = raw_results.map do |row|
      { id: row['id'], relevance_score: row['relevance_score'] }
    end

    messages_by_id = Message.where(id: ordered_ids_with_scores.map { |r| r[:id] }).includes(:user).index_by(&:id)

    final_messages = ordered_ids_with_scores.map do |item|
      message = messages_by_id[item[:id]]
      if message
        message.relevance_score = item[:relevance_score]
      end
      message
    end.compact

    final_messages
  end
end

