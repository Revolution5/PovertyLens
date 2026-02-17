'use client';

import { useState, useEffect } from 'react';
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
// Added by Marisol 1/12/2026 for Dark Mode Support

// State variable to track whether dark mode is currently active (true) or not (false)
const [isDark, setIsDark] = useState(false);

// useEffect hook runs when the component first mounts (loads)
useEffect(() => {
  // Initial check: Look at the root HTML element (<html>) and see if it has the 'dark' class
  // If the class exists, set isDark to true; otherwise false
  setIsDark(document.documentElement.classList.contains('dark'));

  // Create a MutationObserver to watch for changes to the DOM
  // This observer will trigger whenever the HTML element's attributes change
  const observer = new MutationObserver(() => {
    // When a change is detected, check again if the 'dark' class exists
    // and update the isDark state accordingly
    setIsDark(document.documentElement.classList.contains('dark'));
  });

  // Tell the observer what to watch:
  // - Target: document.documentElement (the <html> tag)
  // - What to watch: changes to attributes (specifically the 'class' attribute)
  observer.observe(document.documentElement, {
    attributes: true,           // Watch for any attribute changes
    attributeFilter: ['class']  // But only pay attention to the 'class' attribute
  });

  // Cleanup function: runs when the component unmounts (is removed from the page)
  // Disconnects the observer to prevent memory leaks and unnecessary processing
  return () => observer.disconnect();
}, []); // Empty dependency array [] means this effect only runs once when component mounts

// End of Code by Marisol 1/12/2026 for Dark Mode Support
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
        <p className="text-lg md:text-xl max-w-2xl mx-auto px-4" style={{ color: 'var(--color-gray)' }}>
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
            <p className="text-lg" style={{ color: 'var(--color-gray)' }}>
              {isLogin 
                ? 'Enter your credentials to access your dashboard' 
                : 'Fill in the details below to get started'
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent transition-all"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent transition-all"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--foreground)'
                }}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent transition-all"
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
            <div 
              className={`mt-6 p-4 rounded-xl text-center font-medium border`}
              style={{
                backgroundColor: message.includes('Success') 
                  ? (isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgb(240, 253, 244)') // Changed by Marisol 1/12/2026 for Dark Mode Support
                  : (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgb(254, 242, 242)'), // Changed by Marisol 1/12/2026 for Dark Mode Support
                color: message.includes('Success')
                  ? (isDark ? '#86efac' : 'rgb(21, 128, 61)') // Changed by Marisol 1/12/2026 for Dark Mode Support
                  : (isDark ? '#fca5a5' : 'rgb(185, 28, 28)'), // Changed by Marisol 1/12/2026 for Dark Mode Support
                borderColor: message.includes('Success')
                  ? (isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgb(187, 247, 208)') // Changed by Marisol 1/12/2026 for Dark Mode Support
                  : (isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgb(254, 202, 202)') // Changed by Marisol 1/12/2026 for Dark Mode Support
              }}
            >
              {message}
            </div>
          )}
          
          <div 
            className="mt-8 pt-8 border-t"
            style={{ borderColor: 'var(--color-gray-light)' }}
          >
            <p className="text-center mb-4" style={{ color: 'var(--color-gray)' }}>
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
              className="w-full py-3 px-6 rounded-xl font-medium border transition-colors"
              style={{
                color: 'var(--foreground)',
                borderColor: 'var(--color-gray-light)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
              }}
            >
              {isLogin ? 'Create a new account instead' : 'Login to existing account'}
            </button>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-6 rounded-xl font-medium border transition-colors flex items-center justify-center gap-2"
              style={{
                color: 'var(--foreground)',
                borderColor: 'var(--color-gray-light)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' // Changed by Marisol 1/12/2026 for Dark Mode Support
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; // Changed by Marisol 1/12/2026 for Dark Mode Support
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home Page
            </button>
          </div>
        </div>

        {/* Right column - Just Logo (matching home page) */}
        <div className="flex-[9] flex justify-center items-center">
          <Image
            src="/logo vertical.png" //logo update Reymes 1/31/26
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