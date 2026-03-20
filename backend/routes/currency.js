// added - daniel q. 3/17/36 start
const express = require('express');
const router = express.Router();

let cache = {
    rates: {},
    timestamp: null
};

router.get('/convert', async (req, res) => {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        if (cache.timestamp && cache.timestamp > Date.now() - 3600000) {
            if (cache.rates[from] && cache.rates[from][to]) {
                const converted = parseFloat(amount) * cache.rates[from][to];
                return res.json({ 
                    success: true, 
                    convertedAmount: converted,
                    rate: cache.rates[from][to],
                    from, 
                    to,
                    cached: true
                });
            }
        }

        const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
        const data = await response.json();

        if (!data.rates || !data.rates[to]) {
            throw new Error('Rate not found');
        }

        const rate = data.rates[to];
        const convertedAmount = parseFloat(amount) * rate;

        if (!cache.rates[from]) cache.rates[from] = {};
        cache.rates[from][to] = rate;
        cache.timestamp = Date.now();

        res.json({ success: true, convertedAmount, rate, from, to });

    } catch (error) {
        console.error('Conversion error:', error);
        
        const fallback = {
            USD: { EUR: 0.92, GBP: 0.79, JPY: 150.50 },
            EUR: { USD: 1.09, GBP: 0.86, JPY: 163.50 },
            GBP: { USD: 1.27, EUR: 1.16, JPY: 190.00 },
            JPY: { USD: 0.0066, EUR: 0.0061, GBP: 0.0053 }
        };

        if (fallback[from] && fallback[from][to]) {
            const converted = parseFloat(amount) * fallback[from][to];
            res.json({ 
                success: true, 
                convertedAmount: converted,
                rate: fallback[from][to],
                from, 
                to,
                note: 'Using fallback rates'
            });
        } else {
            res.status(500).json({ error: 'Conversion failed' });
        }
    }
});

router.get('/currencies', async (req, res) => {
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
        { code: 'MXN', name: 'Mexican Peso' }
    ];
    res.json({ success: true, currencies });
});

module.exports = router;
// added - daniel q. 3/17/36 end