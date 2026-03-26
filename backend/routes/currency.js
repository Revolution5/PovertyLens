// edited daniel q. 3/20/26 start - OPTIMIZED VERSION
const express = require('express');
const router = express.Router();

// Configuration
const USE_API = process.env.USE_CURRENCY_API !== 'false';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT) || 3000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for exchange rates
const rateCache = new Map();

// Pre-compile currency codes for fast lookup
const KNOWN_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'ZAR', 'NZD', 'SGD', 'HKD', 'KRW', 'RUB']);

// Map country codes to currency codes (ISO 3166-1 alpha-3 to ISO 4217)
const countryToCurrency = {
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
    
    // NORTH AMERICA
    "CAN": "CAD", "MEX": "MXN", "USA": "USD", "GTM": "GTQ", "HND": "HNL",
    "SLV": "USD", "NIC": "NIO", "CRI": "CRC", "PAN": "PAB", "CUB": "CUP",
    "HTI": "HTG", "DOM": "DOP", "JAM": "JMD", "TTO": "TTD", "BHS": "BSD",
    "BRB": "BBD",
    
    // SOUTH AMERICA
    "BRA": "BRL", "ARG": "ARS", "CHL": "CLP", "COL": "COP", "PER": "PEN",
    "VEN": "VES", "ECU": "USD", "BOL": "BOB", "PRY": "PYG", "URY": "UYU",
    "GUY": "GYD", "SUR": "SRD",
    
    // OCEANIA
    "AUS": "AUD", "NZL": "NZD", "PNG": "PGK", "FJI": "FJD", "SLB": "SBD",
    "VUT": "VUV", "WSM": "WST", "TON": "TOP", "KIR": "AUD", "FSM": "USD"
};

// Optimized helper function
function getCurrencyCode(code) {
    if (KNOWN_CURRENCIES.has(code)) return code;
    return countryToCurrency[code] || code;
}

// Cache helper functions
function getCachedRate(from, to) {
    const key = `${from}:${to}`;
    const cached = rateCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.rate;
    }
    return null;
}

function setCachedRate(from, to, rate) {
    const key = `${from}:${to}`;
    rateCache.set(key, { rate, timestamp: Date.now() });
}

