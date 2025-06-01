module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      if (user = env['warden'].user)
        Rails.logger.info "✅ WebSocket authenticated as User #{user.id}"
        user
      else
        Rails.logger.warn "❌ WebSocket rejected: no Devise session"
        reject_unauthorized_connection
      end
    end
  end
end
