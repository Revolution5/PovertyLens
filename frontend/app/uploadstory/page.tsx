'use client';

import { useState } from "react";
import { FileText } from 'lucide-react';
const BACKEND_URL = 'http://localhost:4000';

const COUNTRY_OPTIONS = [
  { code: '', name: 'Select a country (optional)' },
  { code: 'USA', name: 'United States' },
  { code: 'CAN', name: 'Canada' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'FRA', name: 'France' },
  { code: 'DEU', name: 'Germany' }
];

const colorSchemes = [
  { bg: "#E5F8FF", accent: "#8CE4FF", name: "Ocean" },
  { bg: "#FFFCEB", accent: "#F5D547", name: "Sunshine" },
  { bg: "#FFE8D6", accent: "#FFA239", name: "Sunset" },
  { bg: "#FFE5E5", accent: "#FF5656", name: "Rose" }
];

const sharedInputStyle = {
    width: '100%',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    outline: 'none',
    backgroundColor:'#ffffff',
    boxSizing: 'border-box' as const,
};

export default function UploadStoryPage() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [country, setCountry] = useState('');
  const [displayName, setDisplayName] = useState(true);
  const [displayPhoto, setDisplayPhoto] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState(0);

  const bgColor = colorSchemes[colorScheme].bg;
  const accentColor = colorSchemes[colorScheme].accent;

  const wordCount = story.trim() ? story.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!title.trim()){
        setMessage('Please enter a story title.');
        return;
    }

    if (!story.trim()) {
      setMessage('Please write a story before uploading.');
      return;
    }
    if (wordCount > 7000) {
      setMessage('Unable to upload: your story is over 7,000 words.');
      return;
    }
    try {
      setIsSubmitting(true);
      const userEmail =
        typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

      const res = await fetch(`${BACKEND_URL}/api/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          storyText: story,
          displayName,
          displayPhoto,
          userEmail,
          country,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.message || 'Error: could not upload story.');
        return;
      }

      setMessage('Story uploaded successfully!');

      // Resets form
      setTitle('');
      setStory('');
      setCountry('');
      setDisplayName(true);
      setDisplayPhoto(true);
    } catch (err) {
      console.error(err);
      setMessage('Error: could not connect to server while uploading story.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    setStory('');
    setCountry('');
    setDisplayName(true);
    setDisplayPhoto(true);
    setMessage(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '896px',
          backgroundColor: bgColor,
          borderRadius: '12px',
          boxShadow: `0 20px 60px -10px ${accentColor}40`,
          transition: 'all 0.5s',
        }}
      >
        {/* Header */}
        <div style={{ padding: '32px 32px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText
                size={32}
                strokeWidth={2}
                color={accentColor}
              />
              <h1
                style={{
                  fontSize: '30px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#0f172a',
                }}
              >
                Share Your Story
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {colorSchemes.map((scheme, index) => (
                <button
                  key={scheme.name}
                  type="button"
                  onClick={() => setColorScheme(index)}
                  title={scheme.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: colorScheme === index ? '2px solid #000' : '2px solid transparent',
                    backgroundColor: scheme.accent,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ))}
            </div>
          </div>
          <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
            Tell us your story and share it with the world
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px' }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="title"
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  color: '#0f172a',
                }}
              >
                Story Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter your story title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  ...sharedInputStyle,
                  height: '48px',
                  padding: '0 16px',
                }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />
            </div>

            {/* Country */}
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="country"
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  color: '#0f172a',
                }}
              >
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{
                  ...sharedInputStyle,
                  height: '48px',
                  padding: '0 16px',
                  cursor: 'pointer',
                }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code || 'none'} value={c.code}>
                    {c.code ? `${c.name} (${c.code})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Story */}
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="story"
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  color: '#0f172a',
                }}
              >
                Your Story
              </label>
              <textarea
                id="story"
                placeholder="Write your story (max. 7,000 words)"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={12}
                style={{
                  ...sharedInputStyle,
                  padding: '16px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />
              <p
                style={{
                  fontSize: '14px',
                  color: wordCount > 7000 ? '#b00020' : '#6b7280',
                  marginTop: '8px',
                  marginBottom: 0,
                }}
              >
                {wordCount} / 7,000 words
              </p>
            </div>

            {/* Toggles */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '48px',
                margin: '32px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label
                  htmlFor="displayName"
                  style={{ fontSize: '16px', cursor: 'pointer', color: '#0f172a' }}
                >
                  Display name?
                </label>
                <ToggleSwitch
                  id="displayName"
                  checked={displayName}
                  onChange={() => setDisplayName((v) => !v)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label
                  htmlFor="displayPhoto"
                  style={{ fontSize: '16px', cursor: 'pointer', color: '#0f172a' }}
                >
                  Display photo?
                </label>
                <ToggleSwitch
                  id="displayPhoto"
                  checked={displayPhoto}
                  onChange={() => setDisplayPhoto((v) => !v)}
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
                  color: message.includes('success') ? '#155724' : '#721c24',
                }}
              >
                {message}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: accentColor,
                  color: '#ffffff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.opacity = '1')}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Story'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Toggle switch component
function ToggleSwitch({
  id,
  checked,
  onChange,
}: {
  id?: string;
  checked: boolean;
  onChange: () => void;
}) {
  const trackColor = checked ? '#00c853' : '#cccccc';
  return (
    <button
      id={id}
      type="button"
      onClick={onChange}
      style={{
        width: 46,
        height: 24,
        borderRadius: 9999,
        border: 'none',
        padding: 2,
        backgroundColor: trackColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}