// Comprehensive fallback rates
const fallbackRates = {
    // Major currencies to all others
    USD: { EUR: 0.92, GBP: 0.79, JPY: 150.5, CAD: 1.35, AUD: 1.52, CHF: 0.89, CNY: 7.19, INR: 83.12, MXN: 16.78, BRL: 5.02, ZAR: 18.45, NZD: 1.64, SGD: 1.34, HKD: 7.82, KRW: 1330, RUB: 91.23 },
    EUR: { USD: 1.09, GBP: 0.86, JPY: 163.5, CAD: 1.47, AUD: 1.65, CHF: 0.97, CNY: 7.82, INR: 90.45, MXN: 18.26, BRL: 5.46, ZAR: 20.07, NZD: 1.78, SGD: 1.46, HKD: 8.51, KRW: 1448, RUB: 99.34 },
    GBP: { USD: 1.27, EUR: 1.16, JPY: 190.0, CAD: 1.71, AUD: 1.92, CHF: 1.13, CNY: 9.10, INR: 105.23, MXN: 21.25, BRL: 6.35, ZAR: 23.35, NZD: 2.07, SGD: 1.70, HKD: 9.90, KRW: 1686, RUB: 115.67 },
    JPY: { USD: 0.0066, EUR: 0.0061, GBP: 0.0053, CAD: 0.0090, AUD: 0.0101, CHF: 0.0059, CNY: 0.0478, INR: 0.55, MXN: 0.11, BRL: 0.033, ZAR: 0.12, NZD: 0.0108, SGD: 0.0089, HKD: 0.051, KRW: 8.84, RUB: 0.61 },
    CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 111.1, AUD: 1.13, CHF: 0.66, CNY: 5.33, INR: 61.6, MXN: 12.43, BRL: 3.72, ZAR: 13.67, NZD: 1.22, SGD: 0.99, HKD: 5.79, KRW: 985, RUB: 67.6 },
    AUD: { USD: 0.66, EUR: 0.61, GBP: 0.52, JPY: 99.0, CAD: 0.88, CHF: 0.58, CNY: 4.73, INR: 54.7, MXN: 11.04, BRL: 3.30, ZAR: 12.14, NZD: 1.08, SGD: 0.88, HKD: 5.14, KRW: 875, RUB: 60.0 },
    CHF: { USD: 1.12, EUR: 1.03, GBP: 0.88, JPY: 169.5, CAD: 1.52, AUD: 1.72, CNY: 8.08, INR: 93.4, MXN: 18.86, BRL: 5.64, ZAR: 20.73, NZD: 1.84, SGD: 1.51, HKD: 8.78, KRW: 1495, RUB: 102.6 },
    CNY: { USD: 0.14, EUR: 0.13, GBP: 0.11, JPY: 20.9, CAD: 0.19, AUD: 0.21, CHF: 0.12, INR: 11.56, MXN: 2.33, BRL: 0.70, ZAR: 2.57, NZD: 0.23, SGD: 0.19, HKD: 1.09, KRW: 185, RUB: 12.7 },
    INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.82, CAD: 0.016, AUD: 0.018, CHF: 0.011, CNY: 0.086, MXN: 0.20, BRL: 0.060, ZAR: 0.22, NZD: 0.020, SGD: 0.016, HKD: 0.094, KRW: 16.0, RUB: 1.10 },
    MXN: { USD: 0.060, EUR: 0.055, GBP: 0.047, JPY: 9.09, CAD: 0.080, AUD: 0.091, CHF: 0.053, CNY: 0.43, INR: 4.98, BRL: 0.30, ZAR: 1.10, NZD: 0.098, SGD: 0.080, HKD: 0.47, KRW: 79.5, RUB: 5.46 },
    BRL: { USD: 0.20, EUR: 0.18, GBP: 0.16, JPY: 30.3, CAD: 0.27, AUD: 0.30, CHF: 0.18, CNY: 1.43, INR: 16.67, MXN: 3.33, ZAR: 3.68, NZD: 0.33, SGD: 0.27, HKD: 1.56, KRW: 265, RUB: 18.2 },
    ZAR: { USD: 0.054, EUR: 0.050, GBP: 0.043, JPY: 8.33, CAD: 0.073, AUD: 0.082, CHF: 0.048, CNY: 0.39, INR: 4.55, MXN: 0.91, BRL: 0.27, NZD: 0.089, SGD: 0.073, HKD: 0.42, KRW: 72.1, RUB: 4.95 },
    NZD: { USD: 0.61, EUR: 0.56, GBP: 0.48, JPY: 92.6, CAD: 0.82, AUD: 0.93, CHF: 0.54, CNY: 4.35, INR: 50.0, MXN: 10.2, BRL: 3.03, ZAR: 11.24, SGD: 0.82, HKD: 4.76, KRW: 810, RUB: 55.6 },
    SGD: { USD: 0.75, EUR: 0.68, GBP: 0.59, JPY: 112.4, CAD: 1.01, AUD: 1.14, CHF: 0.66, CNY: 5.26, INR: 62.5, MXN: 12.5, BRL: 3.70, ZAR: 13.7, NZD: 1.22, HKD: 5.84, KRW: 993, RUB: 68.2 },
    HKD: { USD: 0.13, EUR: 0.12, GBP: 0.10, JPY: 19.6, CAD: 0.17, AUD: 0.19, CHF: 0.11, CNY: 0.92, INR: 10.6, MXN: 2.13, BRL: 0.64, ZAR: 2.38, NZD: 0.21, SGD: 0.17, KRW: 170, RUB: 11.7 },
    KRW: { USD: 0.00075, EUR: 0.00069, GBP: 0.00059, JPY: 0.113, CAD: 0.0010, AUD: 0.0011, CHF: 0.00067, CNY: 0.0054, INR: 0.0625, MXN: 0.0126, BRL: 0.0038, ZAR: 0.0139, NZD: 0.0012, SGD: 0.0010, HKD: 0.0059, RUB: 0.0686 },
    RUB: { USD: 0.011, EUR: 0.010, GBP: 0.0086, JPY: 1.64, CAD: 0.015, AUD: 0.017, CHF: 0.0097, CNY: 0.079, INR: 0.91, MXN: 0.18, BRL: 0.055, ZAR: 0.20, NZD: 0.018, SGD: 0.015, HKD: 0.085, KRW: 14.6 },
    
    // Additional African currencies
    BAM: { USD: 0.55, EUR: 0.51, GBP: 0.44 },
    SLL: { USD: 0.000045, EUR: 0.000042, GBP: 0.000036 },
    MGA: { USD: 0.00022, EUR: 0.00020, GBP: 0.00018 },
    XAF: { USD: 0.0016, EUR: 0.0015, GBP: 0.0013 },
    XOF: { USD: 0.0016, EUR: 0.0015, GBP: 0.0013 },
    GHS: { USD: 0.083, EUR: 0.077, GBP: 0.066 },
    NGN: { USD: 0.00065, EUR: 0.00060, GBP: 0.00052 },
    KES: { USD: 0.0078, EUR: 0.0072, GBP: 0.0062 },
    TZS: { USD: 0.00039, EUR: 0.00036, GBP: 0.00031 },
    UGX: { USD: 0.00026, EUR: 0.00024, GBP: 0.00021 },
    ZMW: { USD: 0.039, EUR: 0.036, GBP: 0.031 },
    DZD: { USD: 0.0074, EUR: 0.0069, GBP: 0.0059 },
    AOA: { USD: 0.0017, EUR: 0.0016, GBP: 0.0014 },
    BWP: { USD: 0.074, EUR: 0.069, GBP: 0.059 },
    CDF: { USD: 0.00040, EUR: 0.00037, GBP: 0.00032 },
    ETB: { USD: 0.018, EUR: 0.017, GBP: 0.014 },
    GMD: { USD: 0.015, EUR: 0.014, GBP: 0.012 },
    GNF: { USD: 0.00012, EUR: 0.00011, GBP: 0.000095 },
    LRD: { USD: 0.0052, EUR: 0.0048, GBP: 0.0041 },
    MWK: { USD: 0.00058, EUR: 0.00054, GBP: 0.00046 },
    MRU: { USD: 0.025, EUR: 0.023, GBP: 0.020 },
    MAD: { USD: 0.099, EUR: 0.092, GBP: 0.079 },
    MZN: { USD: 0.016, EUR: 0.015, GBP: 0.013 },
    NAD: { USD: 0.054, EUR: 0.050, GBP: 0.043 },
    RWF: { USD: 0.00082, EUR: 0.00076, GBP: 0.00065 },
    SDG: { USD: 0.0017, EUR: 0.0016, GBP: 0.0014 },
    SZL: { USD: 0.054, EUR: 0.050, GBP: 0.043 },
    TND: { USD: 0.32, EUR: 0.30, GBP: 0.26 },
    
    // Additional Asian currencies
    BDT: { USD: 0.0085, EUR: 0.0079, GBP: 0.0068 },
    PKR: { USD: 0.0036, EUR: 0.0033, GBP: 0.0029 },
    LKR: { USD: 0.0031, EUR: 0.0029, GBP: 0.0025 },
    NPR: { USD: 0.0075, EUR: 0.0070, GBP: 0.0060 },
    KHR: { USD: 0.00025, EUR: 0.00023, GBP: 0.00020 },
    LAK: { USD: 0.000048, EUR: 0.000045, GBP: 0.000038 },
    MMK: { USD: 0.00048, EUR: 0.00045, GBP: 0.00038 },
    VND: { USD: 0.000040, EUR: 0.000037, GBP: 0.000032 },
    THB: { USD: 0.028, EUR: 0.026, GBP: 0.022 },
    MYR: { USD: 0.21, EUR: 0.20, GBP: 0.17 },
    IDR: { USD: 0.000064, EUR: 0.000059, GBP: 0.000051 },
    PHP: { USD: 0.018, EUR: 0.017, GBP: 0.014 },
    KZT: { USD: 0.0022, EUR: 0.0020, GBP: 0.0018 },
    UZS: { USD: 0.000079, EUR: 0.000073, GBP: 0.000063 },
    AZN: { USD: 0.59, EUR: 0.55, GBP: 0.47 },
    GEL: { USD: 0.37, EUR: 0.34, GBP: 0.29 },
    AMD: { USD: 0.0025, EUR: 0.0023, GBP: 0.0020 },
    IQD: { USD: 0.00076, EUR: 0.00071, GBP: 0.00061 },
    IRR: { USD: 0.000024, EUR: 0.000022, GBP: 0.000019 },
    SAR: { USD: 0.27, EUR: 0.25, GBP: 0.21 },
    AED: { USD: 0.27, EUR: 0.25, GBP: 0.21 },
    TRY: { USD: 0.031, EUR: 0.029, GBP: 0.025 },
    ILS: { USD: 0.27, EUR: 0.25, GBP: 0.21 },
    JOD: { USD: 1.41, EUR: 1.31, GBP: 1.12 },
    LBP: { USD: 0.000011, EUR: 0.000010, GBP: 0.0000088 },
    YER: { USD: 0.0040, EUR: 0.0037, GBP: 0.0032 },
    SYP: { USD: 0.000080, EUR: 0.000074, GBP: 0.000064 },
    OMR: { USD: 2.60, EUR: 2.41, GBP: 2.06 },
    KWD: { USD: 3.25, EUR: 3.01, GBP: 2.58 },
    QAR: { USD: 0.27, EUR: 0.25, GBP: 0.21 },
    BHD: { USD: 2.65, EUR: 2.46, GBP: 2.10 },
    AFN: { USD: 0.011, EUR: 0.010, GBP: 0.0087 },
    MNT: { USD: 0.00029, EUR: 0.00027, GBP: 0.00023 },
    
    // Additional European currencies
    NOK: { USD: 0.093, EUR: 0.086, GBP: 0.074 },
    SEK: { USD: 0.094, EUR: 0.087, GBP: 0.075 },
    DKK: { USD: 0.14, EUR: 0.13, GBP: 0.11 },
    PLN: { USD: 0.25, EUR: 0.23, GBP: 0.20 },
    CZK: { USD: 0.043, EUR: 0.040, GBP: 0.034 },
    HUF: { USD: 0.0028, EUR: 0.0026, GBP: 0.0022 },
    RON: { USD: 0.21, EUR: 0.20, GBP: 0.17 },
    BGN: { USD: 0.56, EUR: 0.52, GBP: 0.44 },
    UAH: { USD: 0.024, EUR: 0.022, GBP: 0.019 },
    BYN: { USD: 0.31, EUR: 0.29, GBP: 0.25 },
    
    // Additional North American currencies
    GTQ: { USD: 0.13, EUR: 0.12, GBP: 0.10 },
    HNL: { USD: 0.040, EUR: 0.037, GBP: 0.032 },
    NIO: { USD: 0.027, EUR: 0.025, GBP: 0.021 },
    CRC: { USD: 0.0019, EUR: 0.0018, GBP: 0.0015 },
    PAB: { USD: 1.00, EUR: 0.93, GBP: 0.79 },
    CUP: { USD: 0.042, EUR: 0.039, GBP: 0.033 },
    HTG: { USD: 0.0076, EUR: 0.0070, GBP: 0.0060 },
    DOP: { USD: 0.017, EUR: 0.016, GBP: 0.014 },
    JMD: { USD: 0.0064, EUR: 0.0059, GBP: 0.0051 },
    TTD: { USD: 0.15, EUR: 0.14, GBP: 0.12 },
    BSD: { USD: 1.00, EUR: 0.93, GBP: 0.79 },
    BBD: { USD: 0.50, EUR: 0.46, GBP: 0.40 },
    
    // Additional South American currencies
    ARS: { USD: 0.0011, EUR: 0.0010, GBP: 0.00087 },
    CLP: { USD: 0.0011, EUR: 0.0010, GBP: 0.00087 },
    COP: { USD: 0.00025, EUR: 0.00023, GBP: 0.00020 },
    PEN: { USD: 0.27, EUR: 0.25, GBP: 0.21 },
    VES: { USD: 0.000027, EUR: 0.000025, GBP: 0.000021 },
    BOB: { USD: 0.14, EUR: 0.13, GBP: 0.11 },
    PYG: { USD: 0.00013, EUR: 0.00012, GBP: 0.00010 },
    UYU: { USD: 0.025, EUR: 0.023, GBP: 0.020 },
    GYD: { USD: 0.0048, EUR: 0.0044, GBP: 0.0038 },
    SRD: { USD: 0.032, EUR: 0.030, GBP: 0.025 },
    
    // Additional Oceanian currencies
    PGK: { USD: 0.28, EUR: 0.26, GBP: 0.22 },
    FJD: { USD: 0.45, EUR: 0.42, GBP: 0.36 },
    SBD: { USD: 0.12, EUR: 0.11, GBP: 0.095 },
    VUV: { USD: 0.0083, EUR: 0.0077, GBP: 0.0066 },
    WST: { USD: 0.36, EUR: 0.33, GBP: 0.29 },
    TOP: { USD: 0.42, EUR: 0.39, GBP: 0.33 }
};

