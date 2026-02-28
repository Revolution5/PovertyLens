// File created by Christella - 2/26/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { getDb } = require('../database');
const countriesLib = require("i18n-iso-countries") // Added by Christella on 02/03/2026 for countries list
countriesLib.registerLocale(require("i18n-iso-countries/langs/en.json")); // Added by Christella on 02/05/2026

// Edited by Christella 1/30/2026, UPDATED 02/03/2026 (expanded list)
const ISO3_LIST = [
  "ABW","AFG","AGO","AIA","ALA","ALB","AND","ARE","ARG","ARM","ASM","ATA","ATF","ATG","AUS","AUT","AZE",
  "BDI","BEL","BEN","BES","BFA","BGD","BGR","BHR","BHS","BIH","BLM","BLR","BLZ","BMU","BOL","BRA","BRB",
  "BRN","BTN","BVT","BWA","CAF","CAN","CCK","CHE","CHL","CHN","CIV","CMR","COD","COG","COK","COL","COM",
  "CPV","CRI","CUB","CUW","CXR","CYM","CYP","CZE","DEU","DJI","DMA","DNK","DOM","DZA","ECU","EGY","ERI",
  "ESH","ESP","EST","ETH","FIN","FJI","FLK","FRA","FRO","FSM","GAB","GBR","GEO","GGY","GHA","GIB","GIN",
  "GLP","GMB","GNB","GNQ","GRC","GRD","GRL","GTM","GUF","GUM","GUY","HKG","HMD","HND","HRV","HTI","HUN",
  "IDN","IMN","IND","IOT","IRL","IRN","IRQ","ISL","ISR","ITA","JAM","JEY","JOR","JPN","KAZ","KEN","KGZ",
  "KHM","KIR","KNA","KOR","KWT","LAO","LBN","LBR","LBY","LCA","LIE","LKA","LSO","LTU","LUX","LVA","MAC",
  "MAF","MAR","MCO","MDA","MDG","MDV","MEX","MHL","MKD","MLI","MLT","MMR","MNE","MNG","MNP","MOZ","MRT",
  "MSR","MTQ","MUS","MWI","MYS","MYT","NAM","NCL","NER","NFK","NGA","NIC","NIU","NLD","NOR","NPL","NRU",
  "NZL","OMN","PAK","PAN","PCN","PER","PHL","PLW","PNG","POL","PRI","PRK","PRT","PRY","PSE","PYF","QAT",
  "REU","ROU","RUS","RWA","SAU","SDN","SEN","SGP","SGS","SHN","SJM","SLB","SLE","SLV","SMR","SOM","SPM",
  "SRB","SSD","STP","SUR","SVK","SVN","SWE","SWZ","SXM","SYC","SYR","TCA","TCD","TGO","THA","TJK","TKL",
  "TKM","TLS","TON","TTO","TUN","TUR","TUV","TWN","TZA","UGA","UKR","UMI","URY","USA","UZB","VAT","VCT",
  "VEN","VGB","VIR","VNM","VUT","WLF","WSM","YEM","ZAF","ZMB","ZWE"
];

async function fetchPip({ country, year, povline }){
  let pipUrl = `https://api.worldbank.org/pip/v1/pip?country=${country}&povline=${povline}&fill_gaps=true&welfare_type=all`;
  if (year) pipUrl = `https://api.worldbank.org/pip/v1/pip?country=${country}&year=${year}&povline=${povline}&fill_gaps=true&welfare_type=all`;

  const pipRes = await fetch(pipUrl);
  if (!pipRes.ok) throw new Error(`PIP error status ${pipRes.status}`);
  const pipData = await pipRes.json();
  const row = Array.isArray(pipData) ? pipData[0] : null;
  return {pipData, row};
}


function extractMetricAndMeta(row){
  const metric = {
    headcount: typeof row?.headcount === 'number' ? row.headcount : null,
    poverty_gap: typeof row?.poverty_gap === 'number' ? row.poverty_gap : null,
    poverty_severity: typeof row?.poverty_severity === 'number' ? row.poverty_severity : null,
  };

  const meta = {
    reporting_year: row?.reporting_year ?? null,
    welfare_type: row?.welfare_type ?? null,
    reporting_level: row?.reporting_level ?? null,
    estimate_type: row?.estimate_type ?? null,
    country_name: row?.country_name ?? null,
    country_code: row?.country_code ?? null,
    poverty_line: row?.poverty_line ?? null,
  }
  return {metric, meta};
}
// End of addition by Christella - 02/03/2026

