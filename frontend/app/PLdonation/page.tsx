'use client';

import { useState, useEffect } from 'react';
import { Heart, Gift, Users, Sparkles, Check, ArrowRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Edited by Christella - 03/24/2026: Inlined CurrencyCalculator from '@/components/currencycalculator'
// instead of importing it, so the full page is self-contained.
// Original component authored by daniel q. 3/20/26 (see edited block below).

// edited - daniel q. 3/20/26 start
const countryNames: Record<string, string> = {
  // AFRICA
  DZA: "Algeria",
  AGO: "Angola",
  BEN: "Benin",
  BWA: "Botswana",
  BFA: "Burkina Faso",
  BDI: "Burundi",
  CMR: "Cameroon",
  CAF: "Central African Republic",
  TCD: "Chad",
  COG: "Congo",
  COD: "Democratic Republic of the Congo",
  CIV: "Côte d'Ivoire",
  EGY: "Egypt",
  ETH: "Ethiopia",
  SWZ: "Eswatini",
  GAB: "Gabon",
  GMB: "Gambia",
  GHA: "Ghana",
  GIN: "Guinea",
  KEN: "Kenya",
  LSO: "Lesotho",
  LBR: "Liberia",
  MDG: "Madagascar",
  MWI: "Malawi",
  MLI: "Mali",
  MRT: "Mauritania",
  MAR: "Morocco",
  MOZ: "Mozambique",
  NAM: "Namibia",
  NER: "Niger",
  NGA: "Nigeria",
  RWA: "Rwanda",
  SEN: "Senegal",
  SLE: "Sierra Leone",
  ZAF: "South Africa",
  SDN: "Sudan",
  TZA: "Tanzania",
  TGO: "Togo",
  TUN: "Tunisia",
  UGA: "Uganda",
  ZMB: "Zambia",
  ZWE: "Zimbabwe",

  // ASIA
  BGD: "Bangladesh",
  IND: "India",
  JPN: "Japan",
  KOR: "South Korea",
  CHN: "China",
  IDN: "Indonesia",
  PAK: "Pakistan",
  PHL: "Philippines",
  VNM: "Vietnam",
  THA: "Thailand",
  MMR: "Myanmar",
  KHM: "Cambodia",
  LAO: "Laos",
  NPL: "Nepal",
  LKA: "Sri Lanka",
  KAZ: "Kazakhstan",
  UZB: "Uzbekistan",
  AZE: "Azerbaijan",
  GEO: "Georgia",
  ARM: "Armenia",
  IRQ: "Iraq",
  IRN: "Iran",
  SAU: "Saudi Arabia",
  ARE: "UAE",
  TUR: "Turkey",
  ISR: "Israel",
  JOR: "Jordan",
  LBN: "Lebanon",
  YEM: "Yemen",
  SYR: "Syria",
  OMN: "Oman",
  KWT: "Kuwait",
  QAT: "Qatar",
  BHR: "Bahrain",
  AFG: "Afghanistan",
  MNG: "Mongolia",

  // EUROPE
  AUT: "Austria",
  BEL: "Belgium",
  FRA: "France",
  DEU: "Germany",
  ITA: "Italy",
  NLD: "Netherlands",
  NOR: "Norway",
  ESP: "Spain",
  SWE: "Sweden",
  CHE: "Switzerland",
  GBR: "United Kingdom",
  POL: "Poland",
  PRT: "Portugal",
  GRC: "Greece",
  HUN: "Hungary",
  CZE: "Czech Republic",
  ROU: "Romania",
  BGR: "Bulgaria",
  HRV: "Croatia",
  SRB: "Serbia",
  SVK: "Slovakia",
  SVN: "Slovenia",
  FIN: "Finland",
  DNK: "Denmark",
  IRL: "Ireland",
  LUX: "Luxembourg",
  EST: "Estonia",
  LVA: "Latvia",
  LTU: "Lithuania",
  ALB: "Albania",
  MKD: "North Macedonia",
  BIH: "Bosnia and Herzegovina",
  MNE: "Montenegro",
  MDA: "Moldova",
  BLR: "Belarus",
  UKR: "Ukraine",
  RUS: "Russia",

  // NORTH AMERICA
  CAN: "Canada",
  MEX: "Mexico",
  USA: "United States",
  GTM: "Guatemala",
  BLZ: "Belize",
  HND: "Honduras",
  SLV: "El Salvador",
  NIC: "Nicaragua",
  CRI: "Costa Rica",
  PAN: "Panama",
  CUB: "Cuba",
  HTI: "Haiti",
  DOM: "Dominican Republic",
  JAM: "Jamaica",
  TTO: "Trinidad and Tobago",
  BHS: "Bahamas",
  BRB: "Barbados",

  // SOUTH AMERICA
  BRA: "Brazil",
  ARG: "Argentina",
  CHL: "Chile",
  COL: "Colombia",
  PER: "Peru",
  VEN: "Venezuela",
  ECU: "Ecuador",
  BOL: "Bolivia",
  PRY: "Paraguay",
  URY: "Uruguay",
  GUY: "Guyana",
  SUR: "Suriname",

  // OCEANIA
  AUS: "Australia",
  NZL: "New Zealand",
  PNG: "Papua New Guinea",
  FJI: "Fiji",
  SLB: "Solomon Islands",
  VUT: "Vanuatu",
  WSM: "Samoa",
  TON: "Tonga",
  KIR: "Kiribati",
  FSM: "Micronesia",
};

// Map country codes to currency codes (ISO 3166-1 alpha-3 to ISO 4217)
const countryToCurrency: Record<string, string> = {
  // AFRICA
  "DZA": "DZD", "AGO": "AOA", "BEN": "XOF", "BWA": "BWP", "BFA": "XOF",
  "BDI": "BIF", "CMR": "XAF", "CAF": "XAF", "TCD": "XAF", "COG": "XAF",
  "COD": "CDF", "CIV": "XOF", "EGY": "EGP", "ETH": "ETB", "SWZ": "SZL",
  "GAB": "XAF", "GMB": "GMD", "GHA": "GHS", "GIN": "GNF", "KEN": "KES",
  "LSO": "LSL", "LBR": "LRD", "MDG": "MGA", "MWI": "MWK", "MLI": "XOF",
  "MRT": "MRU", "MAR": "MAD", "MOZ": "MZN", "NAM": "NAD", "NER": "XOF",
  "NGA": "NGN", "RWA": "RWF", "SEN": "XOF", "SLE": "SLL", "ZAF": "ZAR",
  "SDN": "SDG", "TZA": "TZS", "TGO": "XOF", "TUN": "TND", "UGA": "UGX",
  "ZMB": "ZMW", "ZWE": "ZWL",

  // ASIA
  "BGD": "BDT", "IND": "INR", "JPN": "JPY", "KOR": "KRW", "CHN": "CNY",
  "IDN": "IDR", "PAK": "PKR", "PHL": "PHP", "VNM": "VND", "THA": "THB",
  "MMR": "MMK", "KHM": "KHR", "LAO": "LAK", "NPL": "NPR", "LKA": "LKR",
  "KAZ": "KZT", "UZB": "UZS", "AZE": "AZN", "GEO": "GEL", "ARM": "AMD",
  "IRQ": "IQD", "IRN": "IRR", "SAU": "SAR", "ARE": "AED", "TUR": "TRY",
  "ISR": "ILS", "JOR": "JOD", "LBN": "LBP", "YEM": "YER", "SYR": "SYP",
  "OMN": "OMR", "KWT": "KWD", "QAT": "QAR", "BHR": "BHD", "AFG": "AFN",
  "MNG": "MNT",

  // EUROPE
  "AUT": "EUR", "BEL": "EUR", "FRA": "EUR", "DEU": "EUR", "ITA": "EUR",
  "NLD": "EUR", "ESP": "EUR", "PRT": "EUR", "GRC": "EUR", "IRL": "EUR",
  "FIN": "EUR", "EST": "EUR", "LVA": "EUR", "LTU": "EUR", "SVK": "EUR",
  "SVN": "EUR", "HRV": "EUR", "NOR": "NOK", "SWE": "SEK", "DNK": "DKK",
  "GBR": "GBP", "CHE": "CHF", "POL": "PLN", "CZE": "CZK", "HUN": "HUF",
  "ROU": "RON", "BGR": "BGN", "RUS": "RUB", "UKR": "UAH", "BLR": "BYN",
  "ALB": "ALL", "MKD": "MKD", "BIH": "BAM", "MNE": "EUR", "MDA": "MDL",

  // NORTH AMERICA
  "CAN": "CAD", "MEX": "MXN", "USA": "USD", "GTM": "GTQ", "BLZ": "BZD",
  "HND": "HNL", "SLV": "USD", "NIC": "NIO", "CRI": "CRC", "PAN": "PAB",
  "CUB": "CUP", "HTI": "HTG", "DOM": "DOP", "JAM": "JMD", "TTO": "TTD",
  "BHS": "BSD", "BRB": "BBD",

  // SOUTH AMERICA
  "BRA": "BRL", "ARG": "ARS", "CHL": "CLP", "COL": "COP", "PER": "PEN",
  "VEN": "VES", "ECU": "USD", "BOL": "BOB", "PRY": "PYG", "URY": "UYU",
  "GUY": "GYD", "SUR": "SRD",

  // OCEANIA
  "AUS": "AUD", "NZL": "NZD", "PNG": "PGK", "FJI": "FJD", "SLB": "SBD",
  "VUT": "VUV", "WSM": "WST", "TON": "TOP", "KIR": "AUD", "FSM": "USD"
};

// Helper function to get currency code from country code
function getCurrencyCode(countryCode: string): string {
  // If it's already a currency code (common ones), return as is
  const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'ZAR', 'NZD', 'SGD', 'HKD', 'KRW', 'RUB'];
  if (currencyCodes.includes(countryCode)) {
    return countryCode;
  }
  // Otherwise try to map from country code
  return countryToCurrency[countryCode] || countryCode;
}

