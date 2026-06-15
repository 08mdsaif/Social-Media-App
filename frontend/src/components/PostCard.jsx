import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import CommentSection from './CommentSection';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ModeCommentOutlined as CommentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const BACKEND_URL = 'http://localhost:5000';

/**
 * PostCard — displays a single post with author info, content,
 * like/comment interactions, and expandable comment section
 */
function PostCard({ post, onDelete, onUpdate }) {
  const { user, isAuthenticated } = useAuth();

  // Check if current user has liked this post
  const isLiked = post.likes?.some((like) => like.user === user?._id);

  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  // Toggle like
  const handleLike = async () => {
    if (!isAuthenticated) return;

    // Optimistic update
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);

    try {
      const res = await API.put(`/posts/${post._id}/like`);
      setLikesCount(res.data.likesCount);
      setLiked(res.data.isLiked);
    } catch (err) {
      // Revert on error
      setLiked(liked);
      setLikesCount(post.likes?.length || 0);
      console.error('Failed to toggle like:', err);
    }
  };

  // Handle new comment added
  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  // Handle post deletion
  const handleDelete = async () => {
    try {
      await API.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  // Format relative time
  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Date(date).toLocaleDateString();
  };

  // Author info
  const authorName = post.author?.username || 'Unknown';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const isOwnPost = user?._id === (post.author?._id || post.author);

  // Text truncation
  const MAX_TEXT_LENGTH = 280;
  const isLongText = post.text && post.text.length > MAX_TEXT_LENGTH;
  const displayText = showFullText ? post.text : post.text?.slice(0, MAX_TEXT_LENGTH);

  return (
    <Card
      className="fade-in-up"
      sx={{
        mb: 2.5,
        overflow: 'hidden',
      }}
    >
      {/* ─── Header: Author + Time ──────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 42, height: 42, fontSize: '1rem' }}>
            {authorInitial}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {timeAgo(post.createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Delete button — only for post author */}
        {isOwnPost && (
          <Tooltip title="Delete post">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* ─── Post Text ──────────────────────────────────────── */}
      {post.text && (
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {displayText}
            {isLongText && !showFullText && '...'}
          </Typography>
          {isLongText && (
            <Typography
              component="span"
              variant="body2"
              onClick={() => setShowFullText(!showFullText)}
              sx={{
                color: 'primary.light',
                cursor: 'pointer',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
                ml: 0.5,
              }}
            >
              {showFullText ? 'Show less' : 'Read more'}
            </Typography>
          )}
        </CardContent>
      )}

      {/* ─── Post Image ─────────────────────────────────────── */}
      {post.image && (
        <CardMedia
          component="img"
          image={`${BACKEND_URL}${post.image}`}
          alt="Post image"
          sx={{
            maxHeight: 500,
            objectFit: 'cover',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        />
      )}

      {/* ─── Action Bar: Like + Comment ─────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: { xs: 1, sm: 2 },
          py: 1,
        }}
      >
        {/* Like button */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleLike}
            disabled={!isAuthenticated}
            sx={{
              color: liked ? '#FF5252' : 'text.secondary',
              transition: 'color 0.2s, transform 0.2s',
              transform: likeAnimating ? 'scale(1.25)' : 'scale(1)',
              '&:hover': {
                color: liked ? '#FF5252' : 'secondary.main',
                bgcolor: 'rgba(255,82,82,0.08)',
              },
            }}
          >
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ minWidth: 20 }}
          >
            {likesCount}
          </Typography>
        </Box>

        {/* Comment button */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => setCommentsExpanded(!commentsExpanded)}
            sx={{
              color: commentsExpanded ? 'primary.main' : 'text.secondary',
              '&:hover': {
                color: 'primary.light',
                bgcolor: 'rgba(124,77,255,0.08)',
              },
            }}
          >
            <CommentIcon />
          </IconButton>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ minWidth: 20 }}
          >
            {comments.length}
          </Typography>
        </Box>

        {/* Likes info chip */}
        {likesCount > 0 && (
          <Chip
            size="small"
            label={`${likesCount} ${likesCount === 1 ? 'like' : 'likes'}`}
            sx={{
              ml: 'auto',
              mr: 1,
              bgcolor: 'rgba(255,82,82,0.1)',
              color: 'text.secondary',
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        )}
      </Box>

      {/* ─── Comment Section ────────────────────────────────── */}
      <CommentSection
        postId={post._id}
        comments={comments}
        expanded={commentsExpanded}
        onCommentAdded={handleCommentAdded}
      />
    </Card>
  );
}

export default PostCard;
