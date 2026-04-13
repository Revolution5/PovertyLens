'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, User, Shield, ChevronRight, Image as ImageIcon, KeyRound, CreditCard, CheckCircle, Eye, Mail } from 'lucide-react'; // Added CreditCard + CheckCircle for Payment Card feature - marisol morales 2-28 // Added Eye for Accessibility - Modified by Marisol 3/5/2026 // Added Mail for Email Preferences - Damon
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
    bannerImage: null as string | null,
    dailyFactsOptIn: true, // added by marisol for work review 3 
    // End of Marisol Morales Code 1/28/26 =====================
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // ============== Damon - Email Preferences state ==============
  const [digestOptIn, setDigestOptIn] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  // ============== End Email Preferences state ==============

  // ============== marisol morales 3/1/26 - Add Payment Card state ==============
  const [addCardOpen, setAddCardOpen] = useState(false); // Controls Add Card modal visibility
  const [cardForm, setCardForm] = useState({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' }); // Card form field values
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({}); // Per-field validation errors
  const [cardSubmitting, setCardSubmitting] = useState(false); // True while mock API call is running
  const [cardSuccess, setCardSuccess] = useState(false); // True after submission, triggers success banner
  // ============== End Add Card State ==============
  
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

      // Damon - fetch digest opt-in status
      fetchDigestSettings(storedEmail);
    } else {
      router.push('/');
    }
  }, [router]);

  // Marisol function for fetching images from Server
  const fetchUserImages = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/profile/user-images?email=${encodeURIComponent(email)}`); // Edited by Christella - 02/27/2026
      const data = await response.json();
      
      if (data.success) {
        setUser(prev => ({
          ...prev,
          // Only set if image exists, otherwise keep as null for default gradient
          profileImage: data.profileImage ? `http://localhost:4000${data.profileImage}` : null,
          bannerImage: data.bannerImage ? `http://localhost:4000${data.bannerImage}` : null,
          dailyFactsOptIn: data.dailyFactsOptIn !== false
        }));
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  };
  // End of Marisol Morales Code 1/28/26 =====================

  // Damon - fetch and toggle weekly digest opt-in
  const fetchDigestSettings = async (email: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/profile/settings?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (data.success) setDigestOptIn(data.weeklyDigestOptIn);
    } catch {
      // silently ignore — default remains false
    }
  };

  const handleDigestToggle = async () => {
    const newValue = !digestOptIn;
    setDigestLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/profile/digest-optin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, optIn: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setDigestOptIn(newValue);
        setMessage(newValue ? 'Weekly digest enabled!' : 'Weekly digest disabled.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('Error updating email preference.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setDigestLoading(false);
    }
  };
  // End Damon

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

 // Added by Marisol for Daily Facts Preference work review 3
  const handleDailyFactsToggle = async (enabled: boolean) => {
    setUser(prev => ({ ...prev, dailyFactsOptIn: enabled }));
    try {
      const response = await fetch('http://localhost:4000/api/profile/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          dailyFactsOptIn: enabled,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Could not save daily facts preference');
        setUser(prev => ({ ...prev, dailyFactsOptIn: !enabled }));
        return;
      }

      setMessage('Daily facts preference saved');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving daily facts preference:', error);
      setMessage('Could not save daily facts preference');
      setUser(prev => ({ ...prev, dailyFactsOptIn: !enabled }));
      setTimeout(() => setMessage(''), 3000);
    }
  };
