class User < ApplicationRecord
  has_one_attached :profile_picture
  
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :messages, dependent: :destroy
  has_many :replies, dependent: :destroy

has_many :bookmarks, dependent: :destroy
has_many :bookmarked_messages, -> { where(bookmarks: { bookmarkable_type: 'Message' }) }, through: :bookmarks, source: :bookmarkable, source_type: 'Message'
has_many :bookmarked_replies, -> { where(bookmarks: { bookmarkable_type: 'Reply' }) }, through: :bookmarks, source: :bookmarkable, source_type: 'Reply'

has_many :activities, class_name: "Activity", dependent: :destroy

def bookmarked?(message)
  bookmarked_messages.exists?(message.id)
end

  has_many :likes
  has_many :liked_messages, -> { order('likes.created_at DESC') }, through: :likes, source: :likeable, source_type: 'Message'
  has_many :liked_replies, -> { order('likes.created_at DESC') }, through: :likes, source: :likeable, source_type: 'Reply'

  has_many :notifications, dependent: :destroy

  validates :username, presence: true, uniqueness: { case_sensitive: false }, length: { maximum: 30 }
validates :email, presence: true, uniqueness: { case_sensitive: false }, length: { maximum: 30 }, format: { with: URI::MailTo::EMAIL_REGEXP }

  enum :admin_type, [ :user, :admin, :head_admin ]


  def admin?
    admin_type == "admin" || head_admin?
  end

  def head_admin?
    admin_type == "head_admin"
  end

  def like(likeable)
    likes.create(likeable: likeable)
  end

  def unlike(likeable)
    likes.find_by(likeable: likeable).destroy
  end

  def liked?(likeable)
    likes.exists?(likeable: likeable)
  end

  has_many :active_relationships, class_name: 'Follow', foreign_key: 'follower_id', dependent: :destroy
  has_many :following, through: :active_relationships, source: :followed

  has_many :passive_relationships, class_name: 'Follow', foreign_key: 'followed_id', dependent: :destroy
  has_many :followers, through: :passive_relationships, source: :follower

  has_many :friendships
  has_many :friends, through: :friendships, source: :friend

  has_many :inverse_friendships, class_name: 'Friendship', foreign_key: 'friend_id'
  has_many :inverse_friends, through: :inverse_friendships, source: :user

  has_many :sent_conversations, class_name: 'Conversation', foreign_key: 'sender_id'
  has_many :received_conversations, class_name: 'Conversation', foreign_key: 'receiver_id'

  def find_or_create_conversation(other_user)
    Conversation.between(self, other_user).first_or_create(sender: self, receiver: other_user)
  end
  
  def follow(other_user)
    following << other_user unless following?(other_user)
    create_friendship_if_mutual(other_user)
  end

  

  def unfollow(other_user)
    following.delete(other_user)
    remove_friendship(other_user)
  end

  def following?(other_user)
    following.include?(other_user)
  end

  def friends_with?(other_user)
    friends.include?(other_user) || inverse_friends.include?(other_user)
  end
 def deleted?
    deleted_at.present?
  end
  
  def restore
    update(deleted_at: nil, username: original_username)
  end

  def soft_delete
    self.original_username = username
    update(deleted_at: Time.current)
  end
  
  

def suggested_with_reasons(limit: 8)
  connected_ids = [id] + following.pluck(:id) + (friends.pluck(:id) + inverse_friends.pluck(:id))
  connected_ids.uniq!

  friend_ids = (friends.pluck(:id) + inverse_friends.pluck(:id)).uniq
  fof_ids = Friendship.where(user_id: friend_ids).pluck(:friend_id)
  friends_following_ids = Follow.where(follower_id: friend_ids).pluck(:followed_id)
  popular_ids = User.joins(:passive_relationships)
                    .group('users.id')
                    .order('COUNT(follows.id) DESC')
                    .limit(limit * 2)
                    .pluck('users.id')

  fof_ids = (fof_ids - connected_ids).uniq
  friends_following_ids = (friends_following_ids - connected_ids).uniq
  popular_ids = (popular_ids - connected_ids).uniq



  suggestions = []
  excluded_ids = connected_ids.dup

  if fof_ids.any?
    User.unscoped.where(id: fof_ids).limit(limit).each do |u|
      suggestions << { user: u, reason: :you_might_know }
      excluded_ids << u.id
    end
  end

  if suggestions.size < limit && friends_following_ids.any?
    needed = limit - suggestions.size
    User.unscoped.where(id: friends_following_ids - excluded_ids).limit(needed).each do |u|
      suggestions << { user: u, reason: :you_might_know }
      excluded_ids << u.id
    end
  end

  if suggestions.size < limit && popular_ids.any?
    needed = limit - suggestions.size
    User.unscoped.where(id: popular_ids - excluded_ids).limit(needed).each do |u|
      suggestions << { user: u, reason: :popular }
      excluded_ids << u.id
    end
  end

  if suggestions.size < limit
    needed = limit - suggestions.size
    User.unscoped.where.not(id: excluded_ids).order(Arel.sql('RANDOM()')).limit(needed).each do |u|
      suggestions << { user: u, reason: :none }
    end
  end

  suggestions

end


  def randomize_attributes
    self.username = "User #{SecureRandom.hex(4)}"
    save
  end
  private

  def create_friendship_if_mutual(other_user)
    if other_user.following?(self)
      Friendship.find_or_create_by(user: self, friend: other_user)
      Friendship.find_or_create_by(user: other_user, friend: self)

      find_or_create_conversation(other_user)
    end
  end

  def remove_friendship(other_user)
    Friendship.where(user: self, friend: other_user).or(Friendship.where(user: other_user, friend: self)).destroy_all
  end

  scope :active, -> { where(deleted_at: nil) }

 

  before_create :set_profile_color

  def set_profile_color
    self.profile_color = generate_random_color unless self.profile_color.present?
  end

  def generate_random_color
    "#" + "%06x" % (rand * 0xffffff)
  end
end