// Edited by Christella - 03/24/2026: Changed country selector layout from horizontal (side-by-side
// with ⇄ swap button) to vertical (stacked top-to-bottom with a vertical ↕ swap button in between).
// Also removed the standalone card wrapper — the card shell is provided by the parent in PLDonationPage.
function CurrencyCalculator() {
  const [amount, setAmount] = useState('1');
  const [fromCountry, setFromCountry] = useState('USA');
  const [toCountry, setToCountry] = useState('GBR');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(false);

  // Get all country codes from countryNames
  const countries = Object.keys(countryNames).sort();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const convert = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    // Convert country codes to currency codes
    const fromCurrency = getCurrencyCode(fromCountry);
    const toCurrency = getCurrencyCode(toCountry);

    console.log(`Converting ${amount} ${fromCountry} (${fromCurrency}) to ${toCountry} (${toCurrency})`);

    try {
      const res = await fetch(
        `http://localhost:4000/api/currency/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );

      const data = await res.json();

      if (data.success) {
        setResult(data.convertedAmount);
      } else {
        setError(data.error || 'Conversion failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect to backend');
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    borderRadius: '0.5rem',
    border: isDark ? '1px solid #404040' : '1px solid #d1d5db',
    backgroundColor: isDark ? '#2d2d2d' : 'white',
    color: isDark ? 'white' : '#1f2937',
    fontSize: '0.875rem',
  };

  return (
    <div className="space-y-4">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 border rounded-lg"
        style={{
          backgroundColor: isDark ? '#2d2d2d' : 'white',
          borderColor: isDark ? '#404040' : '#d1d5db',
          color: isDark ? 'white' : '#1f2937'
        }}
        placeholder="Amount"
      />

      {/* Edited by Christella - 03/24/2026: Replaced horizontal flex row (From | ⇄ | To)
          with a vertical stack: From dropdown on top, swap button in the middle, To dropdown below. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

        {/* From */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: isDark ? '#9ca3af' : '#6b7280' }}>
            From
          </label>
          <select
            value={fromCountry}
            onChange={(e) => setFromCountry(e.target.value)}
            style={selectStyle}
          >
            {countries.map(c => (
              <option key={c} value={c}>
                {countryNames[c]} ({c}) → {getCurrencyCode(c)}
              </option>
            ))}
          </select>
          <div className="text-xs mt-1" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Currency: {getCurrencyCode(fromCountry)}
          </div>
        </div>

        {/* Vertical swap button — replaces the original horizontal ⇄ button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => { setFromCountry(toCountry); setToCountry(fromCountry); setResult(null); }}
            title="Swap countries"
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(180deg) scale(1.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(0deg) scale(1)'; }}
          >
            ↕
          </button>
        </div>

        {/* To */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: isDark ? '#9ca3af' : '#6b7280' }}>
            To
          </label>
          <select
            value={toCountry}
            onChange={(e) => setToCountry(e.target.value)}
            style={selectStyle}
          >
            {countries.map(c => (
              <option key={c} value={c}>
                {countryNames[c]} ({c}) → {getCurrencyCode(c)}
              </option>
            ))}
          </select>
          <div className="text-xs mt-1" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Currency: {getCurrencyCode(toCountry)}
          </div>
        </div>
      </div>

      <button
        onClick={convert}
        disabled={loading}
        className="w-full p-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
        style={{
          background: 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)'
        }}
      >
        {loading ? 'Converting...' : 'Convert'}
      </button>

      {error && (
        <div className="mt-4 p-4 rounded-lg text-center" style={{
          backgroundColor: isDark ? '#2d2d2d' : '#fee2e2',
          border: isDark ? '1px solid #404040' : '1px solid #fecaca',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {result !== null && !error && (
        <div className="mt-4 p-4 rounded-lg text-center" style={{
          backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6',
          border: isDark ? '1px solid #404040' : '1px solid #e5e7eb'
        }}>
          <p className="text-lg" style={{ color: isDark ? 'white' : '#1f2937' }}>
            {amount} {getCurrencyCode(fromCountry)} =
            <span className="font-bold text-xl ml-2">{result.toFixed(2)} {getCurrencyCode(toCountry)}</span>
          </p>
          <p className="text-xs mt-2" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            {countryNames[fromCountry]} → {countryNames[toCountry]}
          </p>
        </div>
      )}
    </div>
  );
}
// edited - daniel q. 3/20/26 end

// ─── Donation page ────────────────────────────────────────────────────────────

const donationAmounts = [
  { amount: 25, color: 'cyan', impact: 'Provides meals for a family' },
  { amount: 50, color: 'yellow', impact: 'Supports educational programs' },
  { amount: 100, color: 'orange', impact: 'Funds medical supplies' },
  { amount: 250, color: 'red', impact: 'Sponsors a child for a month' },
];

const impactStats = [
  { icon: Heart, value: '10,000+', label: 'Lives Impacted', gradient: 'cyan-yellow' },
  { icon: Gift, value: '$250K', label: 'Raised This Year', gradient: 'orange-red' },
  { icon: Users, value: '5,000+', label: 'Active Donors', gradient: 'cyan-yellow' },
  { icon: Sparkles, value: '50+', label: 'Communities Served', gradient: 'orange-red' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function StripePaymentForm({
  amount,
  isMonthly,
  formData,
  isDark,
  clientSecret,
}: {
  amount: number;
  isMonthly: boolean;
  formData: { name: string; email: string; message: string };
  isDark: boolean;
  clientSecret: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // edited by Christella - 04/01/2026: Route to dedicated success/failed pages based on actual PaymentIntent outcome instead of old local onSuccess state.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!stripe || !elements) return;

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

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'Please check your payment details.');
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
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

      // edited by Christella - 04/01/2026: Immediate Stripe errors should also go to the failed page so failed test payments do not stay on the form.
      if (error) {
        window.location.href = `/donationfailed?message=${encodeURIComponent(
          error.message || 'Payment failed. Please try again.'
        )}`;
        return;
      }

      if (!paymentIntent) {
        setErrorMessage('Could not verify payment status.');
        return;
      }

      switch (paymentIntent.status) {
        case 'succeeded':
          window.location.href = `/donationsuccess?payment_intent_client_secret=${encodeURIComponent(paymentIntent.client_secret!)}`;
          break;
        case 'processing':
          window.location.href = `/donationsuccess?payment_intent_client_secret=${encodeURIComponent(paymentIntent.client_secret!)}`;
          break;
        case 'requires_payment_method':
        case 'canceled':
          window.location.href = `/donationfailed?payment_intent_client_secret=${encodeURIComponent(paymentIntent.client_secret!)}`;
          break;
        default:
          setErrorMessage('Payment could not be completed.');
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
      <div className="mb-6">
        <label
          className="block text-lg mb-3"
          style={{ fontWeight: 600, color: 'var(--foreground)' }}
        >
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

        <p className="text-xs mt-2" style={{ color: 'var(--color-gray)' }}>
          Test mode: use card <strong>4242 4242 4242 4242</strong>, any future date, any CVC.
        </p>
      </div>

      {errorMessage && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
        >
          {errorMessage}
        </div>
      )}

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

export default function PLDonationPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // edited by Christella - 04/01/2026: Removed old local "success" screen state because successful and failed payments now go to dedicated routes.
  const [paymentStep, setPaymentStep] = useState<'form' | 'payment'>('form');

  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

      setClientSecret(data.clientSecret);
      setPaymentStep('payment');
    } catch (err) {
      console.error(err);
      setIntentError('Network error. Please try again.');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const donationAmount = selectedAmount === null ? Number(customAmount) : Number(selectedAmount);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Edited by Christella - 03/24/2026: changed centered hero header to left-aligned section header with decorative divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header style={{ marginBottom: 32 }}>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{
              margin: '0 0 16px 0',
              color: 'var(--foreground)',
              lineHeight: 1.2,
            }}
          >
            Your Generosity Changes Lives
          </h1>

          <div
            style={{
              height: 4,
              width: 80,
              borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-cyan-yellow)',
              margin: '0 0 24px 0',
            }}
          />

          <p
            className="text-lg sm:text-xl whitespace-nowrap"
            style={{ color: 'var(--color-gray)' }}
          >
            Join thousands of donors making a real impact in communities around the world. Every contribution matters.
          </p>
        </header>
      </div>

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
                  <div
                    className="text-2xl"
                    style={{ fontWeight: 700, color: 'var(--foreground)' }}
                  >
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

      {/* Donation + Currency Calculator side by side */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left: Donation box (75%) */}
          <div className="lg:col-span-3">
            <div
              className="card"
              style={{
                boxShadow: 'var(--shadow-xl)',
                background: 'var(--background)',
                border: '1px solid var(--color-gray-light)',
              }}
            >
              {paymentStep === 'payment' && clientSecret ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => {
                        setPaymentStep('form');
                        setClientSecret(null);
                      }}
                      className="text-sm underline"
                      style={{ color: 'var(--color-gray)' }}
                    >
                      ← Back
                    </button>

                    <h2
                      className="text-xl font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Complete Your ${donationAmount} Donation
                    </h2>
                  </div>

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
                    {/* edited by Christella - 04/01/2026: Pass clientSecret instead of old onSuccess prop. */}
                    <StripePaymentForm
                      amount={donationAmount}
                      isMonthly={isMonthly}
                      formData={formData}
                      isDark={isDark}
                      clientSecret={clientSecret}
                    />
                  </Elements>
                </div>
              ) : (
                <form onSubmit={handleProceedToPayment}>
                  <div className="flex justify-center mb-8">
                    <div
                      className="inline-flex rounded-full p-1"
                      style={{ background: 'var(--color-gray-light)' }}
                    >
                      <button
                        type="button"
                        onClick={() => setIsMonthly(false)}
                        className="px-6 py-2 rounded-full transition-all"
                        style={{
                          background: !isMonthly ? 'var(--gradient-cyan-yellow)' : 'transparent',
                          fontWeight: 600,
                          boxShadow: !isMonthly ? 'var(--shadow-md)' : 'none',
                          color: !isMonthly ? '#000' : 'var(--foreground)',
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

                  <div className="mb-8">
                    <label
                      className="block text-lg mb-4"
                      style={{ fontWeight: 600, color: 'var(--foreground)' }}
                    >
                      Select Amount
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {donationAmounts.map((option) => (
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
                              selectedAmount === option.amount
                                ? `var(--color-${option.color})`
                                : 'transparent',
                            borderWidth: '2px',
                            padding: '1.5rem 1rem',
                            boxShadow:
                              selectedAmount === option.amount
                                ? 'var(--shadow-lg)'
                                : 'var(--shadow-md)',
                            transform:
                              selectedAmount === option.amount ? 'scale(1.05)' : 'scale(1)',
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

                          <div
                            className="text-3xl mb-2"
                            style={{ fontWeight: 700, color: 'var(--foreground)' }}
                          >
                            ${option.amount}
                          </div>

                          <div className="text-xs" style={{ color: 'var(--color-gray)' }}>
                            {option.impact}
                          </div>
                        </button>
                      ))}
                    </div>

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

                  <div className="space-y-4 mb-8">
                    <h3
                      className="text-lg"
                      style={{ fontWeight: 600, color: 'var(--foreground)' }}
                    >
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

                  {intentError && (
                    <div
                      className="mb-4 p-3 rounded-lg text-sm"
                      style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                    >
                      {intentError}
                    </div>
                  )}

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
                    Your donation is securely logged. You&apos;ll receive a confirmation message
                    on-screen.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right: Currency calculator (25%) */}
          {/* Edited by Christella - 03/24/2026: Replaced <CurrencyConverter /> import with the
              inlined CurrencyCalculator component. Card shell kept from original donation page. */}
          <div className="lg:col-span-1">
            <div
              className="card"
              style={{
                boxShadow: 'var(--shadow-xl)',
                background: 'var(--background)',
                border: '1px solid var(--color-gray-light)',
                position: 'sticky',
                top: '1.5rem',
              }}
            >
              <div className="mb-6">
                <h2
                  className="text-2xl"
                  style={{ fontWeight: 700, color: 'var(--foreground)' }}
                >
                  Currency Calculator
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-gray)' }}>
                  Convert your donation amount before giving.
                </p>
              </div>

              <CurrencyCalculator />
            </div>
          </div>
        </div>
      </section>

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