// edited daniel q. 3/20/26 start
const express = require('express');
const router = express.Router();

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

// Helper function to convert country code to currency code
function getCurrencyCode(code) {
    // If it's already a currency code (3 letters and in our fallback rates), return as is
    const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'ZAR', 'NZD', 'SGD', 'HKD', 'KRW', 'RUB'];
    if (currencyCodes.includes(code)) {
        return code;
    }
    // Otherwise try to map from country code
    return countryToCurrency[code] || code;
}

// Convert currency
router.get('/convert', async (req, res) => {
    let { from, to, amount } = req.query;

    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    // Convert country codes to currency codes
    const fromCurrency = getCurrencyCode(from);
    const toCurrency = getCurrencyCode(to);
    
    console.log(`\n=== Converting ${amount} ${from} (${fromCurrency}) to ${to} (${toCurrency}) ===`);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        // First, try to get the exchange rate from API
        const apiUrl = `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`;
        console.log(`Fetching: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.log(`API returned status: ${response.status}`);
            throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        // Check different possible response structures
        let rate = null;
        
        // Frankfurter API response format: { rates: { EUR: 0.92 }, base: "USD", date: "2024-01-01" }
        if (data.rates && data.rates[toCurrency]) {
            rate = data.rates[toCurrency];
            console.log(`Found rate: 1 ${fromCurrency} = ${rate} ${toCurrency}`);
        } 
        // Some APIs return different format
        else if (data[toCurrency]) {
            rate = data[toCurrency];
            console.log(`Found rate in alternative format: ${rate}`);
        }
        else {
            console.log('Rate not found in response. Available rates:', Object.keys(data.rates || {}));
            throw new Error(`Rate for ${toCurrency} not found in response`);
        }
        
        const convertedAmount = amountNum * rate;
        
        res.json({ 
            success: true, 
            convertedAmount,
            rate,
            from: fromCurrency,
            to: toCurrency,
            originalFrom: from,
            originalTo: to,
            timestamp: data.date || new Date().toISOString(),
            source: 'api'
        });
        
    } catch (error) {
        console.error('Conversion error:', error.message);
        
        // Use comprehensive fallback rates
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
            // Additional currency mappings for common African and Asian currencies
            BAM: { USD: 0.55, EUR: 0.51, GBP: 0.44 }, // Bosnia
            SLL: { USD: 0.000045, EUR: 0.000042, GBP: 0.000036 }, // Sierra Leone
            MGA: { USD: 0.00022, EUR: 0.00020, GBP: 0.00018 }, // Madagascar
            XAF: { USD: 0.0016, EUR: 0.0015, GBP: 0.0013 }, // Central African CFA
            XOF: { USD: 0.0016, EUR: 0.0015, GBP: 0.0013 }, // West African CFA
            GHS: { USD: 0.083, EUR: 0.077, GBP: 0.066 }, // Ghana
            NGN: { USD: 0.00065, EUR: 0.00060, GBP: 0.00052 }, // Nigeria
            KES: { USD: 0.0078, EUR: 0.0072, GBP: 0.0062 }, // Kenya
            TZS: { USD: 0.00039, EUR: 0.00036, GBP: 0.00031 }, // Tanzania
            UGX: { USD: 0.00026, EUR: 0.00024, GBP: 0.00021 }, // Uganda
            ZMW: { USD: 0.039, EUR: 0.036, GBP: 0.031 }, // Zambia
            BDT: { USD: 0.0085, EUR: 0.0079, GBP: 0.0068 }, // Bangladesh
            PKR: { USD: 0.0036, EUR: 0.0033, GBP: 0.0029 }, // Pakistan
            LKR: { USD: 0.0031, EUR: 0.0029, GBP: 0.0025 }, // Sri Lanka
            NPR: { USD: 0.0075, EUR: 0.0070, GBP: 0.0060 }, // Nepal
            KHR: { USD: 0.00025, EUR: 0.00023, GBP: 0.00020 }, // Cambodia
            LAK: { USD: 0.000048, EUR: 0.000045, GBP: 0.000038 }, // Laos
            MMK: { USD: 0.00048, EUR: 0.00045, GBP: 0.00038 }, // Myanmar
            VND: { USD: 0.000040, EUR: 0.000037, GBP: 0.000032 }, // Vietnam
            THB: { USD: 0.028, EUR: 0.026, GBP: 0.022 }, // Thailand
            MYR: { USD: 0.21, EUR: 0.20, GBP: 0.17 }, // Malaysia
            IDR: { USD: 0.000064, EUR: 0.000059, GBP: 0.000051 }, // Indonesia
            PHP: { USD: 0.018, EUR: 0.017, GBP: 0.014 } // Philippines
        };
        
        // Try to find rate using the converted currency codes
        let rate = null;
        
        if (fallbackRates[fromCurrency] && fallbackRates[fromCurrency][toCurrency]) {
            rate = fallbackRates[fromCurrency][toCurrency];
            console.log(`Using fallback rate: 1 ${fromCurrency} = ${rate} ${toCurrency}`);
        }
        else if (fallbackRates[toCurrency] && fallbackRates[toCurrency][fromCurrency]) {
            const inverseRate = fallbackRates[toCurrency][fromCurrency];
            rate = 1 / inverseRate;
            console.log(`Using inverse fallback rate: 1 ${fromCurrency} = ${rate} ${toCurrency}`);
        }
        
        if (rate) {
            const convertedAmount = amountNum * rate;
            res.json({ 
                success: true, 
                convertedAmount,
                rate,
                from: fromCurrency,
                to: toCurrency,
                originalFrom: from,
                originalTo: to,
                source: 'fallback'
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: `Cannot convert ${fromCurrency} to ${toCurrency}. Rate not available.`
            });
        }
    }
});

// Get available currencies
router.get('/currencies', async (req, res) => {
    try {
        const response = await fetch('https://api.frankfurter.app/currencies');
        
        if (response.ok) {
            const data = await response.json();
            const currencies = Object.entries(data).map(([code, name]) => ({
                code,
                name: name
            }));
            return res.json({ success: true, currencies });
        }
    } catch (error) {
        console.error('Error fetching currencies:', error.message);
    }
    
    // Fallback currencies
    const currencies = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'CAD', name: 'Canadian Dollar' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'CHF', name: 'Swiss Franc' },
        { code: 'CNY', name: 'Chinese Yuan' },
        { code: 'INR', name: 'Indian Rupee' },
        { code: 'MXN', name: 'Mexican Peso' },
        { code: 'BRL', name: 'Brazilian Real' },
        { code: 'ZAR', name: 'South African Rand' },
        { code: 'NZD', name: 'New Zealand Dollar' },
        { code: 'SGD', name: 'Singapore Dollar' },
        { code: 'HKD', name: 'Hong Kong Dollar' },
        { code: 'KRW', name: 'South Korean Won' },
        { code: 'RUB', name: 'Russian Ruble' },
        { code: 'BAM', name: 'Bosnian Convertible Mark' },
        { code: 'SLL', name: 'Sierra Leonean Leone' },
        { code: 'MGA', name: 'Malagasy Ariary' },
        { code: 'XAF', name: 'Central African CFA Franc' },
        { code: 'XOF', name: 'West African CFA Franc' },
        { code: 'GHS', name: 'Ghanaian Cedi' },
        { code: 'NGN', name: 'Nigerian Naira' },
        { code: 'KES', name: 'Kenyan Shilling' }
    ];
    res.json({ success: true, currencies, source: 'fallback' });
});

module.exports = router;
// edited daniel q. 3/20/26 end