// end of Marisol code for Daily Facts Preference
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

  // ============== marisol morales 2-28 - Add Card helper functions ==============
  const formatCardNumber = (value: string) => { // Inserts a space every 4 digits, max 19 chars
    const cleaned = value.replace(/\D/g, '');
    return (cleaned.match(/.{1,4}/g)?.join(' ') || cleaned).substring(0, 19);
  };

  const formatExpiry = (value: string) => { // Auto-inserts slash to produce MM/YY format
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 2 ? cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) : cleaned;
  };

  const handleCardChange = (field: string, value: string) => { // Handles input for all card fields, applies formatting and clears field error
    let formatted = value;
    if (field === 'cardNumber') formatted = formatCardNumber(value);
    else if (field === 'expiryDate') formatted = formatExpiry(value);
    else if (field === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 4); // Digits only, max 4
    setCardForm(prev => ({ ...prev, [field]: formatted }));
    if (cardErrors[field]) setCardErrors(prev => ({ ...prev, [field]: '' })); // Clear error when user corrects the field
  };

  const handleCardSubmit = async (e: React.FormEvent) => { // Validates fields then runs a mock submission (no data stored)
    e.preventDefault();
    const errs: Record<string, string> = {};
    const digits = cardForm.cardNumber.replace(/\s/g, '');
    if (digits.length !== 16) errs.cardNumber = 'Must be 16 digits';
    if (!cardForm.cardName.trim()) errs.cardName = 'Cardholder name is required';
    if (cardForm.expiryDate.length !== 5) errs.expiryDate = 'Enter as MM/YY';
    else {
      const month = parseInt(cardForm.expiryDate.split('/')[0]);
      if (month < 1 || month > 12) errs.expiryDate = 'Invalid month';
    }
    if (cardForm.cvv.length < 3) errs.cvv = 'Must be 3–4 digits';
    if (Object.keys(errs).length) { setCardErrors(errs); return; } // Stop if any errors exist
    setCardSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated network delay
    console.log('Mock card added (not stored):', { lastFour: cardForm.cardNumber.slice(-4), cardName: cardForm.cardName });
    setCardSubmitting(false);
    setCardSuccess(true);
    setTimeout(() => { // Reset and close modal after 2s
      setCardSuccess(false);
      setCardForm({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
      setAddCardOpen(false);
    }, 2000);
  };
  // ============== End Add Card Helpers ==============

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

                {/*  added by marisol for work report 3 - Daily Facts Preference */}
                <div className="flex items-center justify-between p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm" style={{ color: 'var(--color-gray)' }}>Daily “Did you know?” facts</label>
                    <p className="text-base mt-1" style={{ color: 'var(--foreground)' }}>
                      Receive daily facts as notifications in your account.
                    </p>
                  </div>
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      checked={user.dailyFactsOptIn}
                      onChange={(e) => handleDailyFactsToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8CE4FF] rounded-full peer peer-checked:bg-[#8CE4FF] transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white border border-gray-300 peer-checked:translate-x-5 rounded-full w-4 h-4 transition-transform"></div>
                  </label>
                </div>
                {/* end of added by marisol for work report 3 - Daily Facts Preference */}

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

                {/* ============== marisol morales 2-28 - Payment Card row, opens Add Card modal on click ============== */}
                <div className="h-px" style={{ backgroundColor: 'var(--color-gray-light)' }}></div> {/* Divider between Password and Payment Card rows */}
                <div 
                  className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer" 
                  style={{
                    backgroundColor: isDark ? 'transparent' : 'transparent' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; 
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => setAddCardOpen(true)} // Opens Add Card modal
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                      backgroundColor: 'var(--color-gray-light)'
                    }}>
                      <CreditCard className="w-5 h-5" style={{ color: 'var(--color-gray)' }} /> {/* CreditCard icon added to lucide import */}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>Payment Card</p>
                      <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                        Add a card for donations
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-gray)' }} />
                </div>
                {/* ============== End Payment Card Row ============== */}
              </div>
            </div>
          </div>

          {/* ============== Email Preferences Section - Added by Damon ============== */}
          <div className="rounded-xl border overflow-hidden shadow-sm" style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--color-gray-light)'
          }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8CE4FF] to-[#4ade80] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    Email Preferences
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    Manage the emails you receive from PovertyLens
                  </p>
                </div>
              </div>

              <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

              <div className="flex items-center justify-between p-4 rounded-lg" style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                    backgroundColor: 'var(--color-gray-light)'
                  }}>
                    <Mail className="w-5 h-5" style={{ color: 'var(--color-gray)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>Weekly Digest</p>
                    <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                      A weekly summary of facts, stories, and pledge reminders — sent every Monday
                    </p>
                  </div>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={handleDigestToggle}
                  disabled={digestLoading}
                  aria-label={digestOptIn ? 'Disable weekly digest' : 'Enable weekly digest'}
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: digestOptIn ? '#4ade80' : (isDark ? '#555' : '#d1d5db')
                  }}
                >
                  <span
                    className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200"
                    style={{ transform: digestOptIn ? 'translateX(20px)' : 'translateX(0px)' }}
                  />
                </button>
              </div>

              <p className="text-xs mt-3 px-4" style={{ color: 'var(--color-gray)' }}>
                You can unsubscribe at any time via the link in the email.
              </p>
            </div>
          </div>
          {/* ============== End Email Preferences Section ============== */}

          {/* ============== Accessibility Section - Added by Marisol 3/5/2026 ============== */}
          <div className="rounded-xl border overflow-hidden shadow-sm" style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--color-gray-light)'
          }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FEEE91] to-[#FF5656] flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    Accessibility
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    Customize your viewing experience
                  </p>
                </div>
              </div>

              <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

              <div className="space-y-4">
                <Link href="/accessibility">
                  <div 
                    className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer" 
                    style={{
                      backgroundColor: isDark ? 'transparent' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                        backgroundColor: 'var(--color-gray-light)'
                      }}>
                        <Eye className="w-5 h-5" style={{ color: 'var(--color-gray)' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>Accessibility Settings</p>
                        <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                          Adjust theme and contrast
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-gray)' }} />
                  </div>
                </Link>


              </div>
            </div>
          </div>
          {/* ============== End Accessibility Section - marisol morales ============== */}

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

      {/* ============== marisol morales 3-1 - Add Payment Card Modal ============== */}
      {addCardOpen && ( // Renders only when addCardOpen is true
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setAddCardOpen(false)}> {/* Clicking backdrop closes modal */}
          <div 
            className="rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" 
            style={{ backgroundColor: 'var(--background)' }}
            onClick={(e) => e.stopPropagation()} // Prevents clicks inside from closing the modal
          >
            {/* Header matches Security section gradient icon style */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8CE4FF] to-[#FFA239] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                  Add Payment Card
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                  Securely add your card for donations
                </p>
              </div>
            </div>

            <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>

            {/* Success banner - shown for 2s after mock submission */}
            {cardSuccess && (
              <div
                className="flex items-center gap-3 p-4 rounded-lg mb-6"
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#ECFDF5', 
                  border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#10B981'}`, 
                }}
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Card Added Successfully!</p>
                  <p className="text-xs" style={{ color: 'var(--color-gray)' }}>Card ending in {cardForm.cardNumber.slice(-4)} has been saved.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCardSubmit} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Card Number</label>
                <input
                  type="text"
                  value={cardForm.cardNumber}
                  onChange={(e) => handleCardChange('cardNumber', e.target.value)} // Auto-formats with spaces every 4 digits
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: cardErrors.cardNumber ? '#EF4444' : 'var(--color-gray-light)', // Red border on validation error
                    color: 'var(--foreground)'
                  }}
                />
                {cardErrors.cardNumber && <p className="text-xs mt-1 text-red-500">{cardErrors.cardNumber}</p>}
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Cardholder Name</label>
                <input
                  type="text"
                  value={cardForm.cardName}
                  onChange={(e) => handleCardChange('cardName', e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: cardErrors.cardName ? '#EF4444' : 'var(--color-gray-light)', // Red border on validation error
                    color: 'var(--foreground)'
                  }}
                />
                {cardErrors.cardName && <p className="text-xs mt-1 text-red-500">{cardErrors.cardName}</p>}
              </div>

              {/* Expiry + CVV side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Expiry Date</label>
                  <input
                    type="text"
                    value={cardForm.expiryDate}
                    onChange={(e) => handleCardChange('expiryDate', e.target.value)} // Auto-formats as MM/YY
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: cardErrors.expiryDate ? '#EF4444' : 'var(--color-gray-light)', // Red border on validation error
                      color: 'var(--foreground)'
                    }}
                  />
                  {cardErrors.expiryDate && <p className="text-xs mt-1 text-red-500">{cardErrors.expiryDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>CVV</label>
                  <input
                    type="text"
                    value={cardForm.cvv}
                    onChange={(e) => handleCardChange('cvv', e.target.value)} // Digits only, max 4
                    placeholder="123"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: cardErrors.cvv ? '#EF4444' : 'var(--color-gray-light)', // Red border on validation error
                      color: 'var(--foreground)'
                    }}
                  />
                  {cardErrors.cvv && <p className="text-xs mt-1 text-red-500">{cardErrors.cvv}</p>}
                </div>
              </div>

              {/* Cancel / Add Card buttons - same pattern as existing modals */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAddCardOpen(false)} // Closes modal without submitting
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors font-medium"
                  style={{
                    borderColor: 'var(--color-gray-light)',
                    color: isDark ? '#e5e5e5' : '#374151',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'; 
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; 
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cardSubmitting || cardSuccess} // Disabled while submitting or after success
                  className="flex-1 px-4 py-2 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#8CE4FF',
                    color: '#1a1a1a'
                  }}
                  onMouseEnter={(e) => {
                    if (!cardSubmitting) e.currentTarget.style.backgroundColor = '#6DD5FF';
                  }}
                  onMouseLeave={(e) => {
                    if (!cardSubmitting) e.currentTarget.style.backgroundColor = '#8CE4FF';
                  }}
                >
                  {cardSubmitting ? 'Adding Card...' : cardSuccess ? 'Card Added!' : 'Add Card'} {/* Label changes with submission state */}
                </button>
              </div>

              <p className="text-xs text-center mt-2" style={{ color: 'var(--color-gray)' }}>
                This is a demonstration only. No card data is stored or processed.
              </p>
            </form>
          </div>
        </div>
      )}
      {/* ============== End Add Payment Card Modal ============== */}
    </div>
  );
}