// Create reverse lookup map for O(1) fallback rate lookups
const fallbackRatesMap = new Map();
for (const [from, rates] of Object.entries(fallbackRates)) {
    for (const [to, rate] of Object.entries(rates)) {
        fallbackRatesMap.set(`${from}:${to}`, rate);
        // Also store inverse rate for reverse lookups
        if (rate !== 0) {
            fallbackRatesMap.set(`${to}:${from}`, 1 / rate);
        }
    }
}

// Convert currency endpoint
router.get('/convert', async (req, res) => {
    let { from, to, amount } = req.query;

    // Validate required parameters
    if (!from || !to || !amount) {
        return res.status(400).json({ 
            success: false,
            error: 'Missing parameters. Required: from, to, amount' 
        });
    }

    // Fast conversion of country codes to currency codes
    const fromCurrency = getCurrencyCode(from.toUpperCase());
    const toCurrency = getCurrencyCode(to.toUpperCase());
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Invalid amount. Must be a positive number' 
        });
    }

    // Check cache first (fastest path)
    const cachedRate = getCachedRate(fromCurrency, toCurrency);
    if (cachedRate !== null) {
        const convertedAmount = amountNum * cachedRate;
        return res.json({ 
            success: true, 
            convertedAmount: parseFloat(convertedAmount.toFixed(2)),
            rate: cachedRate,
            from: fromCurrency,
            to: toCurrency,
            originalFrom: from,
            originalTo: to,
            amount: amountNum,
            source: 'cache',
            timestamp: new Date().toISOString()
        });
    }

    // Try API if enabled
    if (USE_API) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
            
            const apiUrl = `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`;
            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                let rate = data.rates?.[toCurrency];
                
                if (rate && typeof rate === 'number') {
                    // Cache the successful rate
                    setCachedRate(fromCurrency, toCurrency, rate);
                    const convertedAmount = amountNum * rate;
                    
                    return res.json({ 
                        success: true, 
                        convertedAmount: parseFloat(convertedAmount.toFixed(2)),
                        rate,
                        from: fromCurrency,
                        to: toCurrency,
                        originalFrom: from,
                        originalTo: to,
                        amount: amountNum,
                        source: 'api',
                        timestamp: data.date || new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.error('API error:', error.message);
            // Continue to fallback
        }
    }
    
    // Use pre-processed fallback rates (O(1) lookup)
    const rate = fallbackRatesMap.get(`${fromCurrency}:${toCurrency}`);
    
    if (rate && typeof rate === 'number') {
        const convertedAmount = amountNum * rate;
        // Cache fallback rates too
        setCachedRate(fromCurrency, toCurrency, rate);
        
        return res.json({ 
            success: true, 
            convertedAmount: parseFloat(convertedAmount.toFixed(2)),
            rate,
            from: fromCurrency,
            to: toCurrency,
            originalFrom: from,
            originalTo: to,
            amount: amountNum,
            source: 'fallback',
            timestamp: new Date().toISOString()
        });
    }
    
    // No rate found
    res.status(500).json({ 
        success: false, 
        error: `Cannot convert ${fromCurrency} to ${toCurrency}. Rate not available in cache, API, or fallback data.`,
        from: fromCurrency,
        to: toCurrency
    });
});

