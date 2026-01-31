'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const backendUrl = 'http://localhost:4000';
    
    const endpoint = isLogin ? '/api/login' : '/api/signup';
    
    try {
      const payload = isLogin ? { email, password } : { email, username, password };
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! ${data.message}`);
        // Store user email
        localStorage.setItem('userEmail', email)

        // store username when available
        if (data.user && data.user.username) {
          localStorage.setItem('username', data.user.username);
        }

        // Redirect to home page after successful login/signup
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error connecting to server. Check if backend is running.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--background)' }}>
      {/* Header matching home page */}
      <div className="pt-16 pb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          {isLogin ? 'Welcome Back!' : 'Join PovertyLens'}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          {isLogin 
            ? 'Sign in to continue exploring poverty data and sharing stories' 
            : 'Create your account to start making a difference today'
          }
        </p>
      </div>
      
      {/* Creating the columns - same as home page layout */}
      <div className="flex gap-8 px-8 md:px-12 lg:px-16 flex-wrap lg:flex-nowrap max-w-7xl mx-auto">
        {/* Left column - Form */}
        <div className="flex-[11] card card-cyan p-8 md:p-10">
          <div className="mb-8">
            <h2 className="font-bold text-3xl md:text-4xl mb-2" style={{ color: 'var(--foreground)' }}>
              {isLogin ? 'Login to Your Account' : 'Create New Account'}
            </h2>
            <p className="text-lg text-gray-600">
              {isLogin 
                ? 'Enter your credentials to access your dashboard' 
                : 'Fill in the details below to get started'
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block mb-2 font-medium text-gray-800">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent bg-white transition-all"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block mb-2 font-medium text-gray-800">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent bg-white transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block mb-2 font-medium text-gray-800">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent bg-white transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(to right, #FFA239, #FF5656)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Login to Account' : 'Create Account'
              )}
            </button>
          </form>
          
          {message && (
            <div className={`mt-6 p-4 rounded-xl text-center font-medium ${message.includes('Success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600 mb-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
                setEmail('');
                setPassword('');
                setUsername('');
              }}
              className="w-full py-3 px-6 rounded-xl font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {isLogin ? 'Create a new account instead' : 'Login to existing account'}
            </button>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-6 rounded-xl font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home Page
            </button>
          </div>
        </div>

        {/* Right column - Just Logo (matching home page) */}
        <div className="flex-[9] flex justify-center items-center">
          <Image
            src="/logov3.png" 
            alt="PovertyLens Logo" 
            width={450} 
            height={450}
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}