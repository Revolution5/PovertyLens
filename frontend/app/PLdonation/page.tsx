// Created by Christella - 02/04/2026
'use client';

import { useState } from 'react';
import { Heart, Gift, Users, Sparkles, Check, ArrowRight } from 'lucide-react';

// Quick-select buttons
const donationAmounts = [
  { amount: 25, color: 'cyan', impact: 'Provides meals for a family' },
  { amount: 50, color: 'yellow', impact: 'Supports educational programs' },
  { amount: 100, color: 'orange', impact: 'Funds medical supplies' },
  { amount: 250, color: 'red', impact: 'Sponsors a child for a month' },
];

// Temporary display-only stats - will implement counters later
const impactStats = [
  { icon: Heart, value: '10,000+', label: 'Lives Impacted', gradient: 'cyan-yellow' },
  { icon: Gift, value: '$250K', label: 'Raised This Year', gradient: 'orange-red' },
  { icon: Users, value: '5,000+', label: 'Active Donors', gradient: 'cyan-yellow' },
  { icon: Sparkles, value: '50+', label: 'Communities Served', gradient: 'orange-red' },
];

// Backend base URL 
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function PLDonationPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Update inputs by name
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit donation to backend logging endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = selectedAmount === null ? Number(customAmount) : Number(selectedAmount);

    // Basic client-side validation
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please enter your name and email.');
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE}/api/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          isMonthly,
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || 'Donation failed. Please try again.');
        return;
      }

      alert(`Thank you for your ${isMonthly ? 'monthly' : 'one-time'} donation of $${amount}!`);

      // Reset form
      setSelectedAmount(100);
      setCustomAmount('');
      setIsMonthly(false);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#ffffff'}}>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-12">
          <div className="text-center">

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl mb-6"
              style={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              Your Generosity{' '}
              <span
                style={{
                  background: 'var(--gradient-orange-red)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Changes Lives
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--color-gray)' }}
            >
              Join thousands of donors making a real impact in communities around the world. Every
              contribution matters.
            </p>
          </div>
        </div>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {impactStats.map((stat, index) => (
            <div
              key={index}
              className="card"
              style={{
                background: 'white',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `var(--gradient-${stat.gradient})`,
                  }}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-2xl" style={{ fontWeight: 700 }}>
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Donation Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)', background: 'white' }}>
          <form onSubmit={handleSubmit}>
            {/* One-time vs Monthly */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-full p-1" style={{ background: 'var(--color-gray-light)' }}>
                <button
                  type="button"
                  onClick={() => setIsMonthly(false)}
                  className="px-6 py-2 rounded-full transition-all"
                  style={{
                    background: !isMonthly ? 'var(--gradient-cyan-yellow)' : 'transparent',
                    fontWeight: 600,
                    boxShadow: !isMonthly ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  One-time
                </button>
                <button
                  type="button"
                  onClick={() => setIsMonthly(true)}
                  className="px-6 py-2 rounded-full transition-all"
                  style={{
                    background: isMonthly ? 'var(--gradient-orange-red)' : 'transparent',
                    color: isMonthly ? 'white' : 'inherit',
                    fontWeight: 600,
                    boxShadow: isMonthly ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Amount selection */}
            <div className="mb-8">
              <label className="block text-lg mb-4" style={{ fontWeight: 600 }}>
                Select Amount
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {donationAmounts.map(option => (
                  <button
                    key={option.amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(option.amount);
                      setCustomAmount('');
                    }}
                    className="card relative overflow-hidden group"
                    style={{
                      borderColor:
                        selectedAmount === option.amount ? `var(--color-${option.color})` : 'transparent',
                      borderWidth: '2px',
                      padding: '1.5rem 1rem',
                      boxShadow: selectedAmount === option.amount ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                      transform: selectedAmount === option.amount ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {selectedAmount === option.amount && (
                      <div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: `var(--color-${option.color})` }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-3xl mb-2" style={{ fontWeight: 700 }}>
                      ${option.amount}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-gray)' }}>
                      {option.impact}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mt-4">
                <label className="block text-sm mb-2" style={{ color: 'var(--color-gray)' }}>
                  Or enter custom amount
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg"
                    style={{ color: 'var(--color-gray)' }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-transparent focus:border-opacity-100 transition-all"
                    style={{
                      background: 'var(--color-gray-light)',
                      borderColor: customAmount ? 'var(--color-cyan)' : 'transparent',
                    }}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Donor info */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg" style={{ fontWeight: 600 }}>
                Your Information
              </h3>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-gray)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-transparent focus:border-opacity-100 transition-all"
                  style={{
                    background: 'var(--color-gray-light)',
                    borderColor: formData.name ? 'var(--color-cyan)' : 'transparent',
                  }}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-gray)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-transparent focus:border-opacity-100 transition-all"
                  style={{
                    background: 'var(--color-gray-light)',
                    borderColor: formData.email ? 'var(--color-cyan)' : 'transparent',
                  }}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-gray)' }}>
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-transparent focus:border-opacity-100 transition-all resize-none"
                  style={{
                    background: 'var(--color-gray-light)',
                    borderColor: formData.message ? 'var(--color-cyan)' : 'transparent',
                  }}
                  placeholder="Share your reason for giving..."
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 group hover:shadow-xl transition-all"
              style={{
                background: 'var(--gradient-orange-red)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.125rem',
                opacity: isSubmitting ? 0.8 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Heart className="w-5 h-5" />
              {isSubmitting ? 'Submitting...' : 'Complete Donation'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-sm mt-4" style={{ color: 'var(--color-gray)' }}>
              Your donation is securely logged. You&apos;ll receive a confirmation message on-screen.
            </p>
          </form>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gradient-cyan-yellow)' }}
            >
              <Check className="w-6 h-6 text-white" />
            </div>
            <h4 style={{ fontWeight: 600 }}>100% Secure</h4>
            <p className="text-sm mt-1" style={{ color: 'var(--color-gray)' }}>
              Bank-level encryption
            </p>
          </div>

          <div>
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gradient-cyan-yellow)' }}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 style={{ fontWeight: 600 }}>Trusted by Thousands</h4>
            <p className="text-sm mt-1" style={{ color: 'var(--color-gray)' }}>
              5,000+ active supporters
            </p>
          </div>

          <div>
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gradient-cyan-yellow)' }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 style={{ fontWeight: 600 }}>Maximum Impact</h4>
            <p className="text-sm mt-1" style={{ color: 'var(--color-gray)' }}>
              95% goes to programs
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}