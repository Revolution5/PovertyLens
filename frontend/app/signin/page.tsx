'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      background: 'white',
      padding: '40px 20px 20px 20px',
      paddingTop: '80px'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        padding: '40px',
        border: '1px solid #D9D1B7',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#D9D1B7'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          color: '#623100',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: "#623100" }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
                style={{ 
                  width: '100%', 
                  padding: '14px',
                  border: '1px solid #8B4513',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  color: '#623100',
                  backgroundColor: '#F5F0E6',
                  outline: 'none'
                }}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: "#623100" }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{ 
                width: '100%', 
                padding: '14px',
                border: '1px solid #8B4513',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#623100',
                backgroundColor: '#F5F0E6',
                outline: 'none'
              }}
            />
          </div>
          
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: "#623100" }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{ 
                width: '100%', 
                padding: '14px',
                border: '1px solid #8B4513',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#623100',
                backgroundColor: '#F5F0E6',
                outline: 'none'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              padding: '14px', 
              backgroundColor: isLoading ? '#8B4513' : '#623100', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s',
              marginTop: '10px'
            }}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        
        {message && (
          <div style={{ 
            marginTop: '20px', 
            padding: '14px', 
            backgroundColor: '#C8AB8F',
            borderRadius: '10px',
            border: '1px solid #8B4513',
            color: '#623100',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}
        
        <div style={{ marginTop: '25px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #8B4513' }}>
          <p style={{ color: '#623100', marginBottom: '10px', fontWeight: '500' }}>
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
            style={{
              background: 'none',
              border: 'none',
              color: '#623100',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              padding: '5px'
            }}
          >
            {isLogin ? 'Create a new account' : 'Login to existing account'}
          </button>
        </div>
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#C8AB8F',
              border: '1px solid #8B4513',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#623100',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              width: '100%'
            }}
          >
            ← Back to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}