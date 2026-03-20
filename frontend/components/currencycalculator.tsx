// edited - daniel q. 3/20/26 start
"use client";
import { useState, useEffect } from 'react';

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

export default function CurrencyCalculator() {
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

    return (
        <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg" style={{ 
            backgroundColor: isDark ? '#1a1a1a' : 'white',
            border: isDark ? '1px solid #333' : '1px solid #e5e7eb'
        }}>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: isDark ? 'white' : '#1f2937' }}>
                Currency Calculator
            </h2>
            
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

                <div className="flex gap-2">
                    <div className="flex-1">
                        <select 
                            value={fromCountry} 
                            onChange={(e) => setFromCountry(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            style={{ 
                                backgroundColor: isDark ? '#2d2d2d' : 'white',
                                borderColor: isDark ? '#404040' : '#d1d5db',
                                color: isDark ? 'white' : '#1f2937'
                            }}
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

                    <button 
                        onClick={() => { setFromCountry(toCountry); setToCountry(fromCountry); }}
                        className="px-4 py-2 rounded-lg self-center"
                        style={{ 
                            backgroundColor: isDark ? '#404040' : '#e5e7eb',
                            color: isDark ? 'white' : '#1f2937'
                        }}
                    >
                        ⇄
                    </button>

                    <div className="flex-1">
                        <select 
                            value={toCountry} 
                            onChange={(e) => setToCountry(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            style={{ 
                                backgroundColor: isDark ? '#2d2d2d' : 'white',
                                borderColor: isDark ? '#404040' : '#d1d5db',
                                color: isDark ? 'white' : '#1f2937'
                            }}
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
        </div>
    );
}
// edited - daniel q. 3/20/26 end