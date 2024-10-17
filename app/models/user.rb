class User < ApplicationRecord
  has_one_attached :profile_picture
  
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :friends
  has_many :messages, dependent: :destroy
  has_many :replies, dependent: :destroy

  before_create :set_profile_color

  has_many :likes

  has_many :liked_messages, -> { order('likes.created_at DESC') }, through: :likes, source: :likeable, source_type: 'Message'

  has_many :liked_replies, -> { order('likes.created_at DESC') }, through: :likes, source: :likeable, source_type: 'Reply'

  validates :username, presence: true

 

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

  
  def following?(other_user)
    following.include?(other_user)
  end


  private

  def set_profile_color
    self.profile_color = generate_random_color unless self.profile_color.present?
  end

  def generate_random_color
    "#" + "%06x" % (rand * 0xffffff)
  end
end
