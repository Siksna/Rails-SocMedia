class User < ApplicationRecord
  has_one_attached :profile_picture
  
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :friends

  has_many :messages, dependent: :destroy

  has_many :replies, dependent: :destroy

  before_create :set_profile_color

  

  validates :username, presence: true

  private

  def set_profile_color
    self.profile_color = generate_random_color unless self.profile_color.present?
  end

  def generate_random_color
    "#" + "%06x" % (rand * 0xffffff)
  end

end