// Get available currencies endpoint (with caching)
let currenciesCache = null;
let currenciesCacheTime = 0;

router.get('/currencies', async (req, res) => {
    // Check cache first
    if (currenciesCache && Date.now() - currenciesCacheTime < 3600000) { // 1 hour cache
        return res.json({ 
            success: true, 
            currencies: currenciesCache, 
            source: 'cache',
            count: currenciesCache.length,
            timestamp: new Date().toISOString()
        });
    }
    
    // Try API
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch('https://api.frankfurter.app/currencies', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            currenciesCache = Object.entries(data).map(([code, name]) => ({ 
                code, 
                name,
                type: 'currency'
            }));
            currenciesCacheTime = Date.now();
            
            return res.json({ 
                success: true, 
                currencies: currenciesCache,
                source: 'api',
                count: currenciesCache.length,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error fetching currencies:', error.message);
    }
    
    // Fallback currencies (comprehensive list)
    const fallbackCurrencies = [
        { code: 'USD', name: 'US Dollar', type: 'currency' },
        { code: 'EUR', name: 'Euro', type: 'currency' },
        { code: 'GBP', name: 'British Pound Sterling', type: 'currency' },
        { code: 'JPY', name: 'Japanese Yen', type: 'currency' },
        { code: 'CAD', name: 'Canadian Dollar', type: 'currency' },
        { code: 'AUD', name: 'Australian Dollar', type: 'currency' },
        { code: 'CHF', name: 'Swiss Franc', type: 'currency' },
        { code: 'CNY', name: 'Chinese Yuan', type: 'currency' },
        { code: 'INR', name: 'Indian Rupee', type: 'currency' },
        { code: 'MXN', name: 'Mexican Peso', type: 'currency' },
        { code: 'BRL', name: 'Brazilian Real', type: 'currency' },
        { code: 'ZAR', name: 'South African Rand', type: 'currency' },
        { code: 'NZD', name: 'New Zealand Dollar', type: 'currency' },
        { code: 'SGD', name: 'Singapore Dollar', type: 'currency' },
        { code: 'HKD', name: 'Hong Kong Dollar', type: 'currency' },
        { code: 'KRW', name: 'South Korean Won', type: 'currency' },
        { code: 'RUB', name: 'Russian Ruble', type: 'currency' },
        { code: 'NOK', name: 'Norwegian Krone', type: 'currency' },
        { code: 'SEK', name: 'Swedish Krona', type: 'currency' },
        { code: 'DKK', name: 'Danish Krone', type: 'currency' },
        { code: 'PLN', name: 'Polish Zloty', type: 'currency' },
        { code: 'TRY', name: 'Turkish Lira', type: 'currency' },
        { code: 'THB', name: 'Thai Baht', type: 'currency' },
        { code: 'MYR', name: 'Malaysian Ringgit', type: 'currency' },
        { code: 'IDR', name: 'Indonesian Rupiah', type: 'currency' },
        { code: 'PHP', name: 'Philippine Peso', type: 'currency' },
        { code: 'VND', name: 'Vietnamese Dong', type: 'currency' },
        { code: 'NGN', name: 'Nigerian Naira', type: 'currency' },
        { code: 'KES', name: 'Kenyan Shilling', type: 'currency' },
        { code: 'EGP', name: 'Egyptian Pound', type: 'currency' },
        { code: 'AED', name: 'UAE Dirham', type: 'currency' },
        { code: 'SAR', name: 'Saudi Riyal', type: 'currency' },
        { code: 'ILS', name: 'Israeli Shekel', type: 'currency' },
        { code: 'PKR', name: 'Pakistani Rupee', type: 'currency' },
        { code: 'BDT', name: 'Bangladeshi Taka', type: 'currency' },
        { code: 'LKR', name: 'Sri Lankan Rupee', type: 'currency' },
        { code: 'NPR', name: 'Nepalese Rupee', type: 'currency' },
        { code: 'XAF', name: 'Central African CFA Franc', type: 'currency' },
        { code: 'XOF', name: 'West African CFA Franc', type: 'currency' },
        { code: 'GHS', name: 'Ghanaian Cedi', type: 'currency' },
        { code: 'TZS', name: 'Tanzanian Shilling', type: 'currency' },
        { code: 'UGX', name: 'Ugandan Shilling', type: 'currency' },
        { code: 'ZMW', name: 'Zambian Kwacha', type: 'currency' },
        { code: 'MAD', name: 'Moroccan Dirham', type: 'currency' },
        { code: 'DZD', name: 'Algerian Dinar', type: 'currency' },
        { code: 'TND', name: 'Tunisian Dinar', type: 'currency' }
    ];
    
    res.json({ 
        success: true, 
        currencies: fallbackCurrencies,
        source: 'fallback',
        count: fallbackCurrencies.length,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cacheSize: rateCache.size,
        useApi: USE_API,
        apiTimeout: API_TIMEOUT
    });
});

// Clear cache endpoint (for admin use)
router.post('/cache/clear', (req, res) => {
    rateCache.clear();
    res.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
// edited daniel q. 3/20/26 end