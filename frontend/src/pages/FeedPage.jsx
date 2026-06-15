import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { Box, Typography, CircularProgress, Skeleton, Card, CardContent } from '@mui/material';
import { DynamicFeed as FeedIcon } from '@mui/icons-material';

// Skeleton loader for posts
function PostSkeleton() {
  return (
    <Card sx={{ mb: 2.5 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={42} height={42} />
          <Box>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={80} height={16} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2, borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
}

function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const lastPostRef = useRef(null);

  // Fetch posts with cursor-based pagination
  const fetchPosts = useCallback(async (before = null) => {
    try {
      const params = { limit: 10 };
      if (before) params.before = before;
      const res = await API.get('/posts', { params });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      return { posts: [], hasMore: false };
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data.posts);
      setHasMore(data.hasMore);
      setLoading(false);
    };
    loadInitial();
  }, [fetchPosts]);

  // Infinite scroll — IntersectionObserver
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          const lastPost = posts[posts.length - 1];
          const before = lastPost?.createdAt;
          const data = await fetchPosts(before);
          setPosts((prev) => [...prev, ...data.posts]);
          setHasMore(data.hasMore);
          setLoadingMore(false);
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;
    if (lastPostRef.current) observer.observe(lastPostRef.current);

    return () => observer.disconnect();
  }, [posts, loading, loadingMore, hasMore, fetchPosts]);

  // Handle new post created — prepend to feed
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Handle post deleted — remove from feed
  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <Box sx={{ maxWidth: 620, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 3 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <FeedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700}>Feed</Typography>
      </Box>

      {/* Create post (only for authenticated users) */}
      {isAuthenticated && <CreatePost onPostCreated={handlePostCreated} />}

      {/* Loading skeletons */}
      {loading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {/* Posts list */}
      {!loading && posts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FeedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No posts yet</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAuthenticated ? 'Be the first to share something!' : 'Sign in to create the first post!'}
          </Typography>
        </Box>
      )}

      {!loading && posts.map((post, index) => (
        <Box key={post._id} ref={index === posts.length - 1 ? lastPostRef : null}>
          <PostCard post={post} onDelete={handlePostDeleted} />
        </Box>
      ))}

      {/* Loading more indicator */}
      {loadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={32} sx={{ color: 'primary.main' }} />
        </Box>
      )}

      {/* End of feed */}
      {!loading && !hasMore && posts.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3, opacity: 0.5 }}>
          You&apos;ve reached the end of the feed ✨
        </Typography>
      )}
    </Box>
  );
}

export default FeedPage;
