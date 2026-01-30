'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, User, Shield, ChevronRight, Image as ImageIcon, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: '',
    username: '',
    newUsername: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedUsername = localStorage.getItem('username');
    if (storedEmail) {
      setUser(prev => ({ ...prev, email: storedEmail, username: storedUsername || '' }));
    } else {
      router.push('/');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div>
            <h1 className="text-3xl mb-1 font-bold">Account Settings</h1>
            <p className="text-gray-500">Manage your account settings and preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8CE4FF] to-[#FFA239] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  <p className="text-sm text-gray-500">Update your profile picture and personal details</p>
                </div>
              </div>

              <div className="h-px bg-gray-200 mb-6"></div>

              {/* Profile Picture & Banner */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar Placeholder */}
                    <div className="w-20 h-20 rounded-full border-2 border-gray-100 bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {getInitials(user.username)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Profile Photo</h3>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Change Photo
                  </button>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Banner Image */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">Cover Image</h3>
                    <p className="text-sm text-gray-500 mb-4">Recommended: 1584x396px</p>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-100">
                      {/* Banner Placeholder */}
                      <div className="w-full h-full bg-gradient-to-r from-[#8CE4FF] via-[#FEEE91] to-[#FFA239] flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white/40" />
                      </div>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 ml-4 mt-8"
                  >
                    <Camera className="w-4 h-4" />
                    Change Cover
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FEEE91] to-[#FFA239] flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Account Details</h2>
                  <p className="text-sm text-gray-500">Manage your account information</p>
                </div>
              </div>

              <div className="h-px bg-gray-200 mb-6"></div>

              <div className="space-y-4">
                {/* Username */}
                <div 
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" 
                  onClick={() => {
                    setUser(prev => ({ ...prev, newUsername: prev.username }));
                    setEditUsername(true);
                  }}
                >
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Username</label>
                    <p className="text-base mt-1">@{user.username || 'Not set'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Email (Read-only) */}
                <div className="flex items-center justify-between p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Email Address</label>
                    <p className="text-base mt-1">{user.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Member Since */}
                <div className="flex items-center justify-between p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Member Since</label>
                    <p className="text-base mt-1">{formatJoinDate()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8CE4FF] to-[#FFA239] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Security</h2>
                  <p className="text-sm text-gray-500">Manage your password and security settings</p>
                </div>
              </div>

              <div className="h-px bg-gray-200 mb-6"></div>

              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" 
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <KeyRound className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-gray-500">Change your password</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-white rounded-xl border-2 border-red-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl text-red-600 mb-1 font-semibold">Delete Account</h2>
                <p className="text-sm text-gray-500">Permanently delete your account and all data. This action cannot be undone.</p>
              </div>

              <div className="h-px bg-gray-200 mb-6"></div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Once you delete your account, there is no going back. Please be certain.</p>
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
        <div className="fixed bottom-8 right-8 max-w-md p-4 rounded-lg shadow-lg font-semibold bg-white border-2 border-gray-200 text-gray-800 animate-fade-in">
          {message}
        </div>
      )}

      {/* Edit Username Modal */}
      {editUsername && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditUsername(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-2">Edit Username</h3>
            <p className="text-sm text-gray-500 mb-6">
              Update your username. This will change how others see you.
            </p>
            
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="newUsername"
                  value={user.newUsername}
                  onChange={handleChange}
                  placeholder="Enter new username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Use letters, numbers, and underscores only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm with Current Password</label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditUsername(false);
                    setUser(prev => ({ ...prev, newUsername: '', password: '' }));
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[#8CE4FF] text-gray-900 font-semibold rounded-lg hover:bg-[#6DD5FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-2">Change Password</h3>
            <p className="text-sm text-gray-500 mb-6">
              Ensure your account is using a strong password to stay secure.
            </p>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={user.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={user.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setUser(prev => ({ ...prev, password: '', newPassword: '', confirmPassword: '' }));
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[#8CE4FF] text-gray-900 font-semibold rounded-lg hover:bg-[#6DD5FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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