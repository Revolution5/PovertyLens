'use client';

import { useState } from 'react';

type LiveResponse = {
    success: boolean;
    source?: string;
    country?: string;
    year?: number;
    povline?: number;
    fetchedAt?: string;
    data?: any;
    message?: string;
};

const BACKEND_URL = 'http://localhost:4000';

export default function PovertyLivePage(){
    const [country, setCountry] = useState('');
    const [year, setYear] = useState('');
    const [line, setLine] = useState('');
    const [result, setResult] = useState<LiveResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const darkerText = { color: "#623100", fontSize: "16px", fontWeight: 600, textAlign: "left" as const};

    const inputStyle = {
        width: "100%",
        padding: "10px",
        fontSize: "15px",
        border: "1px solid #333",
        borderRadius: 6,
        color: "#000",
        backgroundColor: "#fff",
    };

    const handleFetch = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const url = `${BACKEND_URL}/api/poverty/live?country=${country}&year=${year}&line=${line}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok || !data.success){
                throw new Error(data.message || 'Error fetching live poverty data');
            }

            setResult(data);
        } catch (e: any){
            console.error(e);
            setError(e.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px'}}>
            <h1 style={{ marginBottom: 16, color:"#623100", fontSize:"70px",fontWeight:"bolder", textAlign:"center"}}>
                Statistics
            </h1>
            <p style={{ marginBottom: 24, color: '#623100', fontSize: "30px", textAlign:"-webkit-left"}}>
                This calls the backend <code>/api/poverty/live</code>, which fetches from the World Bank PIP API and stores the result in MongoDB as a cache.
            </p>

            <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxWidth: '400px'}}>
                <label style={darkerText}>Country (ISO3):</label>
                    <input 
                        value={country}
                        onChange={(e) => setCountry(e.target.value.toUpperCase())}
                        style={{ width: '100%', padding: '8px', fontSize: "15px", border: "1px solid #444", borderRadius: 6, color: "#623100",}}
                        placeholder=""
                    />
                <label style={darkerText}>Year:</label>
                    <input 
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        style={{ width: '100%', padding: '8px', fontSize: "15px", border: "1px solid #444", borderRadius: 6, color: "#000",}}
                        placeholder=""
                    />
                <label style={darkerText}>Poverty Line (USD/day)</label>
                    <input
                        value={line}
                        onChange={(e) => setLine(e.target.value)}
                        style={{ width: '100%', padding: '8px', fontSize: "15px", border: "1px solid #444", borderRadius: 6, color: "#000",}}
                        placeholder=""
                    />

                <button
                    onClick={handleFetch}
                    disabled={loading}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: "#AC7F5E",
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                    }}
                >
                    {loading ? 'Loading...' : 'Fetch & Cache Live Data'}
                </button>
            </div>
            {error && (
                <div style={{ marginBottom: 16, color: 'red', fontWeight: 600}}>
                    {error}
                </div>
            )}

            {result && (
                <div
                    style={{
                        marginTop: 16,
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #333',
                        background: '#f2f2f2',
                        color: "#111",
                        fontSize: "16px"
                    }}
                >
                    <h2 style={{ marginTop: 0, marginBottom: 8}}>Result</h2>
                    <p style={{ margin: '4px 0'}}>
                        <strong>Source:</strong> {result.source}
                    </p>
                    <p style={{ margin: '4px 0'}}>
                       <strong>Country:</strong>  {result.country} | <strong>Year:</strong> {result.year} |{' '}
                       <strong>Poverty line:</strong> ${result.povline}/day
                    </p>
                    {result.fetchedAt && (
                        <p style={{ margin: '4x 0'}}>
                            <strong>Fetched at:</strong> {new Date(result.fetchedAt).toLocaleString()}
                        </p>
                    )}

                    <details style={{ marginTop: 12}}>
                        <summary style={{ cursor: 'pointer' }}>Raw JSON data</summary>
                        <pre
                            style={{
                                background: "#f5f5f5",
                                padding: '12px',
                                borderRadius: 6,
                                border: "1px solid #ccc",
                                overflowX: 'auto',
                                fontSize: '12px',
                                marginTop: 8,
                                color: "#000",
                            }}
                        >
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
}
