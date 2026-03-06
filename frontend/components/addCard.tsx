// Marisol Morales Code 2/22/2026,  AddCardPage.tsx
// Created to match PovertyLens project conventions
// Compatible with ThemeProvider (Marisol Morales, 1/9/2026)

'use client';

import { useState } from 'react';
import { CreditCard, KeyRound, CheckCircle, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface CardFormData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

interface AddCardPageProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function AddCardPage({ onClose, onSuccess }: AddCardPageProps) {
  // ============== Use project ThemeProvider instead of MutationObserver ==============
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // ============== End Theme ==============

  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<Partial<CardFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return (cleaned.match(/.{1,4}/g)?.join(' ') || cleaned).substring(0, 19);
  };

  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 2
      ? cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
      : cleaned;
  };

  const handleChange = (field: keyof CardFormData, value: string) => {
    let formatted = value;
    if (field === 'cardNumber') formatted = formatCardNumber(value);
    else if (field === 'expiryDate') formatted = formatExpiry(value);
    else if (field === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 4);

    setFormData(prev => ({ ...prev, [field]: formatted }));

    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {};

    const digits = formData.cardNumber.replace(/\s/g, '');
    if (!digits) newErrors.cardNumber = 'Card number is required';
    else if (digits.length !== 16) newErrors.cardNumber = 'Must be 16 digits';

    if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
    else if (formData.cardName.trim().length < 3) newErrors.cardName = 'Name must be at least 3 characters';

    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    else if (formData.expiryDate.length !== 5) newErrors.expiryDate = 'Enter as MM/YY';
    else {
      const month = parseInt(formData.expiryDate.split('/')[0]);
      if (month < 1 || month > 12) newErrors.expiryDate = 'Invalid month';
    }

    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    else if (formData.cvv.length < 3) newErrors.cvv = 'Must be 3–4 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call - no actual card data is stored
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Mock card added (not stored):', {
      lastFour: formData.cardNumber.slice(-4),
      cardName: formData.cardName,
      expiryDate: formData.expiryDate,
    });

    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
      onSuccess?.();
    }, 2000);
  };

  // Shared input style , matches profile page inputs
  const inputStyle = (hasError: boolean) => ({
    backgroundColor: 'var(--background)',
    borderColor: hasError ? '#EF4444' : 'var(--color-gray-light)',
    color: 'var(--foreground)',
  });

  // Shared hover style , matches profile page row hovers
  const rowHoverHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.backgroundColor = isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.02)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.backgroundColor = 'transparent';
    },
  };

  return (
    <div
      className="rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Header — matches Security section header pattern */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8CE4FF] to-[#FFA239] flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Add Payment Card
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
            Securely add your card for donations
          </p>
        </div>
      </div>

      <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }} />

      {/* Success state */}
      {showSuccess && (
        <div
          className="flex items-center gap-3 p-4 rounded-lg mb-6"
          style={{
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#ECFDF5',
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#10B981'}`,
          }}
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Card Added Successfully!
            </p>
            <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
              Card ending in {formData.cardNumber.slice(-4)} has been saved.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Card Number
          </label>
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => handleChange('cardNumber', e.target.value)}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
            style={inputStyle(!!errors.cardNumber)}
          />
          {errors.cardNumber && (
            <p className="text-xs mt-1 text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Cardholder Name
          </label>
          <input
            type="text"
            value={formData.cardName}
            onChange={(e) => handleChange('cardName', e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
            style={inputStyle(!!errors.cardName)}
          />
          {errors.cardName && (
            <p className="text-xs mt-1 text-red-500">{errors.cardName}</p>
          )}
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Expiry Date
            </label>
            <input
              type="text"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              placeholder="MM/YY"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
              style={inputStyle(!!errors.expiryDate)}
            />
            {errors.expiryDate && (
              <p className="text-xs mt-1 text-red-500">{errors.expiryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              CVV
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => handleChange('cvv', e.target.value)}
              placeholder="123"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
              style={inputStyle(!!errors.cvv)}
            />
            {errors.cvv && (
              <p className="text-xs mt-1 text-red-500">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Buttons — matches Cancel/Save pattern from profile modals */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg transition-colors font-medium"
            style={{
              borderColor: 'var(--color-gray-light)',
              color: isDark ? '#e5e5e5' : '#374151',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)';
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || showSuccess}
            className="flex-1 px-4 py-2 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#8CE4FF', color: '#1a1a1a' }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = '#6DD5FF';
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = '#8CE4FF';
            }}
          >
            {isSubmitting ? 'Adding Card...' : showSuccess ? 'Card Added!' : 'Add Card'}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center mt-2" style={{ color: 'var(--color-gray)' }}>
          This is a demonstration only. No card data is stored or processed.
        </p>
      </form>
    </div>
  );
}