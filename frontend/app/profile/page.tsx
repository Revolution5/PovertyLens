'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUser(prev => ({ ...prev, email: storedEmail }));
    } else {
      // Redirect to home if not logged in
      router.push('/');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!user.password) {
      setMessage('❌ Please enter your current password');
      setIsLoading(false);
      return;
    }

    if (user.newPassword && user.newPassword !== user.confirmPassword) {
      setMessage('❌ New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (user.newPassword && user.newPassword.length < 6) {
      setMessage('❌ New password must be at least 6 characters');
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
        setMessage(`❌ ${data.message || 'Error updating profile'}`);
        return;
      }
      
      setMessage('✅ Profile updated successfully!');
      setUser(prev => ({ ...prev, password: '', newPassword: '', confirmPassword: '' }));
      
    } catch (error) {
      setMessage('❌ Error updating profile');
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
        setMessage(`❌ ${data.message || 'Error deleting account'}`);
        setIsLoading(false);
        return;
      }
      
      localStorage.removeItem('userEmail');
      setMessage('✅ Account deleted successfully');
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (error) {
      setMessage('❌ Error deleting account');
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0E6] to-[#E8DFCA] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#D9D1B7] rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-[#623100] text-center mb-8">
            Your Profile
          </h1>
          
          <div className="bg-[#C8AB8F] rounded-xl p-6 mb-8 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-lg text-[#623100] mb-2">
                  <span className="font-semibold">Current Email:</span> {user.email || 'Not logged in'}
                </p>
                <p className="text-sm text-[#8B4513]">
                  Member since: {new Date().toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-[#623100] text-white font-semibold rounded-lg hover:bg-[#8B4513] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Update Profile Form */}
            <div className="bg-[#C8AB8F] rounded-xl p-6 shadow-inner">
              <h2 className="text-2xl font-bold text-[#623100] mb-6">
                Update Profile
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-[#623100] font-semibold mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 bg-[#F5F0E6] border border-[#8B4513] rounded-lg text-[#623100] focus:outline-none focus:ring-2 focus:ring-[#623100]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#623100] font-semibold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={user.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-[#F5F0E6] border border-[#8B4513] rounded-lg text-[#623100] focus:outline-none focus:ring-2 focus:ring-[#623100]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#623100] font-semibold mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={user.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-[#F5F0E6] border border-[#8B4513] rounded-lg text-[#623100] focus:outline-none focus:ring-2 focus:ring-[#623100]"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#623100] text-white font-bold rounded-lg hover:bg-[#8B4513] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Account Settings */}
            <div className="space-y-8">
              {/* Danger Zone */}
              <div className="bg-[#C8AB8F] rounded-xl p-6 shadow-inner border-2 border-[#8B0000]">
                <h2 className="text-2xl font-bold text-[#8B0000] mb-4">
                  ⚠️ Danger Zone
                </h2>
                <p className="text-[#623100] mb-6">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#8B0000] text-white font-bold rounded-lg hover:bg-[#B22222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>

              {/* Quick Links */}
              <div className="bg-[#C8AB8F] rounded-xl p-6 shadow-inner">
                <h2 className="text-2xl font-bold text-[#623100] mb-4">
                  Quick Links
                </h2>
                <div className="space-y-3">
                  <Link 
                    href="/" 
                    className="block px-4 py-3 bg-[#F5F0E6] text-[#623100] font-semibold rounded-lg hover:bg-[#D8B99B] transition-colors text-center"
                  >
                    ← Back to Home
                  </Link>
                  <Link 
                    href="/statistics" 
                    className="block px-4 py-3 bg-[#F5F0E6] text-[#623100] font-semibold rounded-lg hover:bg-[#D8B99B] transition-colors text-center"
                  >
                    View Statistics
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-8 p-4 rounded-lg text-center font-semibold ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Removed the Account Overview section */}
      </div>
    </div>
  );
}