const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// ─── Multer Configuration for Image Uploads ──────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-randomNum.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `post-${uniqueSuffix}${ext}`);
  },
});

// File filter — only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

/**
 * @route   GET /api/posts
 * @desc    Get paginated feed of all posts (newest first)
 * @access  Public
 * @query   limit (default 10), before (ISO timestamp for cursor)
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const before = req.query.before;

    // Build query — cursor-based pagination
    const query = {};
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1) // Fetch one extra to check if there are more
      .populate('author', 'username avatar')
      .lean();

    // Determine if there are more posts
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop(); // Remove the extra post

    res.json({ posts, hasMore });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

/**
 * @route   POST /api/posts
 * @desc    Create a new post (text and/or image)
 * @access  Private
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    // Validate: at least text or image
    if (!text && !image) {
      return res.status(400).json({ message: 'Post must have either text or an image' });
    }

    const post = new Post({
      author: req.user._id,
      text: text || '',
      image,
    });

    await post.save();

    // Populate author info before sending response
    await post.populate('author', 'username avatar');

    res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error creating post' });
  }
});

/**
 * @route   PUT /api/posts/:id/like
 * @desc    Toggle like on a post (like if not liked, unlike if already liked)
 * @access  Private
 */
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked this post
    const existingLikeIndex = post.likes.findIndex(
      (like) => like.user.toString() === req.user._id.toString()
    );

    if (existingLikeIndex > -1) {
      // Unlike — remove the like
      post.likes.splice(existingLikeIndex, 1);
    } else {
      // Like — add the like
      post.likes.push({
        user: req.user._id,
        username: req.user.username,
      });
    }

    await post.save();

    res.json({
      likes: post.likes,
      likesCount: post.likes.length,
      isLiked: existingLikeIndex === -1, // true if we just liked, false if we unliked
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add a comment to a post
 * @access  Private
 */
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      username: req.user.username,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    // Return the newly added comment (last in array)
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      comment: newComment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete own post
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only the author can delete their post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

module.exports = router;
