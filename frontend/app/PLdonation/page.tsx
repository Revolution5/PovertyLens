// Created by Christella - 02/04/2026
'use client';

import { useState, useEffect } from 'react';
import { Heart, Gift, Users, Sparkles, Check, ArrowRight } from 'lucide-react';
// ===== Addition by Christella - 03/03/2026 =====
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
// ===== End of Addition by Christella - 03/03/2026 =====

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

// ===== Addition by Christella - 03/03/2026 =====
// Load Stripe with publishable key from environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
// ===== End of Addition by Christella - 03/03/2026 =====

// ===== Addition by Christella - 03/03/2026 =====
// Inner form component that uses Stripe hooks - must be inside <Elements> provider
function StripePaymentForm({
  amount,
  isMonthly,
  formData,
  isDark,
  onSuccess,
}: {
  amount: number;
  isMonthly: boolean;
  formData: { name: string; email: string; message: string };
  isDark: boolean;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!stripe || !elements) return;

    // Basic client-side validation
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Please enter your name and email.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Ask backend to create a Stripe PaymentIntent and return the clientSecret
      const res = await fetch(`${API_BASE}/api/donations/create-payment-intent`, {
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
        setErrorMessage(data.message || 'Payment setup failed. Please try again.');
        return;
      }

      // Step 2a: Submit Elements form first (required by Stripe before confirmPayment)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'Please check your card details.');
        return;
      }

      // Step 2b: Confirm the payment using the clientSecret from Stripe
      // redirect: 'if_required' keeps card payments on the page instead of redirecting
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/donationsuccess`,
          payment_method_data: {
            billing_details: {
              name: formData.name,
              email: formData.email,
            },
          },
        },
        redirect: 'if_required',
      });

      // If confirmPayment returns an error
      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please try again.');
      } else {
        // Card payment succeeded without redirect - trigger success screen
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Stripe's PaymentElement renders the card input fields securely */}
      <div className="mb-6">
        <label className="block text-lg mb-3" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
          Payment Details
        </label>
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
            borderColor: 'var(--color-gray-light)',
          }}
        >
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
        {/* Test mode helper text */}
        <p className="text-xs mt-2" style={{ color: 'var(--color-gray)' }}>
          🧪 Test mode: use card <strong>4242 4242 4242 4242</strong>, any future date, any CVC.
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
        >
          {errorMessage}
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || !stripe || !elements}
        className="w-full py-4 rounded-xl flex items-center justify-center gap-2 group hover:shadow-xl transition-all"
        style={{
          background: 'var(--gradient-orange-red)',
          color: 'white',
          fontWeight: 600,
          fontSize: '1.125rem',
          opacity: isSubmitting || !stripe ? 0.8 : 1,
          cursor: isSubmitting || !stripe ? 'not-allowed' : 'pointer',
        }}
      >
        <Heart className="w-5 h-5" />
        {isSubmitting ? 'Processing...' : `Donate $${amount}`}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="text-center text-sm mt-4" style={{ color: 'var(--color-gray)' }}>
        Your payment is securely processed by Stripe. We never store your card details.
      </p>
    </div>
  );
}
// ===== End of Addition by Christella - 03/03/2026 =====

export default function PLDonationPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // ===== Addition by Christella - 03/03/2026 =====
  // clientSecret is returned by the backend after creating a PaymentIntent
  // It is required by Stripe's Elements provider to render the payment form
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'form' | 'payment' | 'success'>('form');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState('');
  // Saves the donation amount before resetting form so success screen shows correct amount
  const [paidAmount, setPaidAmount] = useState<number>(0);
  // Saves the monthly/one-time choice before resetting so success screen shows correct label
  const [paidIsMonthly, setPaidIsMonthly] = useState(false);
  // ===== End of Addition by Christella - 03/03/2026 =====

  // Added by Marisol Morales 2/11/2026 for dark mode support - listens for changes to the document's class list to detect theme changes
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);
  // End of dark mode support code

  // Update inputs by name
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ===== Addition by Christella - 03/03/2026 =====
  // Step 1: Validate form and create a PaymentIntent on the backend
  // This gives us the clientSecret needed to render Stripe's PaymentElement
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntentError('');

    const amount = selectedAmount === null ? Number(customAmount) : Number(selectedAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setIntentError('Please enter a valid donation amount.');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim()) {
      setIntentError('Please enter your name and email.');
      return;
    }

    try {
      setIsCreatingIntent(true);

      const res = await fetch(`${API_BASE}/api/donations/create-payment-intent`, {
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
        setIntentError(data.message || 'Could not set up payment. Please try again.');
        return;
      }

      // Store clientSecret and move to payment step
      setClientSecret(data.clientSecret);
      setPaymentStep('payment');
    } catch (err) {
      console.error(err);
      setIntentError('Network error. Please try again.');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  // Called after successful payment - saves amount before resetting form
  const handlePaymentSuccess = () => {
    setPaidAmount(donationAmount); // Save before resetting so success screen shows correct value
    setPaidIsMonthly(isMonthly); // Save before resetting so success screen shows correct label
    setPaymentStep('success');
    setSelectedAmount(100);
    setCustomAmount('');
    setIsMonthly(false);
    setFormData({ name: '', email: '', message: '' });
    setClientSecret(null);
  };

  // Derive the actual donation amount for display
  const donationAmount = selectedAmount === null ? Number(customAmount) : Number(selectedAmount);
  // ===== End of Addition by Christella - 03/03/2026 =====

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-12">
          <div className="text-center">

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl mb-6"
              style={{ fontWeight: 700, lineHeight: 1.2, color: 'var(--foreground)' }}
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
                background: 'var(--background)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-gray-light)',
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
                  <div className="text-2xl" style={{ fontWeight: 700, color: 'var(--foreground)' }}>
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
        <div 
          className="card" 
          style={{ 
            boxShadow: 'var(--shadow-xl)', 
            background: 'var(--background)',
            border: '1px solid var(--color-gray-light)',
          }}
        >
          {/* ===== Addition by Christella - 03/03/2026 ===== */}
          {/* Success screen shown after payment completes */}
          {paymentStep === 'success' ? (
            <div className="text-center py-12">
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--gradient-orange-red)' }}
              >
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                Thank You!
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--color-gray)' }}>
                Your {paidIsMonthly ? 'monthly' : 'one-time'} donation of{' '}
                <strong>${paidAmount}</strong> is being processed.
              </p>
              <button
                onClick={() => setPaymentStep('form')}
                className="px-6 py-3 rounded-xl font-semibold"
                style={{ background: 'var(--gradient-cyan-yellow)', color: '#000' }}
              >
                Make Another Donation
              </button>
            </div>

          ) : paymentStep === 'payment' && clientSecret ? (
            // Payment step: Stripe Elements renders the card input
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setPaymentStep('form'); setClientSecret(null); }}
                  className="text-sm underline"
                  style={{ color: 'var(--color-gray)' }}
                >
                  ← Back
                </button>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                  Complete Your ${donationAmount} Donation
                </h2>
              </div>

              {/* Elements provider scopes Stripe context to just this section */}
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: isDark ? 'night' : 'stripe',
                    variables: {
                      colorPrimary: '#FFA239',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <StripePaymentForm
                  amount={donationAmount}
                  isMonthly={isMonthly}
                  formData={formData}
                  isDark={isDark}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          // ===== End of Addition by Christella - 03/03/2026 =====

          ) : (
            // Submit donation to backend logging endpoint
            <form onSubmit={handleProceedToPayment}>
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
                      color: !isMonthly ? (isDark ? '#000' : '#000') : 'var(--foreground)',
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
                      color: isMonthly ? 'white' : 'var(--foreground)',
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
                <label className="block text-lg mb-4" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
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
                        background: 'var(--background)',
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
                      <div className="text-3xl mb-2" style={{ fontWeight: 700, color: 'var(--foreground)' }}>
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
                        color: 'var(--foreground)',
                      }}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Donor info */}
              <div className="space-y-4 mb-8">
                <h3 className="text-lg" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
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
                      color: 'var(--foreground)',
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
                      color: 'var(--foreground)',
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
                      color: 'var(--foreground)',
                    }}
                    placeholder="Share your reason for giving..."
                  />
                </div>
              </div>

              {/* ===== Addition by Christella - 03/03/2026 ===== */}
              {/* Error message shown if payment intent creation fails */}
              {intentError && (
                <div
                  className="mb-4 p-3 rounded-lg text-sm"
                  style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                >
                  {intentError}
                </div>
              )}
              {/* ===== End of Addition by Christella - 03/03/2026 ===== */}

              {/* Submit */}
              <button
                type="submit"
                disabled={isCreatingIntent}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 group hover:shadow-xl transition-all"
                style={{
                  background: 'var(--gradient-orange-red)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  opacity: isCreatingIntent ? 0.8 : 1,
                  cursor: isCreatingIntent ? 'not-allowed' : 'pointer',
                }}
              >
                <Heart className="w-5 h-5" />
                {isCreatingIntent ? 'Setting up payment...' : 'Continue to Payment'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-sm mt-4" style={{ color: 'var(--color-gray)' }}>
                Your donation is securely logged. You&apos;ll receive a confirmation message on-screen.
              </p>
            </form>
          )}
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
            <h4 style={{ fontWeight: 600, color: 'var(--foreground)' }}>100% Secure</h4>
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
            <h4 style={{ fontWeight: 600, color: 'var(--foreground)' }}>Trusted by Thousands</h4>
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
            <h4 style={{ fontWeight: 600, color: 'var(--foreground)' }}>Maximum Impact</h4>
            <p className="text-sm mt-1" style={{ color: 'var(--color-gray)' }}>
              95% goes to programs
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}