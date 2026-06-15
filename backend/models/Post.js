const mongoose = require('mongoose');

/**
 * Comment sub-schema
 * Embedded within each post document
 */
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Like sub-schema
 * Stores who liked the post
 */
const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  {
    _id: false, // No need for separate _id on likes
  }
);

/**
 * Post Schema
 * Main content schema — either text, image, or both required
 */
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Post text cannot exceed 2000 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    likes: [likeSchema],
    comments: [commentSchema],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Custom validation: at least text or image must be present
postSchema.pre('validate', function () {
  if (!this.text && !this.image) {
    this.invalidate('text', 'Post must have either text or an image');
  }
});

// Index for efficient feed pagination (newest first)
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