// Defaults used by poverty endpoints - added by Christella 
const DEFAULT_POVLINE = 2.15;
const DEFAULT_YEAR = 2022;
const DEFAULT_MAX_AGE_DAYS = 30;

// /api/poverty - done by Christella - 12/05/2025
router.get('/', async(req, res) => {
  try{
    const db = getDb();
    const stats = await db.collection('povertyStats').find({}).toArray()
    res.json({
      success: true,
      stats,
    })
  } catch (err) {
    console.error('Error fetching poverty stats:', err)
    res.status(500).json({
      success: false,
      message: 'Error fetching poverty stats',
    })
  }
}) 

// Poverty live stats - done by Christella
router.get('/live', async (req, res) => {
  try {
    const country = String(req.query.country || '').toUpperCase().trim();
    const yearRaw = String(req.query.year || '').trim();
    const lineRaw =
      req.query.line !== undefined && req.query.line !== null
        ? String(req.query.line).trim()
        : '';

    if (!/^[A-Z]{3}$/.test(country)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a 3-letter ISO country code (e.g. USA)',
      });
    }

    let year = null;
    if (yearRaw) {
      year = Number.parseInt(yearRaw, 10);
      const currentYear = new Date().getUTCFullYear();
      if (!Number.isFinite(year) || year < 1960 || year > currentYear + 1) {
        return res.status(400).json({ success: false, message: 'Invalid year' });
      }
    }

    const povline = lineRaw ? Number.parseFloat(lineRaw) : DEFAULT_POVLINE;
    if (!Number.isFinite(povline) || povline <= 0 || povline > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid poverty line',
      });
    }

    const db = getDb();
    const cacheCollection = db.collection('povertyLiveStats');
    const cacheKey = year ? { country, year, povline } : { country, povline };

    const cached = await cacheCollection.findOne(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'MongoDB cache',
        country,
        year: cached.year ?? year,
        povline,
        fetchedAt: cached.fetchedAt,
        metric: cached.metric ?? null,
        meta: cached.meta ?? null,
        data: cached.data,
      });
    }

    // Fetch from PIP and store
    const yearToFetch = year ?? DEFAULT_YEAR;
    const { pipData, row } = await fetchPip({ country, year: yearToFetch, povline });
    const { metric, meta } = extractMetricAndMeta(row);

    const docToStore = {
      country,
      year: yearToFetch,
      povline,
      fetchedAt: new Date(),
      data: pipData,
      metric,
      meta,
    };

    await cacheCollection.updateOne(
      { country, year: yearToFetch, povline },
      { $set: docToStore },
      { upsert: true }
    );

    res.json({
      success: true,
      source: 'World Bank PIP (fresh)',
      country,
      year: yearToFetch,
      povline,
      fetchedAt: docToStore.fetchedAt,
      metric,
      meta,
      data: pipData,
    });
  } catch (err) {
    console.error('Error in /api/poverty/live:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching live poverty data',
    });
  }
});
// ===== End of addition by Christella - =====

// Returns poverty statistics from "povertyStats" collection. - added by Christella - 1/27/2026
router.get('/summary', async(req,res) => {
  try {
    const country = String(req.query.country || '').toUpperCase().trim();
    if (!/^[A-Z]{3}$/.test(country)){
      return res.status(400).json({success: false, message: 'country must be ISO3'});
    }

    const povline = Number(req.query.povline ?? DEFAULT_POVLINE);
    const maxAgeDays = Number(req.query.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS);

    if (!Number.isFinite(povline) || povline <= 0 || povline > 100) {
      return res.status(400).json({ success: false, message: 'Invalid povline'});
    }

    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    const db = getDb();
    const col = db.collection('povertyLiveStats');

    // Find most recent cached doc for country + poverty line
    const cached = await col
      .find({country, povline})
      .sort({year: -1, fetchedAt: -1})
      .limit(1)
      .next();
    
    if (cached && cached.fetchedAt && new Date(cached.fetchedAt) >= cutoff) {
      return res.json({
        success: true,
        source: 'MongoDB cache (PIP-backed)',
        country,
        year: cached.year ?? null,
        povline,
        fetchedAt: cached.fetchedAt,
        metric: cached.metric ?? null,
        meta: cached.meta ?? null,
        data: cached.data ?? null,
      });
    }

    const yearToFetch = cached?.year ?? DEFAULT_YEAR;

    const { pipData, row } = await fetchPip({ country, year: yearToFetch, povline });
    const { metric, meta } = extractMetricAndMeta(row);

    const docToStore = {
      country,
      povline,
      year: yearToFetch,
      fetchedAt: new Date(),
      data: pipData,
      metric,
      meta,
    };

    await col.updateOne({ country, povline, year: yearToFetch }, {$set: docToStore}, {upsert: true});

    return res.json({
      success: true,
      source: 'World Bank PIP (Fresh)',
      country,
      year: yearToFetch,
      povline,
      fetchedAt: docToStore.fetchedAt,
      metric,
      meta,
      data: pipData,
    });
  } catch (err) {
    console.error('Error in /api/poverty/summary:', err);
    res.status(500).json({ success: false, message: 'Server error'});
  }
});

