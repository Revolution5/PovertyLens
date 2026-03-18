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
  BIH: "Bosnia",
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
  TTO: "Trinidad",
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

export default function CurrencyCalculator() {
    const [amount, setAmount] = useState('1');
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('EUR');
    const [result, setResult] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Get all currency codes from countryNames
    const currencies = Object.keys(countryNames).sort();

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
        try {
            const res = await fetch(
                `http://localhost:4000/api/currency/convert?from=${from}&to=${to}&amount=${amount}`
            );
            const data = await res.json();
            if (data.success) {
                setResult(data.convertedAmount);
            }
        } catch (error) {
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
                            value={from} 
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            style={{ 
                                backgroundColor: isDark ? '#2d2d2d' : 'white',
                                borderColor: isDark ? '#404040' : '#d1d5db',
                                color: isDark ? 'white' : '#1f2937'
                            }}
                        >
                            {currencies.map(c => (
                                <option key={c} value={c}>
                                    {c} - {countryNames[c]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={() => { setFrom(to); setTo(from); }}
                        className="px-4 py-2 rounded-lg"
                        style={{ 
                            backgroundColor: isDark ? '#404040' : '#e5e7eb',
                            color: isDark ? 'white' : '#1f2937'
                        }}
                    >
                        ⇄
                    </button>

                    <div className="flex-1">
                        <select 
                            value={to} 
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            style={{ 
                                backgroundColor: isDark ? '#2d2d2d' : 'white',
                                borderColor: isDark ? '#404040' : '#d1d5db',
                                color: isDark ? 'white' : '#1f2937'
                            }}
                        >
                            {currencies.map(c => (
                                <option key={c} value={c}>
                                    {c} - {countryNames[c]}
                                </option>
                            ))}
                        </select>
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

                {result !== null && (
                    <div className="mt-4 p-4 rounded-lg text-center" style={{ 
                        backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6',
                        border: isDark ? '1px solid #404040' : '1px solid #e5e7eb'
                    }}>
                        <p className="text-lg" style={{ color: isDark ? 'white' : '#1f2937' }}>
                            {amount} {from} = <span className="font-bold text-xl">{result.toFixed(2)} {to}</span>
                        </p>
                        <p className="text-xs mt-2" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                            {countryNames[from]} → {countryNames[to]}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}