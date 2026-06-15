import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import {
  Person as PersonIcon, Email as EmailIcon, Lock as LockIcon,
  Visibility, VisibilityOff, PersonAdd as SignupIcon,
} from '@mui/icons-material';

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    if (formData.username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try { await signup(formData.username, formData.email, formData.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      background: 'radial-gradient(ellipse at 80% 50%, rgba(124,77,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 20% 50%, rgba(255,109,0,0.08) 0%, transparent 50%)' }}>
      <Card sx={{ width: '100%', maxWidth: 440, p: { xs: 1, sm: 2 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #FF6D00 0%, #7C4DFF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(255,109,0,0.25)' }}>
              <SignupIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>Create Account</Typography>
            <Typography variant="body2" color="text.secondary">Join the community and start sharing</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth name="username" label="Username" placeholder="Choose a username" value={formData.username} onChange={handleChange} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }} />
            <TextField fullWidth name="email" type="email" label="Email Address" placeholder="you@example.com" value={formData.email} onChange={handleChange} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }} />
            <TextField fullWidth name="password" type={showPassword ? 'text' : 'password'} label="Password" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment> }} />
            <TextField fullWidth name="confirmPassword" type={showPassword ? 'text' : 'password'} label="Confirm Password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} sx={{ mb: 3 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }} />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, background: 'linear-gradient(135deg, #FF6D00 0%, #7C4DFF 100%)', '&:hover': { background: 'linear-gradient(135deg, #7C4DFF 0%, #FF6D00 100%)' } }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Typography component={RouterLink} to="/login" variant="body2" sx={{ color: 'primary.light', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>Sign In</Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SignupPage;
