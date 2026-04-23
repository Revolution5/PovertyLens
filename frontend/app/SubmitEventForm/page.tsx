// Created by Christella - 04/14/2026
'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Send, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const EVENT_TYPES = ['Awareness Day', 'Volunteering', 'Fundraiser', 'Conference', 'Campaign'];

type FormState = {
  title: string;
  description: string;
  date: string;
  type: string;
  location: string;
  sourceUrl: string;
  sourceLabel: string;
  submittedBy: string;
  submittedEmail: string;
};

type FormErrors = {
  title: string;
  description: string;
  date: string;
  type: string;
  sourceUrl: string;
  submittedEmail: string;
};

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  date: '',
  type: '',
  location: '',
  sourceUrl: '',
  sourceLabel: '',
  submittedBy: '',
  submittedEmail: '',
};

const EMPTY_ERRORS: FormErrors = {
  title: '',
  description: '',
  date: '',
  type: '',
  sourceUrl: '',
  submittedEmail: '',
};

export default function SubmitEventForm() {
  const [isDark, setIsDark] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error as user edits
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear general error when user makes a change
    if (error) setError('');
  };

  const validateForm = () => {
    const newErrors: FormErrors = { ...EMPTY_ERRORS };
    let isValid = true;

    if (!form.title.trim()) {
      newErrors.title = 'Event title is required.';
      isValid = false;
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required.';
      isValid = false;
    } else if (form.description.trim().length < 20) {
      newErrors.description = 'Description should be at least 20 characters.';
      isValid = false;
    }

    if (!form.date) {
      newErrors.date = 'Date is required.';
      isValid = false;
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past.';
        isValid = false;
      }
    }

    if (!form.type) {
      newErrors.type = 'Please select an event type.';
      isValid = false;
    }

    if (!form.sourceUrl.trim()) {
      newErrors.sourceUrl = 'Source URL is required.';
      isValid = false;
    } else {
      try {
        const url = new URL(form.sourceUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.sourceUrl = 'Enter a valid URL starting with http or https.';
          isValid = false;
        }
      } catch {
        newErrors.sourceUrl = 'Enter a valid URL.';
        isValid = false;
      }
    }

    if (!form.submittedEmail.trim()) {
      newErrors.submittedEmail = 'Email is required so we can follow up with you.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submittedEmail)) {
      newErrors.submittedEmail = 'Enter a valid email address.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const res = await fetch(`${BACKEND_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Error submitting event. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (filled: boolean, hasError = false) => ({
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
    border: `1.5px solid ${
      hasError
        ? '#FF5656'
        : filled
        ? 'var(--color-cyan)'
        : isDark
        ? 'rgba(255,255,255,0.1)'
        : '#e0e0e0'
    }`,
    color: isDark ? '#ffffff' : '#000000',
    outline: 'none',
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
  });

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
            border: '1px solid var(--color-gray-light)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--gradient-orange-red)' }}
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Event Submitted!
          </h3>

          <p className="text-sm mb-6" style={{ color: 'var(--color-gray)' }}>
            Thank you for submitting. Our team will review your event and follow up using the
            email you provided if needed.
          </p>

          <button
            onClick={() => {
              setSubmitted(false);
              setForm(EMPTY_FORM);
              setErrors(EMPTY_ERRORS);
              setError('');
            }}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--gradient-orange-red)', color: 'white' }}
          >
            Submit Another Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          Submit Event
        </h1>
        <div
          className="mt-3 h-1 w-20 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #8CE4FF, #FFA239)',
          }}
        />
      </div>

      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
          border: '1px solid var(--color-gray-light)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Verification notice */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{
            background: isDark ? 'rgba(140,228,255,0.08)' : 'rgba(140,228,255,0.12)',
            border: '1px solid rgba(140,228,255,0.3)',
          }}
        >
          <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8CE4FF' }} />
          <p style={{ color: 'var(--color-gray)' }}>
            A <strong style={{ color: 'var(--foreground)' }}>source URL</strong> is required. Our
            team will verify it links to a legitimate event page before approval. Please include an
            email so we can follow up if needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
              Event Title <span style={{ color: '#FF5656' }}>*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. World Food Day 2026"
              style={inputStyle(!!form.title, !!errors.title)}
            />
            {errors.title && (
              <p className="mt-1 text-xs" style={{ color: '#FF5656' }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
              Description <span style={{ color: '#FF5656' }}>*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the event and its purpose..."
              rows={3}
              style={{ ...inputStyle(!!form.description, !!errors.description), resize: 'none' }}
            />
            {errors.description && (
              <p className="mt-1 text-xs" style={{ color: '#FF5656' }}>
                {errors.description}
              </p>
            )}
          </div>

          {/* Date + Type row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
                Date <span style={{ color: '#FF5656' }}>*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={inputStyle(!!form.date, !!errors.date)}
              />
              {errors.date && (
                <p className="mt-1 text-xs" style={{ color: '#FF5656' }}>
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
                Event Type <span style={{ color: '#FF5656' }}>*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={{ ...inputStyle(!!form.type, !!errors.type), cursor: 'pointer' }}
              >
                <option 
                  value=""
                  style={{
                    color: isDark ? '#ffffff' : '#000000',
                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  }}
                  >Select a type...</option>
                {EVENT_TYPES.map(t => (
                  <option key={t} value={t} style={{
                    color: isDark ? '#ffffff' : '#000000',
                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  }}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-xs" style={{ color: '#FF5656' }}>
                  {errors.type}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. New York, USA or Global"
              style={inputStyle(!!form.location)}
            />
          </div>

          {/* Source URL + label row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
                Source URL <span style={{ color: '#FF5656' }}>*</span>
              </label>
              <input
                name="sourceUrl"
                value={form.sourceUrl}
                onChange={handleChange}
                placeholder="https://..."
                style={inputStyle(!!form.sourceUrl, !!errors.sourceUrl)}
              />
              {errors.sourceUrl && (
                <p className="mt-1 text-xs" style={{ color: '#FF5656' }}>
                  {errors.sourceUrl}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
                Source Name
              </label>
              <input
                name="sourceLabel"
                value={form.sourceLabel}
                onChange={handleChange}
                placeholder="e.g. United Nations"
                style={inputStyle(!!form.sourceLabel)}
              />
            </div>
          </div>

          {/* Your name + email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
                Your Name
              </label>
              <input
                name="submittedBy"
                value={form.submittedBy}
                onChange={handleChange}
                placeholder="Jane Doe"
                style={inputStyle(!!form.submittedBy)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-gray)' }}>
                Your Email <span style={{ color: '#FF5656' }}>*</span>
              </label>
              <input
                type="email"
                name="submittedEmail"
                value={form.submittedEmail}
                onChange={handleChange}
                placeholder="jane@example.com"
                style={inputStyle(!!form.submittedEmail, !!errors.submittedEmail)}
              />
              {errors.submittedEmail && (
                <p className="mt-1 text-xs" style={{ color: '#FF5656' }}>
                  {errors.submittedEmail}
                </p>
              )}
            </div>
          </div>

          {/* General error */}
          {error && (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                background: isDark ? 'rgba(239,68,68,0.15)' : '#ffebee',
                border: `1px solid ${isDark ? 'rgba(239,68,68,0.4)' : '#ef5350'}`,
                color: isDark ? '#fca5a5' : '#b91c1c',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'var(--gradient-orange-red)',
              color: 'white',
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}