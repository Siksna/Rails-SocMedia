class User < ApplicationRecord
  has_one_attached :profile_picture
  
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :messages, dependent: :destroy
  has_many :replies, dependent: :destroy

  has_many :likes
  has_many :liked_messages, -> { order('likes.created_at DESC') }, through: :likes, source: :likeable, source_type: 'Message'
  has_many :liked_replies, -> { order('likes.created_at DESC') }, through: :likes, source: :likeable, source_type: 'Reply'

  has_many :notifications, dependent: :destroy

  validates :username, presence: true

  enum admin_type: { user: 0, admin: 1, head_admin: 2 }

  def admin?
    admin_type == "admin" || head_admin?
  end

  def head_admin?
    admin_type == "head_admin" && self.id == 6
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
  
  

  def randomize_attributes
    self.username = "Lietotājs #{SecureRandom.hex(4)}"
    save
  end
  private

  def create_friendship_if_mutual(other_user)
    if other_user.following?(self)
      Friendship.find_or_create_by(user: self, friend: other_user)
      Friendship.find_or_create_by(user: other_user, friend: self)
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
