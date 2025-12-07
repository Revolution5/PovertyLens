'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
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
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! ${data.message}`);
        // Store user email
        localStorage.setItem('userEmail', email)

        // Redirect to home page after successful login/signup
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('🚨 Error connecting to server. Check if backend is running.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '30px',
      border: '1px solid #f8f6f6ff',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(5, 5, 5, 0.1)',
      backgroundColor: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#000000ff' }}>
        {isLogin ? 'Welcome Back!' : 'Create Account'}
      </h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: "#222" }}>
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
              padding: '12px',
              border: '1px solid #0a0a0aff',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box',
              color: '#222'
            }}
          />
        </div>
        
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: "#222" }}>
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
              padding: '12px',
              border: '1px solid #0f0f0fff',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box',
              color: '#0a0a0aff'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '12px', 
            backgroundColor: isLoading ? '#000000ff' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      
      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: message.includes('Error') || message.includes('🚨') ? '#ecaaaaff' : '#f0ececff',
          borderRadius: '6px',
          border: message.includes('Error') || message.includes('🚨') ? '1px solid #ecaaaaff' : '1px solid #4caf50',
          color: message.includes('Error') || message.includes('🚨') ? '#050505ff' : '#2e7d32'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '25px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #1a1919ff' }}>
        <p style={{ color: '#0f0f0fff', marginBottom: '10px' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
            setEmail('');
            setPassword('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#0070f3',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          {isLogin ? 'Create a new account' : 'Login to existing account'}
        </button>
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666'
          }}
        >
          ← Back to Home Page
        </button>
      </div>
    </div>
  );
}