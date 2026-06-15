/**
 * Seed Script — Populates the database with Indian users, posts, comments & likes
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');

// ─── Indian Users ───────────────────────────────────────────────────
const indianUsers = [
  { username: 'aarav_sharma', email: 'aarav.sharma@gmail.com', password: 'password123' },
  { username: 'priya_patel', email: 'priya.patel@gmail.com', password: 'password123' },
  { username: 'rohan_gupta', email: 'rohan.gupta@gmail.com', password: 'password123' },
  { username: 'ananya_singh', email: 'ananya.singh@gmail.com', password: 'password123' },
  { username: 'arjun_verma', email: 'arjun.verma@gmail.com', password: 'password123' },
  { username: 'ishita_reddy', email: 'ishita.reddy@gmail.com', password: 'password123' },
  { username: 'vikram_joshi', email: 'vikram.joshi@gmail.com', password: 'password123' },
  { username: 'neha_kapoor', email: 'neha.kapoor@gmail.com', password: 'password123' },
];

// ─── Posts with Indian context ──────────────────────────────────────
const postTexts = [
  "Just visited the Taj Mahal for the first time! 🕌✨ The beauty is beyond words. Every Indian must visit at least once in their lifetime.",
  "Made the perfect filter coffee this morning ☕ South Indian filter coffee hits different on a rainy day. Who else is a coffee lover here?",
  "Happy Diwali to everyone! 🪔🎇 May this festival of lights bring joy, prosperity, and happiness to all. #HappyDiwali #FestivalOfLights",
  "Weekend trek to Triund Hill, Himachal Pradesh 🏔️ The view from the top was absolutely breathtaking. Nature at its finest!",
  "Just completed my first full marathon in Mumbai! 🏃‍♂️🏅 26.2 miles of pure determination. Thanks to everyone who cheered me on!",
  "Tried making biryani from scratch today and it turned out amazing! 🍚🍗 Hyderabadi dum biryani for the win. Drop your favorite biryani recipe below!",
  "Watching India vs Australia cricket match with family. 🏏 What a thrilling innings by Virat! Nothing beats cricket with chai and samosa.",
  "Started learning Bharatanatyam dance at 25. It's never too late to connect with our culture and traditions! 💃🇮🇳 #IndianClassicalDance",
  "Morning yoga session at the banks of Ganga in Rishikesh 🧘‍♀️ The peace and tranquility here is unmatched. Highly recommend everyone to visit!",
  "Just got placed at a top MNC! 🎉 All those late night coding sessions finally paid off. Thank you IIT for everything! #Placement #Engineering",
  "Street food tour in Delhi's Chandni Chowk 🤤 From gol gappe to jalebi, every bite was pure bliss. Delhi food > everything else!",
  "Celebrating Holi with colors and love! 🎨🌈 Bura na mano, Holi hai! Wishing everyone a colorful and joyful Holi. #HappyHoli",
  "Monsoon in Kerala is a different vibe altogether 🌧️🌴 The lush green backwaters, fresh air, and hot pakoras — absolute paradise!",
  "Finally launched my startup after 2 years of hard work! 🚀 Building tech solutions for rural India. Proud to be a part of India's startup ecosystem.",
  "Attended the Jaipur Literature Festival this year 📚 Got to meet so many incredible authors. India's literary scene is thriving!",
];

// ─── Comments ───────────────────────────────────────────────────────
const commentTexts = [
  "This is amazing! 🔥",
  "So beautiful! I need to visit too 😍",
  "Congratulations bhai! 🎉",
  "Love this! Jai Hind! 🇮🇳",
  "Totally agree with you! 💯",
  "Wow, this made my day! ❤️",
  "Keep it up, proud of you! 👏",
  "Incredible! Sharing this with my friends.",
  "Bahut badhiya! 🙌",
  "This is so inspiring! Thanks for sharing.",
  "Mast hai yaar! 😄",
  "Can't wait to try this myself!",
  "India is truly incredible! 🇮🇳",
  "You're an inspiration to all of us!",
  "Dil khush kar diya bhai! ❤️‍🔥",
  "So proud of our culture and traditions!",
  "Absolutely stunning! Where is this exactly?",
  "Living the dream! Keep going 💪",
  "This deserves more likes! Sharing now.",
  "Ek number! Bohot accha! 🤩",
];

// ─── Helper: random pick from array ─────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

// ─── Main Seed Function ─────────────────────────────────────────────
async function seed() {
  try {
    await connectDB();
    console.log('\n🌱 Starting seed process...\n');

    // 1. Create users (hash passwords manually since pre-save hook is async)
    const createdUsers = [];
    for (const userData of indianUsers) {
      // Check if user already exists
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`   ⏩ User "${userData.username}" already exists, skipping`);
        createdUsers.push(existing);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`   ✅ Created user: ${user.username} (${user.email})`);
    }

    // Also fetch existing users (john_doe, jane_smith) if they exist
    const existingJohn = await User.findOne({ username: 'john_doe' });
    const existingJane = await User.findOne({ username: 'jane_smith' });
    const allUsers = [...createdUsers];
    if (existingJohn) allUsers.push(existingJohn);
    if (existingJane) allUsers.push(existingJane);

    console.log(`\n   📊 Total users available: ${allUsers.length}\n`);

    // 2. Create posts with random authors, staggered timestamps
    const createdPosts = [];
    for (let i = 0; i < postTexts.length; i++) {
      const author = createdUsers[i % createdUsers.length];
      // Stagger post creation times (spread over the last 7 days)
      const hoursAgo = Math.floor(Math.random() * 168); // 0-168 hours (7 days)
      const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      const post = await Post.create({
        author: author._id,
        text: postTexts[i],
        likes: [],
        comments: [],
        createdAt,
      });
      createdPosts.push(post);
      console.log(`   📝 Post by ${author.username}: "${postTexts[i].slice(0, 50)}..."`);
    }

    // 3. Add likes to posts (each post gets 2-7 random likes)
    console.log('\n   ❤️  Adding likes...');
    for (const post of createdPosts) {
      const numLikes = 2 + Math.floor(Math.random() * 6); // 2-7 likes
      const likers = pickN(allUsers, Math.min(numLikes, allUsers.length));

      for (const liker of likers) {
        // Don't add duplicate likes
        const alreadyLiked = post.likes.some(
          (l) => l.user.toString() === liker._id.toString()
        );
        if (!alreadyLiked) {
          post.likes.push({ user: liker._id, username: liker.username });
        }
      }
      await post.save();
      console.log(`      ${post.likes.length} likes on "${post.text.slice(0, 40)}..."`);
    }

    // 4. Add comments to posts (each post gets 1-4 random comments)
    console.log('\n   💬 Adding comments...');
    for (const post of createdPosts) {
      const numComments = 1 + Math.floor(Math.random() * 4); // 1-4 comments
      const commenters = pickN(allUsers, Math.min(numComments, allUsers.length));

      for (const commenter of commenters) {
        const commentText = pick(commentTexts);
        const minutesAgo = Math.floor(Math.random() * 60 * 24); // within last day
        const commentTime = new Date(
          post.createdAt.getTime() + minutesAgo * 60 * 1000
        );

        post.comments.push({
          user: commenter._id,
          username: commenter.username,
          text: commentText,
          createdAt: commentTime,
        });
      }
      await post.save();
      console.log(`      ${post.comments.length} comments on "${post.text.slice(0, 40)}..."`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log(`   👤 Users: ${createdUsers.length} new + ${allUsers.length - createdUsers.length} existing`);
    console.log(`   📝 Posts: ${createdPosts.length}`);
    console.log(`   ❤️  Total likes: ${createdPosts.reduce((sum, p) => sum + p.likes.length, 0)}`);
    console.log(`   💬 Total comments: ${createdPosts.reduce((sum, p) => sum + p.comments.length, 0)}`);
    console.log('\n   🔑 All new users have password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
