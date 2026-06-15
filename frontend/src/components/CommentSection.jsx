import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Collapse,
  Divider,
  Button,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

/**
 * CommentSection — expandable comment list with inline comment input
 * @param {string} postId - ID of the parent post
 * @param {Array} comments - Array of comment objects
 * @param {boolean} expanded - Whether the section is open
 * @param {function} onCommentAdded - Callback when a new comment is added
 */
function CommentSection({ postId, comments = [], expanded, onCommentAdded }) {
  const { isAuthenticated, user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Show 3 comments by default, all if expanded
  const displayedComments = showAll ? comments : comments.slice(-3);
  const hasMore = comments.length > 3 && !showAll;

  // Submit new comment
  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const res = await API.post(`/posts/${postId}/comment`, { text: commentText.trim() });
      setCommentText('');
      if (onCommentAdded) onCommentAdded(res.data.comment);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
    return new Date(date).toLocaleDateString();
  };

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* View all button */}
        {hasMore && (
          <Button
            size="small"
            onClick={() => setShowAll(true)}
            sx={{ mb: 1, color: 'text.secondary', fontSize: '0.8rem' }}
          >
            View all {comments.length} comments
          </Button>
        )}

        {/* Comments list */}
        {displayedComments.map((comment, index) => (
          <Box
            key={comment._id || index}
            sx={{
              display: 'flex',
              gap: 1.5,
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
            >
              {comment.username?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.3 }}>
                <Typography variant="caption" fontWeight={600} color="text.primary">
                  {comment.username}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {timeAgo(comment.createdAt)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {comment.text}
              </Typography>
            </Box>
          </Box>
        ))}

        {/* No comments message */}
        {comments.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No comments yet. Be the first to comment!
          </Typography>
        )}

        {/* Comment input — only shown for authenticated users */}
        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'flex-end' }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 6,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  fontSize: '0.85rem',
                },
              }}
            />
            <IconButton
              onClick={handleSubmit}
              disabled={loading || !commentText.trim()}
              size="small"
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(124, 77, 255, 0.1)' },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Collapse>
  );
}

export default CommentSection;
