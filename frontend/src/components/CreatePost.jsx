import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Image as ImageIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';

/**
 * CreatePost — form for creating new posts with text and/or image
 * @param {function} onPostCreated - Callback to add the new post to the feed
 */
function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit post
  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) {
      setError('Please add some text or an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Reset form
      setText('');
      handleRemoveImage();

      // Notify parent
      if (onPostCreated) onPostCreated(res.data.post);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // Get user initial for avatar
  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <Card
        sx={{
          mb: 3,
          overflow: 'visible',
          border: '1px solid rgba(124, 77, 255, 0.15)',
          '&:hover': { transform: 'none' }, // Disable hover lift for create card
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* User info header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar sx={{ width: 40, height: 40 }}>{initial}</Avatar>
            <Typography variant="subtitle2" color="text.secondary">
              What&apos;s on your mind, <strong style={{ color: '#E8EAED' }}>{user?.username}</strong>?
            </Typography>
          </Box>

          {/* Text input */}
          <TextField
            multiline
            minRows={2}
            maxRows={6}
            fullWidth
            placeholder="Share something with the community..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.03)',
              },
            }}
          />

          {/* Image preview */}
          {imagePreview && (
            <Box
              sx={{
                position: 'relative',
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <IconButton
                onClick={handleRemoveImage}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,82,82,0.9)' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Action bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              <Button
                startIcon={<ImageIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'secondary.main', bgcolor: 'rgba(255,109,0,0.08)' },
                }}
              >
                Photo
              </Button>
            </Box>

            <Button
              variant="contained"
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={loading || (!text.trim() && !imageFile)}
              sx={{ minWidth: 100 }}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CreatePost;
