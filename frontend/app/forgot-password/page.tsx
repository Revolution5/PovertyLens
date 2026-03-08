'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type Step = 'request' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = 'http://localhost:4000';

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${backendUrl}/api/forgot-password/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        const detailed = data?.detail ? `${data.message} (${data.detail})` : data.message;
        setMessage(detailed || 'Unable to request reset code.');
        return;
      }

      setMessage(data.message || 'Email found. You can now set a new password.');
      setStep('reset');
    } catch (error) {
      console.error('Error checking email:', error);
      setIsError(true);
      setMessage('Error connecting to server. Check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/forgot-password/reset-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.message || 'Unable to reset password.');
        return;
      }

      setMessage(data.message || 'Password reset successfully. Redirecting to sign in...');
      setTimeout(() => {
        router.push('/signin');
      }, 1500);
    } catch (error) {
      console.error('Error resetting password:', error);
      setIsError(true);
      setMessage('Error connecting to server. Check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--background)' }}>
      <div className="pt-16 pb-8 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Reset Your Password
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-gray)' }}>
          {step === 'request'
            ? 'Enter your account email to continue.'
            : 'Set a new password for this account.'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6">
        <div className="card card-cyan p-8 md:p-10">
          {step === 'request' ? (
            <form onSubmit={handleCheckEmail} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your account email"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent transition-all"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(to right, #FFA239, #FF5656)'
                }}
              >
                {isLoading ? 'Checking email...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="email-readonly" className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                  Email Address
                </label>
                <input
                  id="email-readonly"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-gray)'
                  }}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent transition-all"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Re-enter your new password"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent transition-all"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(to right, #FFA239, #FF5656)'
                }}
              >
                {isLoading ? 'Resetting password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setNewPassword('');
                  setConfirmPassword('');
                  setMessage('');
                  setIsError(false);
                }}
                className="w-full py-3 px-6 rounded-xl font-medium border transition-colors"
                style={{
                  color: 'var(--foreground)',
                  borderColor: 'var(--color-gray-light)',
                  backgroundColor: 'transparent'
                }}
              >
                Use a different email
              </button>
            </form>
          )}

          {message && (
            <div
              className="mt-6 p-4 rounded-xl text-center font-medium border"
              style={{
                backgroundColor: isError ? 'rgb(254, 242, 242)' : 'rgb(240, 253, 244)',
                color: isError ? 'rgb(185, 28, 28)' : 'rgb(21, 128, 61)',
                borderColor: isError ? 'rgb(254, 202, 202)' : 'rgb(187, 247, 208)'
              }}
            >
              {message}
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => router.push('/signin')}
              className="w-full py-3 px-6 rounded-xl font-medium border transition-colors flex items-center justify-center gap-2"
              style={{
                color: 'var(--foreground)',
                borderColor: 'var(--color-gray-light)',
                backgroundColor: 'transparent'
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
