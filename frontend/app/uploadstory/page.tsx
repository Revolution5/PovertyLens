'use client';

import { useState } from 'react';

const textBrown = '#623100';
const fieldBg = '#D7C6B4';
const pageBg = '#ffffff';
const BACKEND_URL = 'http://localhost:4000';

const COUNTRY_OPTIONS = [
    {code: '', name: 'Select a country (optional)'},
    {code: 'USA', name: 'United States'},
    {code: 'CAN', name: 'Canada'},
    {code: 'MEX', name: 'Mexico'},
    {code: 'BRA', name: 'Brazil'},
    {code: 'ARG', name: 'Argentina'},
    {code: 'GBR', name: 'United Kingdom'},
    {code: 'FRA', name: 'France'},
    {code: 'DEU', name: 'Germany'} // will add more later
]

export default function UploadStoryPage() {
    const [title, setTitle] = useState('');
    const [story, setStory] = useState('');
    const [country, setCountry] = useState('');
    const [displayName, setDisplayName] = useState(true);
    const [displayPhoto, setDisplayPhoto] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const wordCount = story.trim() ? story.trim().split(/\s+/).length : 0;    
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!story.trim()){
            setMessage('Please wrie a story before uploading.')
            return;
        }
        if (wordCount > 7000){
            setMessage('Unable to upload: your story is over 7,000 words.');
            return;
        }
        try {
            setIsSubmitting(true);
            const userEmail =
                typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
            
            const res = await fetch(`${BACKEND_URL}/api/stories`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    storyText: story,
                    displayName,
                    displayPhoto,
                    userEmail,
                    country,
                }),
            });
            const data = await res.json();
            
            if (!res.ok || !data.success){
                setMessage(data.message || 'Error: could not upload story.');
                return;
            }

            setMessage('Story uploaded successfully!');

            // Resets form
            setTitle('');
            setStory('');
            setCountry('');
            setDisplayName(true);
            setDisplayPhoto(true);
        } catch (err){
            console.error(err);
            setMessage('Error: could not connect to server while uploading story.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div
            style={{
                backgroundColor: pageBg,
                minHeight: '100vh',
                padding: '40px 80px 80px',
                color: textBrown,
            }}
        >
            {/* Heading */}
            <h1
                style={{
                    fontSize: 48,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 32,
                }}
            >
                Upload a Story
            </h1>
            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: 900,
                    margin: '0 auto',
                }}
            >
                {/* Title input */}
                <div style={{ marginBottom: 18 }}>
                    <input
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title here (optional)"
                        style={{
                            width:'100%',
                            padding: '14px 18px',
                            borderRadius: 16,
                            border: 'none',
                            backgroundColor: fieldBg,
                            fontSize: 16,
                            color: textBrown,
                            outline: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        }}
                    />    
                </div>
                {/* Country Dropdown for Statistics page */}
                <div style={{ marginBottom: 10}}>
                    <label style={{display: 'block', marginBottom: 8, fontWeight: 700}}>
                        Country (optional)
                    </label>
                    <select
                        value = {country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12 px 14px',
                            borderRadius: 12,
                            border: 'none',
                            backgroundColor: fieldBg,
                            fontSize: 16,
                            color: textBrown,
                            outline: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                            marginBottom: 4,
                            appearance: 'none' as const,
                        }}
                        aria-label="Select country"
                    >
                        {COUNTRY_OPTIONS.map((c) => (
                            <option key={c.code || 'none'} value={c.code}>
                                {c.code ? `${c.name} (${c.code})` : c.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Story Textures */}
                <div style={{ marginBottom: 10}}>
                    <textarea
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        placeholder='Type your story here (max. 7,000 words)'
                        style={{
                            width: '100%',
                            height: 260,
                            padding: '14px 18px',
                            borderRadius: 16,
                            border: 'none',
                            backgroundColor: fieldBg,
                            fontSize: 16,
                            color: textBrown,
                            outline: 'none',
                            resize: 'vertical',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        }}
                    />
                    <div
                        style={{
                            marginTop: 6,
                            fontSize: 13,
                            textAlign: 'right',
                            color: wordCount > 7000 ? '#b00020' : textBrown,
                        }}
                    >
                        {wordCount} / 7000 words
                    </div>
                </div>
                {/* Toggles for name and photo */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 120,
                        alignItems: 'center',
                        margin: '32px 0 26px',
                        fontSize: 16,
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <span>Display name?</span>
                        <ToggleSwitch
                            checked={displayName}
                            onChange={()  => setDisplayName((v) => !v)}
                        />
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <span>Display photo?</span>
                        <ToggleSwitch
                            checked={displayPhoto}
                            onChange={()  => setDisplayPhoto((v) => !v)}
                        />
                    </div>
                </div>
                {/* Status message */}
                {message && (
                    <div
                        style={{marginBottom: 16, textAlign: 'center', fontSize: 14}}
                    >
                        {message}
                    </div>
                )}
                {/*Upload button*/}
                <div style={{textAlign: 'center'}}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            fontSize: 20,
                            padding: '10px 60px',  
                            fontWeight: 700, 
                            color: '#fff', 
                            backgroundColor: '#a66532', 
                            borderRadius: 12, 
                            border: '2px solid #7a4520', 
                            boxShadow: '0 3px 4px rgba(0,0,0,0.2)', 
                            cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                            opacity: isSubmitting ? 0.7 : 1,
                        }}
                    >
                        {isSubmitting ? 'Uploading story...':'Upload'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Toggle switch
function ToggleSwitch({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: () => void;
}) {
    const trackColor = checked ? '#00c853' : '#cccccc';
    return (
        <button
            type="button"
            onClick={onChange}
            style={{
                width: 46,
                height: 24,
                borderRadius: 9999,
                border: 'none',
                padding: 2,
                backgroundColor: trackColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: checked ? 'flex-end' : 'flex-start',
                cursor: 'pointer',
            }}
        >
            <div
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
            />
        </button>
    );
}