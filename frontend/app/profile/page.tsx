'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, User, Shield, ChevronRight, Image as ImageIcon, KeyRound } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload'; // Marisol code for adding import for profile images 1/28/26

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: '',
    username: '',
    newUsername: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    // Marisol code for adding new fields 1/28/26 =====================
    profileImage: null as string | null,
    bannerImage: null as string | null
    // End of Marisol Morales Code 1/28/26 =====================
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // ============== Marisol Code for Dark Mode Detection 1/12/2026 ============== //
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  // ============== End Dark Mode Detection ============== //

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedUsername = localStorage.getItem('username');
    if (storedEmail) {
      setUser(prev => ({ ...prev, email: storedEmail, username: storedUsername || '' }));

      // Marisol code for fetching profile images 1/28/26 =====================
      fetchUserImages(storedEmail);
      // End of Marisol Morales Code 1/28/26 =====================
    } else {
      router.push('/');
    }
  }, [router]);

  // Marisol function for fetching images from Server
  const fetchUserImages = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/user-images?email=${encodeURIComponent(email)}`).catch(() => null);
      if (!response) {
        return;
      }
      const data = await response.json();
      
      if (data.success) {
        setUser(prev => ({
          ...prev,
          // Only set if image exists, otherwise keep as null for default gradient
          profileImage: data.profileImage ? `http://localhost:4000${data.profileImage}` : null,
          bannerImage: data.bannerImage ? `http://localhost:4000${data.bannerImage}` : null
        }));
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  };
  // End of Marisol Morales Code 1/28/26 =====================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // Add function to handle image updates- Marisol Code
  const handleProfileImageUpdate = (imageUrl: string | null) => {
    // If imageUrl is null, it means the image was removed - keep it null for default
    setUser(prev => ({ 
      ...prev, 
      profileImage: imageUrl ? `http://localhost:4000${imageUrl}` : null 
    }));
    setMessage(imageUrl ? 'Profile photo updated successfully!' : 'Profile photo removed - default restored');
    setTimeout(() => setMessage(''), 3000);
  };
  // Add handler for banner image update - Marisol Code
  const handleBannerImageUpdate = (imageUrl: string | null) => {
    // If imageUrl is null, it means the image was removed - keep it null for default
    setUser(prev => ({ 
      ...prev, 
      bannerImage: imageUrl ? `http://localhost:4000${imageUrl}` : null 
    }));
    setMessage(imageUrl ? 'Cover image updated successfully!' : 'Cover image removed - default restored');
    setTimeout(() => setMessage(''), 3000);
  };
  // End of Marisol Morales Code 1/28/26 =====================

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!user.newUsername) {
      setMessage('Please enter a new username');
      setIsLoading(false);
      return;
    }
    if (user.newUsername === user.username) {
      setMessage('New username must be different than current username');
      setIsLoading(false);
      return;
    }

    if (!user.password) {
      setMessage('Please enter your current password to confirm change');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          currentPassword: user.password,
          newUsername: user.newUsername,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`${data.message || 'Error updating username'}`);
        setIsLoading(false);
        return;
      }

      localStorage.setItem('username', user.newUsername);
      setUser(prev => ({ ...prev, username: user.newUsername, newUsername: '', password: '' }));
      setMessage('Username updated successfully!');
      setEditUsername(false);
    } catch (error) {
      setMessage('Error updating username');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!user.password) {
      setMessage('Please enter your current password');
      setIsLoading(false);
      return;
    }

    if (user.newPassword && user.newPassword !== user.confirmPassword) {
      setMessage('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (user.newPassword && user.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          currentPassword: user.password,
          newPassword: user.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`${data.message || 'Error updating profile'}`);
        return;
      }
      
      setMessage('Password updated successfully!');
      setUser(prev => ({ ...prev, password: '', newPassword: '', confirmPassword: '' }));
      setChangePasswordOpen(false);
      
    } catch (error) {
      setMessage('Error updating profile');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return;
    }

    const password = window.prompt('Please enter your password to confirm account deletion:');
    if (!password) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:4000/api/profile/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`${data.message || 'Error deleting account'}`);
        setIsLoading(false);
        return;
      }
      
      localStorage.removeItem('userEmail');
      localStorage.removeItem('username');
      setMessage('Account deleted successfully');
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (error) {
      setMessage('Error deleting account');
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    router.push('/');
  };

  const getInitials = (username: string) => {
    return username ? username.substring(0, 2).toUpperCase() : 'UN';
  };

  const formatJoinDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    // ============== Marisol Code for Dark Mode: Updated page background 1/12/2026 ============== //
    <div className="min-h-screen" style={{ 
      background: isDark 
        ? 'linear-gradient(to bottom, #0a0a0a, #0a0a0a)' 
        : 'linear-gradient(to bottom, #f9fafb, white)' 
    }}>
    {/* ============== End Dark Mode Background ============== */}
      {/* Header Section */}
      {/* ============== Marisol Code for Dark Mode: Updated header background and border 1/12/2026 ============== */}
      <div className="border-b" style={{ 
        backgroundColor: 'var(--background)',
        borderColor: 'var(--color-gray-light)'
      }}>
      {/* ============== End Dark Mode Header ============== */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div>
            <h1 className="text-3xl mb-1 font-bold" style={{ color: 'var(--foreground)' }}>
              Account Settings
            </h1>
            <p style={{ color: 'var(--color-gray)' }}>
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Profile Section */}
          {/* ============== Marisol Code for Dark Mode: Updated card background and border 1/12/2026 ============== */}
          <div className="rounded-xl border overflow-hidden shadow-sm" style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--color-gray-light)'
          }}>
          {/* ============== End Dark Mode Card ============== */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8CE4FF] to-[#FFA239] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    Profile Information
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    Update your profile picture and personal details
                  </p>
                </div>
              </div>

              <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>
              {/* Marisol code for adding ImageUpload components 1/28/26 */}
              {/* Profile Picture & Banner */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ImageUpload
                      currentImage={user.profileImage}
                      onImageUpdate={handleProfileImageUpdate}
                      type="profile"
                      userEmail={user.email}
                      username={user.username}
                    />
                    <div>
                      <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        Profile Photo
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

                {/* Banner Image */}
                <div className="space-y-2">
                  <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>
                    Cover Image
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-gray)' }}>
                    Recommended: 1584x396px
                  </p>
                  <ImageUpload
                    currentImage={user.bannerImage}
                    onImageUpdate={handleBannerImageUpdate}
                    type="banner"
                    userEmail={user.email}
                    username={user.username}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="rounded-xl border overflow-hidden shadow-sm" style={{
            backgroundColor: 'var(--background)', 
            borderColor: 'var(--color-gray-light)'
          }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FEEE91] to-[#FFA239] flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    Account Details
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    Manage your account information
                  </p>
                </div>
              </div>

              <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

              <div className="space-y-4">
                {/* Username */}
                <div 
                  className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer" 
                  style={{
                    backgroundColor: isDark ? 'transparent' : 'transparent' // Changed by Marisol 1/12/2026 for Dark Mode Support
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => {
                    setUser(prev => ({ ...prev, newUsername: prev.username }));
                    setEditUsername(true);
                  }}
                >
                  <div className="flex-1">
                    <label className="text-sm" style={{ color: 'var(--color-gray)' }}>Username</label>
                    <p className="text-base mt-1" style={{ color: 'var(--foreground)' }}>
                      @{user.username || 'Not set'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-gray)' }} />
                </div>

                <div className="h-px" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

                {/* Email (Read-only) */}
                <div className="flex items-center justify-between p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm" style={{ color: 'var(--color-gray)' }}>Email Address</label>
                    <p className="text-base mt-1" style={{ color: 'var(--foreground)' }}>
                      {user.email || 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="h-px" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

                {/* Member Since */}
                <div className="flex items-center justify-between p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm" style={{ color: 'var(--color-gray)' }}>Member Since</label>
                    <p className="text-base mt-1" style={{ color: 'var(--foreground)' }}>
                      {formatJoinDate()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border overflow-hidden shadow-sm" style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--color-gray-light)'
          }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8CE4FF] to-[#FFA239] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    Security
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    Manage your password and security settings
                  </p>
                </div>
              </div>

              <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer" 
                  style={{
                    backgroundColor: isDark ? 'transparent' : 'transparent' // Changed by Marisol 1/12/2026 for Dark Mode Support
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                      backgroundColor: 'var(--color-gray-light)'
                    }}>
                      <KeyRound className="w-5 h-5" style={{ color: 'var(--color-gray)' }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>Password</p>
                      <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                        Change your password
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-gray)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="rounded-xl border-2 border-red-200 overflow-hidden shadow-sm" style={{
            backgroundColor: 'var(--background)'
          }}>
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl text-red-600 mb-1 font-semibold">Delete Account</h2>
                <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                  Permanently delete your account and all data. This action cannot be undone.
                </p>
              </div>

              <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  style={{ backgroundColor: '#FF5656', color: 'white' }}
                  className="px-6 py-2 font-semibold rounded-lg hover:bg-[#FF3838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div 
          className="fixed bottom-8 right-8 max-w-md p-4 rounded-lg shadow-lg font-semibold border-2 animate-fade-in" 
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--color-gray-light)',
            color: 'var(--foreground)'
          }}
        >
          {message}
        </div>
      )}

      {/* Edit Username Modal */}
      {editUsername && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditUsername(false)}>
          <div 
            className="rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" 
            style={{ backgroundColor: 'var(--background)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Edit Username
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-gray)' }}>
              Update your username. This will change how others see you.
            </p>
            
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Username
                </label>
                <input
                  type="text"
                  name="newUsername"
                  value={user.newUsername}
                  onChange={handleChange}
                  placeholder="Enter new username"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-gray)' }}>
                  Use letters, numbers, and underscores only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Confirm with Current Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditUsername(false);
                    setUser(prev => ({ ...prev, newUsername: '', password: '' }));
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors font-medium"
                  style={{
                    borderColor: 'var(--color-gray-light)',
                    // ============== Marisol Code for Dark Mode: Improved button text visibility 1/12/2026 ============== //
                    color: isDark ? '#e5e5e5' : '#374151',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                    // ============== End Dark Mode Button Text ============== //
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#8CE4FF',
                    color: '#1a1a1a'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = '#6DD5FF';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = '#8CE4FF';
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setChangePasswordOpen(false)}>
          <div 
            className="rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" 
            style={{ backgroundColor: 'var(--background)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Change Password
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-gray)' }}>
              Ensure your account is using a strong password to stay secure.
            </p>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={user.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-gray)' }}>
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={user.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setUser(prev => ({ ...prev, password: '', newPassword: '', confirmPassword: '' }));
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors font-medium"
                  style={{
                    borderColor: 'var(--color-gray-light)',
                    // ============== Marisol Code for Dark Mode: Improved button text visibility 1/12/2026 ============== //
                    color: isDark ? '#e5e5e5' : '#374151',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                    // ============== End Dark Mode Button Text ============== //
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#8CE4FF',
                    color: '#1a1a1a'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = '#6DD5FF';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = '#8CE4FF';
                  }}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}