// Added by Reymes 3/2/26 - National poverty rates and lines for tracked countries
// Includes poverty rates (% of population) and poverty line thresholds (annual income)

export interface NationalPovertyData {
  rate: number;        // Percentage of population in poverty
  povLine: number;     // Annual income poverty line threshold
  currency: string;    // Currency of poverty line
  year: number;        // Year data is from
  description: string; // Brief description of methodology
}

export const NATIONAL_POVERTY_RATES: Record<string, NationalPovertyData> = {
  // AFRICA
  "AGO": { rate: 32.3,  povLine: 187200,    currency: "AOA", year: 2022, description: "Interim national poverty rate estimate" },
  "BEN": { rate: 38.5,  povLine: 268800,    currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "BWA": { rate: 16.3,  povLine: 8640,      currency: "BWP", year: 2022, description: "Interim national poverty rate estimate" },
  "BFA": { rate: 40.1,  povLine: 273600,    currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "BDI": { rate: 65.0,  povLine: 576000,    currency: "BIF", year: 2022, description: "Interim national poverty rate estimate" },
  "CMR": { rate: 37.5,  povLine: 328800,    currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "CAF": { rate: 62.0,  povLine: 309600,    currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "TCD": { rate: 42.3,  povLine: 273600,    currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "COM": { rate: 42.4,  povLine: 250000,    currency: "KMF", year: 2022, description: "Interim national poverty rate estimate" },
  "COG": { rate: 39.2,  povLine: 312000,    currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "COD": { rate: 73.0,  povLine: 840000,    currency: "CDF", year: 2022, description: "Interim national poverty rate estimate" },
  "CIV": { rate: 39.4,  povLine: 312000,    currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "CPV": { rate: 35.0,  povLine: 57600,     currency: "CVE", year: 2022, description: "Interim national poverty rate estimate" },
  "DJI": { rate: 21.1,  povLine: 65000,     currency: "DJF", year: 2022, description: "Interim national poverty rate estimate" },
  "DZA": { rate: 5.5,   povLine: 67200,     currency: "DZD", year: 2022, description: "Interim national poverty rate estimate" },
  "EGY": { rate: 29.7,  povLine: 14640,     currency: "EGP", year: 2022, description: "Interim national poverty rate estimate" },
  "ERI": { rate: 69.0,  povLine: 15000,     currency: "ERN", year: 2022, description: "Interim national poverty rate estimate" },
  "ETH": { rate: 24.1,  povLine: 8760,      currency: "ETB", year: 2022, description: "Interim national poverty rate estimate" },
  "GAB": { rate: 33.0,  povLine: 319200,    currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "GHA": { rate: 24.2,  povLine: 10920,     currency: "GHS", year: 2022, description: "Interim national poverty rate estimate" },
  "GIN": { rate: 43.8,  povLine: 4560000,   currency: "GNF", year: 2022, description: "Interim national poverty rate estimate" },
  "GMB": { rate: 48.1,  povLine: 15360,     currency: "GMD", year: 2022, description: "Interim national poverty rate estimate" },
  "GNB": { rate: 69.3,  povLine: 100000,    currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "GNQ": { rate: 26.3,  povLine: 600000,    currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "KEN": { rate: 36.1,  povLine: 43800,     currency: "KES", year: 2022, description: "Interim national poverty rate estimate" },
  "LBR": { rate: 50.9,  povLine: 216000,    currency: "LRD", year: 2022, description: "Interim national poverty rate estimate" },
  "LBY": { rate: 21.9,  povLine: 1500,      currency: "LYD", year: 2022, description: "Interim national poverty rate estimate" },
  "LSO": { rate: 49.4,  povLine: 10560,     currency: "LSL", year: 2022, description: "Interim national poverty rate estimate" },
  "MAR": { rate: 4.8,   povLine: 9480,      currency: "MAD", year: 2022, description: "Interim national poverty rate estimate" },
  "MDG": { rate: 75.2,  povLine: 3650000,   currency: "MGA", year: 2022, description: "Interim national poverty rate estimate" },
  "MLI": { rate: 42.0,  povLine: 292800,    currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "MOZ": { rate: 63.0,  povLine: 43800,     currency: "MZN", year: 2022, description: "Interim national poverty rate estimate" },
  "MRT": { rate: 31.2,  povLine: 14640,     currency: "MRU", year: 2022, description: "Interim national poverty rate estimate" },
  "MUS": { rate: 10.3,  povLine: 63000,     currency: "MUR", year: 2022, description: "Interim national poverty rate estimate" },
  "MWI": { rate: 51.5,  povLine: 432000,    currency: "MWK", year: 2022, description: "Interim national poverty rate estimate" },
  "NAM": { rate: 18.0,  povLine: 10920,     currency: "NAD", year: 2022, description: "Interim national poverty rate estimate" },
  "NER": { rate: 44.2,  povLine: 273600,    currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "NGA": { rate: 40.1,  povLine: 153600,    currency: "NGN", year: 2022, description: "Interim national poverty rate estimate" },
  "RWA": { rate: 38.4,  povLine: 438000,    currency: "RWF", year: 2022, description: "Interim national poverty rate estimate" },
  "SDN": { rate: 46.0,  povLine: 456000,    currency: "SDG", year: 2022, description: "Interim national poverty rate estimate" },
  "SEN": { rate: 37.0,  povLine: 273600,    currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "SLE": { rate: 56.3,  povLine: 21600000,  currency: "SLL", year: 2022, description: "Interim national poverty rate estimate" },
  "SOM": { rate: 69.4,  povLine: 150000,    currency: "SOS", year: 2022, description: "Interim national poverty rate estimate" },
  "SSD": { rate: 76.4,  povLine: 5000,      currency: "SSP", year: 2022, description: "Interim national poverty rate estimate" },
  "STP": { rate: 40.6,  povLine: 18000,     currency: "STN", year: 2022, description: "Interim national poverty rate estimate" },
  "SWZ": { rate: 58.0,  povLine: 15600,     currency: "SZL", year: 2022, description: "Interim national poverty rate estimate" },
  "TGO": { rate: 45.0,  povLine: 273600,    currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "TUN": { rate: 16.0,  povLine: 6480,      currency: "TND", year: 2022, description: "Interim national poverty rate estimate" },
  "TZA": { rate: 26.4,  povLine: 438000,    currency: "TZS", year: 2022, description: "Interim national poverty rate estimate" },
  "UGA": { rate: 41.3,  povLine: 511000,    currency: "UGX", year: 2022, description: "Interim national poverty rate estimate" },
  "ZAF": { rate: 55.5,  povLine: 13440,     currency: "ZAR", year: 2022, description: "Interim national poverty rate estimate" },
  "ZMB": { rate: 54.4,  povLine: 10920,     currency: "ZMW", year: 2022, description: "Interim national poverty rate estimate" },
  "SYC": { rate: 25.3,  povLine: 72000,     currency: "SCR", year: 2022, description: "Interim national poverty rate estimate" },
  "ZWE": { rate: 39.2,  povLine: 3600,      currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },
  "ESH": { rate: 35.0,  povLine: 6000,      currency: "MAD", year: 2022, description: "Western Sahara - administered by Morocco, estimated" },
  "SOL": { rate: 54.0,  povLine: 1900000,   currency: "SOS", year: 2022, description: "Somaliland - estimated, similar to Somalia" },

  // ASIA
  "AFG": { rate: 69.4,  povLine: 14000,     currency: "AFN", year: 2022, description: "Interim national poverty rate estimate" },
  "ARE": { rate: 0.2,   povLine: 7200,      currency: "AED", year: 2022, description: "Interim national poverty rate estimate" },
  "ARM": { rate: 24.8,  povLine: 60000,     currency: "AMD", year: 2022, description: "Interim national poverty rate estimate" },
  "AZE": { rate: 8.0,   povLine: 2400,      currency: "AZN", year: 2022, description: "Interim national poverty rate estimate" },
  "BGD": { rate: 18.7,  povLine: 30000,     currency: "BDT", year: 2022, description: "Interim national poverty rate estimate" },
  "BRN": { rate: 0.4,   povLine: 1200,      currency: "BND", year: 2022, description: "Interim national poverty rate estimate" },
  "BTN": { rate: 12.0,  povLine: 9000,      currency: "BTN", year: 2022, description: "Interim national poverty rate estimate" },
  "CHN": { rate: 3.0,   povLine: 7500,      currency: "CNY", year: 2022, description: "Interim national poverty rate estimate" },
  "GEO": { rate: 20.6,  povLine: 2400,      currency: "GEL", year: 2022, description: "Interim national poverty rate estimate" },
  "IDN": { rate: 9.6,   povLine: 6480000,   currency: "IDR", year: 2022, description: "Interim national poverty rate estimate" },
  "IND": { rate: 21.9,  povLine: 19200,     currency: "INR", year: 2022, description: "Interim national poverty rate estimate" },
  "IRN": { rate: 18.7,  povLine: 72000000,  currency: "IRR", year: 2022, description: "Interim national poverty rate estimate" },
  "IRQ": { rate: 22.9,  povLine: 1080000,   currency: "IQD", year: 2022, description: "Interim national poverty rate estimate" },
  "ISR": { rate: 22.0,  povLine: 24000,     currency: "ILS", year: 2022, description: "Interim national poverty rate estimate" },
  "JOR": { rate: 15.7,  povLine: 2880,      currency: "JOD", year: 2022, description: "Interim national poverty rate estimate" },
  "JPN": { rate: 15.7,  povLine: 1728000,   currency: "JPY", year: 2021, description: "50% of median household income" },
  "KAZ": { rate: 5.2,   povLine: 144000,    currency: "KZT", year: 2022, description: "Interim national poverty rate estimate" },
  "KGZ": { rate: 33.3,  povLine: 36000,     currency: "KGS", year: 2022, description: "Interim national poverty rate estimate" },
  "KHM": { rate: 17.8,  povLine: 1700000,   currency: "KHR", year: 2022, description: "Interim national poverty rate estimate" },
  "KOR": { rate: 16.7,  povLine: 17900000,  currency: "KRW", year: 2021, description: "50% of median household income" },
  "KWT": { rate: 0.5,   povLine: 1800,      currency: "KWD", year: 2022, description: "Interim national poverty rate estimate" },
  "LAO": { rate: 18.3,  povLine: 2880000,   currency: "LAK", year: 2022, description: "Interim national poverty rate estimate" },
  "LBN": { rate: 82.0,  povLine: 18000000,  currency: "LBP", year: 2022, description: "Interim national poverty rate estimate" },
  "LKA": { rate: 14.3,  povLine: 10800,     currency: "LKR", year: 2022, description: "Interim national poverty rate estimate" },
  "MMR": { rate: 24.8,  povLine: 900000,    currency: "MMK", year: 2022, description: "Interim national poverty rate estimate" },
  "MNG": { rate: 28.4,  povLine: 540000,    currency: "MNT", year: 2022, description: "Interim national poverty rate estimate" },
  "MYS": { rate: 8.2,   povLine: 30000,     currency: "MYR", year: 2022, description: "Interim national poverty rate estimate" },
  "NPL": { rate: 20.3,  povLine: 19261,     currency: "NPR", year: 2022, description: "Interim national poverty rate estimate" },
  "OMN": { rate: 0.6,   povLine: 2400,      currency: "OMR", year: 2022, description: "Interim national poverty rate estimate" },
  "PAK": { rate: 39.4,  povLine: 25000,     currency: "PKR", year: 2022, description: "Interim national poverty rate estimate" },
  "PHL": { rate: 18.1,  povLine: 52000,     currency: "PHP", year: 2022, description: "Interim national poverty rate estimate" },
  "PRK": { rate: 42.4,  povLine: 600000,    currency: "KPW", year: 2022, description: "Interim national poverty rate estimate" },
  "PSE": { rate: 34.2,  povLine: 14400,     currency: "ILS", year: 2022, description: "Interim national poverty rate estimate" },
  "QAT": { rate: 0.1,   povLine: 9600,      currency: "QAR", year: 2022, description: "Interim national poverty rate estimate" },
  "SAU": { rate: 2.0,   povLine: 9600,      currency: "SAR", year: 2022, description: "Interim national poverty rate estimate" },
  "SGP": { rate: 6.1,   povLine: 18000,     currency: "SGD", year: 2022, description: "Interim national poverty rate estimate" },
  "SYR": { rate: 83.0,  povLine: 5040,      currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },
  "THA": { rate: 6.3,   povLine: 30000,     currency: "THB", year: 2022, description: "Interim national poverty rate estimate" },
  "TJK": { rate: 26.3,  povLine: 3600,      currency: "TJS", year: 2022, description: "Interim national poverty rate estimate" },
  "TKM": { rate: 0.2,   povLine: 1200,      currency: "TMT", year: 2022, description: "Interim national poverty rate estimate" },
  "TLS": { rate: 41.8,  povLine: 960,       currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },
  "TUR": { rate: 21.6,  povLine: 40000,     currency: "TRY", year: 2022, description: "Interim national poverty rate estimate" },
  "UZB": { rate: 17.0,  povLine: 5760000,   currency: "UZS", year: 2022, description: "Interim national poverty rate estimate" },
  "VNM": { rate: 11.3,  povLine: 15000000,  currency: "VND", year: 2022, description: "Interim national poverty rate estimate" },
  "BHR": { rate: 0.5,   povLine: 4800,      currency: "BHD", year: 2022, description: "Interim national poverty rate estimate" },
  "MDV": { rate: 8.2,   povLine: 60000,     currency: "MVR", year: 2022, description: "Interim national poverty rate estimate" },
  "TWN": { rate: 6.6,   povLine: 120000,    currency: "TWD", year: 2022, description: "Interim national poverty rate estimate" },
  "YEM": { rate: 74.2,  povLine: 540000,    currency: "YER", year: 2022, description: "Interim national poverty rate estimate" },

  // EUROPE
  "ALB": { rate: 22.0,  povLine: 36000,     currency: "ALL", year: 2022, description: "Interim national poverty rate estimate" },
  "AND": { rate: 3.5,   povLine: 9600,      currency: "EUR", year: 2022, description: "Interim national poverty rate estimate" },
  "AUT": { rate: 13.9,  povLine: 11544,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "BEL": { rate: 15.1,  povLine: 11256,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "BGR": { rate: 23.8,  povLine: 9000,      currency: "BGN", year: 2022, description: "60% of median equivalised income" },
  "BIH": { rate: 16.9,  povLine: 3600,      currency: "BAM", year: 2022, description: "Interim national poverty rate estimate" },
  "BLR": { rate: 5.7,   povLine: 3600,      currency: "BYN", year: 2022, description: "Interim national poverty rate estimate" },
  "CHE": { rate: 8.7,   povLine: 28800,     currency: "CHF", year: 2021, description: "SILC relative poverty line" },
  "CYP": { rate: 14.7,  povLine: 9600,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "CZE": { rate: 10.2,  povLine: 7200,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "DEU": { rate: 14.8,  povLine: 12300,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "DNK": { rate: 12.7,  povLine: 120000,    currency: "DKK", year: 2022, description: "60% of median equivalised income" },
  "ESP": { rate: 20.4,  povLine: 10089,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "EST": { rate: 16.4,  povLine: 8400,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "FIN": { rate: 12.7,  povLine: 14400,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "FRA": { rate: 14.5,  povLine: 11340,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "GBR": { rate: 18.0,  povLine: 12570,     currency: "GBP", year: 2022, description: "60% of median net household income" },
  "GRC": { rate: 20.9,  povLine: 6720,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "HRV": { rate: 19.3,  povLine: 9000,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "HUN": { rate: 12.3,  povLine: 1200000,   currency: "HUF", year: 2022, description: "60% of median equivalised income" },
  "IRL": { rate: 14.0,  povLine: 14064,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "ISL": { rate: 8.9,   povLine: 3600000,   currency: "ISK", year: 2022, description: "60% of median equivalised income" },
  "ITA": { rate: 20.1,  povLine: 10524,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "LTU": { rate: 18.7,  povLine: 7800,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "LUX": { rate: 17.4,  povLine: 24000,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "LVA": { rate: 23.4,  povLine: 7200,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "MDA": { rate: 25.1,  povLine: 24000,     currency: "MDL", year: 2022, description: "Interim national poverty rate estimate" },
  "MKD": { rate: 22.0,  povLine: 91000,     currency: "MKD", year: 2022, description: "Interim national poverty rate estimate" },
  "MLT": { rate: 16.7,  povLine: 10600,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "MNE": { rate: 24.5,  povLine: 3600,      currency: "EUR", year: 2022, description: "Interim national poverty rate estimate" },
  "NLD": { rate: 11.6,  povLine: 13680,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "NOR": { rate: 10.4,  povLine: 127680,    currency: "NOK", year: 2022, description: "60% of median equivalised income" },
  "POL": { rate: 11.8,  povLine: 7200,      currency: "PLN", year: 2022, description: "60% of median equivalised income" },
  "PRT": { rate: 17.0,  povLine: 7800,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "ROU": { rate: 21.4,  povLine: 8400,      currency: "RON", year: 2022, description: "60% of median equivalised income" },
  "RUS": { rate: 10.8,  povLine: 100000,    currency: "RUB", year: 2022, description: "Interim national poverty rate estimate" },
  "SRB": { rate: 24.3,  povLine: 120000,    currency: "RSD", year: 2022, description: "Interim national poverty rate estimate" },
  "SVK": { rate: 11.9,  povLine: 8400,      currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "SVN": { rate: 12.9,  povLine: 10800,     currency: "EUR", year: 2022, description: "60% of median equivalised income" },
  "SWE": { rate: 16.1,  povLine: 105600,    currency: "SEK", year: 2022, description: "60% of median equivalised income" },
  "LIE": { rate: 3.0,   povLine: 18000,     currency: "CHF", year: 2022, description: "Interim national poverty rate estimate" },
  "MCO": { rate: 0.0,   povLine: 24000,     currency: "EUR", year: 2022, description: "Interim national poverty rate estimate" },
  "SMR": { rate: 0.0,   povLine: 9600,      currency: "EUR", year: 2022, description: "Interim national poverty rate estimate" },
  "UKR": { rate: 25.6,  povLine: 21600,     currency: "UAH", year: 2022, description: "Interim national poverty rate estimate" },
  "XKX": { rate: 17.6,  povLine: 1800,      currency: "EUR", year: 2022, description: "Interim national poverty rate estimate" },
  "GRL": { rate: 0.6,   povLine: 180000,    currency: "DKK", year: 2022, description: "Greenland - Danish welfare system, estimated" },
  "VAT": { rate: 0.1,   povLine: 30000,     currency: "EUR", year: 2022, description: "Vatican City - essentially no poverty" },
  "NCY": { rate: 7.0,   povLine: 4800,      currency: "TRY", year: 2022, description: "Northern Cyprus - estimated" },

  // NORTH AMERICA & CARIBBEAN
  "BHS": { rate: 30.0,  povLine: 8400,      currency: "BSD", year: 2022, description: "Interim national poverty rate estimate" },
  "BLZ": { rate: 41.4,  povLine: 3600,      currency: "BZD", year: 2022, description: "Interim national poverty rate estimate" },
  "CAN": { rate: 9.4,   povLine: 17602,     currency: "CAD", year: 2022, description: "Statistics Canada Low Income Cut-Off" },
  "CRI": { rate: 26.1,  povLine: 180000,    currency: "CRC", year: 2022, description: "Interim national poverty rate estimate" },
  "CUB": { rate: 9.0,   povLine: 9600,      currency: "CUP", year: 2022, description: "Interim national poverty rate estimate" },
  "DOM": { rate: 22.8,  povLine: 48000,     currency: "DOP", year: 2022, description: "Interim national poverty rate estimate" },
  "GTM": { rate: 59.3,  povLine: 12000,     currency: "GTQ", year: 2022, description: "Interim national poverty rate estimate" },
  "HND": { rate: 39.9,  povLine: 24000,     currency: "HNL", year: 2022, description: "Interim national poverty rate estimate" },
  "HTI": { rate: 59.2,  povLine: 40000,     currency: "HTG", year: 2022, description: "Interim national poverty rate estimate" },
  "JAM": { rate: 11.4,  povLine: 84000,     currency: "JMD", year: 2022, description: "Interim national poverty rate estimate" },
  "MEX": { rate: 36.3,  povLine: 33000,     currency: "MXN", year: 2022, description: "Interim national poverty rate estimate" },
  "NIC": { rate: 24.9,  povLine: 12000,     currency: "NIO", year: 2022, description: "Interim national poverty rate estimate" },
  "PAN": { rate: 22.1,  povLine: 2400,      currency: "PAB", year: 2022, description: "Interim national poverty rate estimate" },
  "SLV": { rate: 26.4,  povLine: 48000,     currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },
  "TTO": { rate: 20.0,  povLine: 24000,     currency: "TTD", year: 2022, description: "Interim national poverty rate estimate" },
  "ATG": { rate: 25.0,  povLine: 18000,     currency: "XCD", year: 2022, description: "Interim national poverty rate estimate" },
  "BRB": { rate: 15.0,  povLine: 9600,      currency: "BBD", year: 2022, description: "Interim national poverty rate estimate" },
  "DMA": { rate: 29.2,  povLine: 8400,      currency: "XCD", year: 2022, description: "Interim national poverty rate estimate" },
  "GRD": { rate: 37.5,  povLine: 7200,      currency: "XCD", year: 2022, description: "Interim national poverty rate estimate" },
  "KNA": { rate: 22.9,  povLine: 12000,     currency: "XCD", year: 2022, description: "Interim national poverty rate estimate" },
  "LCA": { rate: 25.0,  povLine: 9600,      currency: "XCD", year: 2022, description: "Interim national poverty rate estimate" },
  "USA": { rate: 10.6,  povLine: 14580,     currency: "USD", year: 2023, description: "US Census Bureau poverty line (single adult)" },
  "PRI": { rate: 44.9,  povLine: 14580,     currency: "USD", year: 2022, description: "Puerto Rico - US territory, US federal poverty line" },
  "VCT": { rate: 30.2,  povLine: 8400,      currency: "XCD", year: 2022, description: "Interim national poverty rate estimate" },

  // SOUTH AMERICA
  "ARG": { rate: 40.1,  povLine: 480000,    currency: "ARS", year: 2022, description: "Interim national poverty rate estimate" },
  "BOL": { rate: 38.8,  povLine: 6000,      currency: "BOB", year: 2022, description: "Interim national poverty rate estimate" },
  "BRA": { rate: 29.0,  povLine: 8400,      currency: "BRL", year: 2022, description: "Interim national poverty rate estimate" },
  "CHL": { rate: 10.8,  povLine: 3000000,   currency: "CLP", year: 2022, description: "Interim national poverty rate estimate" },
  "COL": { rate: 39.3,  povLine: 10800000,  currency: "COP", year: 2022, description: "Interim national poverty rate estimate" },
  "ECU": { rate: 27.3,  povLine: 2400,      currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },
  "GUY": { rate: 35.0,  povLine: 480000,    currency: "GYD", year: 2022, description: "Interim national poverty rate estimate" },
  "PER": { rate: 29.0,  povLine: 3840,      currency: "PEN", year: 2022, description: "Interim national poverty rate estimate" },
  "PRY": { rate: 26.9,  povLine: 21600000,  currency: "PYG", year: 2022, description: "Interim national poverty rate estimate" },
  "SUR": { rate: 15.5,  povLine: 12000,     currency: "SRD", year: 2022, description: "Interim national poverty rate estimate" },
  "URY": { rate: 11.5,  povLine: 120000,    currency: "UYU", year: 2022, description: "Interim national poverty rate estimate" },
  "VEN": { rate: 94.5,  povLine: 1200,      currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },

  // OCEANIA
  "AUS": { rate: 13.4,  povLine: 19000,     currency: "AUD", year: 2021, description: "Henderson poverty line (single)" },
  "FJI": { rate: 24.1,  povLine: 3600,      currency: "FJD", year: 2022, description: "Interim national poverty rate estimate" },
  "NZL": { rate: 15.1,  povLine: 18000,     currency: "NZD", year: 2022, description: "Interim national poverty rate estimate" },
  "PNG": { rate: 39.4,  povLine: 12000,     currency: "PGK", year: 2022, description: "Interim national poverty rate estimate" },
  "SLB": { rate: 12.7,  povLine: 12000,     currency: "SBD", year: 2022, description: "Interim national poverty rate estimate" },
  "FSM": { rate: 41.2,  povLine: 1800,      currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },
  "KIR": { rate: 21.0,  povLine: 1080,      currency: "AUD", year: 2022, description: "Interim national poverty rate estimate" },
  "MHL": { rate: 35.0,  povLine: 1680,      currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },
  "NRU": { rate: 8.0,   povLine: 1200,      currency: "AUD", year: 2022, description: "Interim national poverty rate estimate" },
  "PLW": { rate: 24.9,  povLine: 2400,      currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },
  "TON": { rate: 20.6,  povLine: 2400,      currency: "TOP", year: 2022, description: "Interim national poverty rate estimate" },
  "TUV": { rate: 26.0,  povLine: 1200,      currency: "AUD", year: 2022, description: "Interim national poverty rate estimate" },
  "VUT": { rate: 13.0,  povLine: 240000,    currency: "VUV", year: 2022, description: "Interim national poverty rate estimate" },
  "WSM": { rate: 26.5,  povLine: 2400,      currency: "WST", year: 2022, description: "Interim national poverty rate estimate" },
};

export type NationalRateCountry = keyof typeof NATIONAL_POVERTY_RATES;

// Added by Reymes 3/2/26 - poverty rate as percentage
export function getNationalRate(iso3: string): number | null {
  const normalized = iso3.toUpperCase();
  const data = NATIONAL_POVERTY_RATES[normalized];
  return data?.rate ?? null;
}

// Added by Reymes 3/2/26 - national poverty data
export function getNationalPovertyData(iso3: string): NationalPovertyData | null {
  const normalized = iso3.toUpperCase();
  return NATIONAL_POVERTY_RATES[normalized] ?? null;
}

// Added by Reymes 3/2/26 - poverty line threshold
export function getNationalPovertyLine(iso3: string): { amount: number; currency: string } | null {
  const normalized = iso3.toUpperCase();
  const data = NATIONAL_POVERTY_RATES[normalized];
  return data ? { amount: data.povLine, currency: data.currency } : null;
}

export function hasNationalRate(iso3: string): boolean {
  return iso3.toUpperCase() in NATIONAL_POVERTY_RATES;
}
