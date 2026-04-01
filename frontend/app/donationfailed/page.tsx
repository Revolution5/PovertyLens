// Created by Christella - 04/01/2026
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { XCircle, Home, RotateCcw, AlertTriangle } from 'lucide-react';

// added by Christella - 04/01/2026: Stripe instance used to verify the returned PaymentIntent status for failed or canceled payments.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DonationFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDark, setIsDark] = useState(false);

  // added by Christella - 04/01/2026: Message shown to donor after checking the Stripe status or reading an immediate error from the URL.
  const [message, setMessage] = useState('Your payment could not be completed.');

  // added by Christella - 04/01/2026: Prevent duplicate effect runs in dev mode.
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // added by Christella - 04/01/2026: Read immediate Stripe error message from the URL if present, otherwise verify returned PaymentIntent status.
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const verifyFailure = async () => {
      try {
        const directMessage = searchParams.get('message');
        if (directMessage) {
          setMessage(directMessage);
          return;
        }

        const clientSecret = searchParams.get('payment_intent_client_secret');
        if (!clientSecret) {
          setMessage('Your payment could not be completed.');
          return;
        }

        const stripe = await stripePromise;
        if (!stripe) {
          setMessage('Unable to load payment status.');
          return;
        }

        const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

        if (error) {
          setMessage(error.message || 'Unable to verify payment status.');
          return;
        }

        if (!paymentIntent) {
          setMessage('Could not verify payment status.');
          return;
        }

        switch (paymentIntent.status) {
          case 'requires_payment_method':
            setMessage('Your payment failed. Please try another card or payment method.');
            break;
          case 'canceled':
            setMessage('Your payment was canceled before completion.');
            break;
          case 'processing':
            setMessage('Your payment is still processing. Please wait a moment and try again if needed.');
            break;
          case 'succeeded':
            setMessage('This payment appears to have completed successfully. You can return home or donate again.');
            break;
          default:
            setMessage('Your payment could not be completed.');
        }
      } catch (err) {
        console.error(err);
        setMessage('Unable to verify payment status.');
      }
    };

    verifyFailure();
  }, [searchParams]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundColor: 'var(--background)',
      }}
    >
      <div
        className="w-full max-w-lg text-center rounded-2xl p-10"
        style={{
          border: '1px solid var(--color-gray-light)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* added by Christella - 04/01/2026: Failure status icon */}
        <div
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' }}
        >
          <XCircle className="w-12 h-12 text-white" />
        </div>

        <h1
          className="text-4xl font-bold mb-3"
          style={{ color: 'var(--foreground)' }}
        >
          Payment Failed
        </h1>

        <div
          style={{
            height: 4,
            width: 80,
            borderRadius: 'var(--radius-full)',
            margin: '0 auto 24px',
          }}
        />

        <p
          className="text-lg mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          {message}
        </p>

        {/* added by Christella - 04/01/2026: Helpful retry reminder */}
        <div
          className="rounded-xl p-4 mb-8 flex items-center gap-3"
          style={{
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2',
            border: '1px solid rgba(239, 68, 68, 0.35)',
          }}
        >
          <p className="text-sm text-left" style={{ color: 'var(--color-gray-dark)' }}>
            In Stripe test mode, certain test card numbers are designed to simulate declines or
            other payment failures.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              border: '1px solid var(--color-gray-light)',
              color: 'var(--foreground)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--background)';
            }}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>

          <button
            onClick={() => router.push('/PLdonation')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}