router.get('/pip-map', async (req, res) => {
  try {
    const povline = Number(req.query.povline ?? DEFAULT_POVLINE);
    const year = Number(req.query.year ?? DEFAULT_YEAR);
    const maxAgeDays = Number(req.query.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS);

    if (!Number.isFinite(povline) || povline <= 0 || povline > 100) {
      return res.status(400).json({ success: false, message: 'Invalid povline' });
    }
    if (!Number.isFinite(year) || year < 1960 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Invalid year' });
    }

    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    const db = getDb();
    const col = db.collection('povertyLiveStats');

    const CONCURRENCY = 8;
    const rows = [];
    let idx = 0;

    // Worker pool to limit concurrent PIP API requests
    async function worker() {
      while (idx < ISO3_LIST.length) {
        const country = ISO3_LIST[idx++];
        const cacheKey = { country, povline, year };

        const cached = await col.findOne({ ...cacheKey, fetchedAt: { $gte: cutoff } });
        if (cached) {
          rows.push({
            country,
            year,
            povline,
            headcount:
              cached.metric?.headcount ??
              (Array.isArray(cached.data) ? cached.data[0]?.headcount : null),
            poverty_gap: cached.metric?.poverty_gap ?? null,
            poverty_severity: cached.metric?.poverty_severity ?? null,
            source: 'cache',
            fetchedAt: cached.fetchedAt,
          });
          continue;
        }

        try {
          const { pipData, row } = await fetchPip({ country, year, povline });
          const { metric, meta } = extractMetricAndMeta(row);

          const docToStore = {
            ...cacheKey,
            fetchedAt: new Date(),
            data: pipData,
            metric,
            meta,
          };

          // upsert to keep one doc per (country, year, povline)
          await col.updateOne(cacheKey, { $set: docToStore }, { upsert: true });

          rows.push({
            country,
            year,
            povline,
            headcount: metric.headcount,
            poverty_gap: metric.poverty_gap,
            poverty_severity: metric.poverty_severity,
            source: 'pip',
            fetchedAt: docToStore.fetchedAt,
          });
        } catch (e) {
          rows.push({
            country,
            year,
            povline,
            headcount: null,
            poverty_gap: null,
            poverty_severity: null,
            source: 'error',
            error: String(e?.message || e),
          });
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

    res.json({
      success: true,
      source: 'World Bank PIP (cached)',
      year,
      povline,
      maxAgeDays,
      rows,
    });
  } catch (err) {
    console.error('Error in /api/poverty/pip-map:', err);
    res.status(500).json({ success: false, message: 'Server error building map dataset' });
  }
});
// End of Christella's addition - 1/27/2026

// Added by Christella - 02/04/2026
router.get('/countries', async (req, res) => {
  try {
    // Uses ISO3_LIST already defined in this file
    const out = ISO3_LIST.map((iso3) => {
      let name = iso3;

      // If you have i18n-iso-countries available, use it for nicer labels
      try {
        // countriesLib was imported earlier
        // If not registered, fallback to ISO3
        if (countriesLib && typeof countriesLib.getName === 'function') {
          name = countriesLib.getName(iso3, 'en') || iso3;
        }
      } catch (e) {
        name = iso3;
      }

      return { iso3, name };
    });

    res.json(out);
  } catch (err) {
    console.error('Error in /api/poverty/countries:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;