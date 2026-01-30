'use client';

import { useEffect, useState } from 'react';

const BACKEND_URL = 'http://localhost:4000';
const cardBg = '#D7C6B4';
const textBrown = '#623100';
const pageBg = '#ffffff';

type Story = {
    _id: string;
    title: string;
    storyText: string;
    displayName: boolean;
    displayPhoto: boolean;
    createdAt?: string;
    archived?: boolean;
};

export default function ViewStoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [editTitle, setEditTitle] = useState('');
    const [editText, setEditText] = useState('');
    const [editDisplayName, setEditDisplayName] = useState(true);
    const [editDisplayPhoto, setEditDisplayPhoto] = useState(true);
    const [savingEdit, setSavingEdit] = useState(false);

    const selectedStory = stories[selectedIndex];

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail'):null;
                if (!userEmail){
                    setMessage('You must be logged in to view your stories.');
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${BACKEND_URL}/api/stories?userEmail=${encodeURIComponent(userEmail)}&includeArchived=true`);
                const data = await res.json();

                if (!res.ok || !data.success){
                    setMessage(data.message || 'Error fetching stories.');
                    setLoading(false);
                    return;
                }

                setStories(data.stories || []);
                setSelectedIndex(0);
                setMessage(null);
            } catch (err) {
                console.error(err);
                setMessage('Error connecting to server to fetch stories');
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    // Prefill fields when user enters edit mode
    useEffect(() => {
        if(selectedStory && editing){
            setEditTitle(selectedStory.title || '');
            setEditText(selectedStory.storyText || '');
            setEditDisplayName(selectedStory.displayName);
            setEditDisplayPhoto(selectedStory.displayPhoto);
        }
    }, [selectedStory, editing]);

    const startEdit = () => {
        if (!selectedStory) return;
        setEditing(true);
        setMessage(null);
    };

    const cancelEdit = () => {
        setEditing(false);
        setMessage(null);
    };

    const handleSaveEdit = async () => {
        if (!selectedStory) return;

        if (!editText.trim()){
            setMessage('Story text cannot be empty.');
            return;
        }
        const words = editText.trim().split(/\s+/).length;
        if (words > 7000){
            setMessage('Story exceeds 7,000 word limit.');
            return;
        }

        try {
            setSavingEdit(true);
            const res = await fetch(`${BACKEND_URL}/api/stories/${selectedStory._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: editTitle,
                    storyText: editText,
                    displayName: editDisplayName,
                    displayPhoto: editDisplayPhoto,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setMessage(data.message || 'Error saving changes.');
                setSavingEdit(false);
                return;
            }

            // Updating the local list
            const updated = [...stories];
            updated[selectedIndex] = {
                ...selectedStory,
                title: editTitle,
                storyText: editText,
                displayName: editDisplayName,
                displayPhoto: editDisplayPhoto,
            };
            setStories(updated);
            setMessage('Changes saved successfully!');
            setEditing(false);
        } catch (err) {
            console.error(err);
            setMessage('Error connecting to server to save changes.');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleArchive = async () => {
        if (!selectedStory) return;

        const newArchived = !selectedStory.archived;

        const confirmed = window.confirm(newArchived ?
            'Are you sure you want to archive this story?\nYou will still be able to access it later on.' : 'Are you sure you want to unarchive this story?');
        if (!confirmed) return;
        try {
            console.log('Sending archive state:', newArchived);
            const res = await fetch(`${BACKEND_URL}/api/stories/${selectedStory._id}/archive`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archived: newArchived}),
                }                
            );
            const data = await res.json();

            if (!res.ok || !data.success){
                setMessage(data.message || 'Error archiving story.');
                return;
            }

            // Update list on the user's page
            const updated = [...stories];
            updated[selectedIndex] = { ...selectedStory, archived: newArchived };
            setStories(updated);
            setEditing(false);
            setMessage(newArchived ? 'Story archived successfully.' : 'Story unarchived successfully.');
        } catch (err) {
            console.error(err);
            setMessage('Error connecting to server to update archive status.');
        }
    };

    const handleDelete = async () => {
        if (!selectedStory) return;
        const confirmed = window.confirm('Are you sure you want to delete this story?\n This action CANNOT be undone.');
        if (!confirmed) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/stories/${selectedStory._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (!res.ok || !data.success){
                setMessage(data.message || 'Error deleting story.');
                return;
            }

            // Remove from the UI list on the user's page
            const updated = stories.filter((_, idx) => idx !== selectedIndex);
            setStories(updated);
            setSelectedIndex(0);
            setEditing(false);
            setMessage('Story deleted.');
        } catch (err) {
            console.error(err);
            setMessage('Error connecting to server to archive story.');
        }
    };
    const handleReturn = () => {
        if (typeof window !== 'undefined'){
            if (window.history.length > 1) window.history.back();
            else window.location.href = '/';
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
                View your Stories
            </h1>
            {loading && <p style={{ textAlign: 'center'}}>Loading your stories...</p>}

            {!loading && stories.length === 0 && (<p style={{ textAlign: 'center' }}>You have not uploaded any stories</p>)}
                <div
                    style={{display: 'grid', gridTemplateColumns: '2.2fr 0.8fr', gap: 24, alignItems: 'flex-start',}}
                >
                    <div>
                        {!editing && selectedStory && (<div style={{backgroundColor: cardBg, borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', minHeight: 260, marginBottom: 18}}>
                            <h2
                                style={{fontSize: 24, margin: '0 0 12px 0'}}
                            >
                                {selectedStory.title || 'Story'}
                            </h2>
                            <p style={{margin: 0, fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap',}}> {selectedStory.storyText} </p>
                        </div>
                    )}

                    {editing && selectedStory && (
                        <div style={{backgroundColor: cardBg, borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 4px 4gba(0,0,0.15)', marginBottom: 18,}}>
                            <h2 style={{fontSize: 26, margin: '0 0 16px 0', textAlign: 'center'}}>Edit your story</h2>
                            <div style={{ marginBottom: 12}}>
                                <input
                                    type='text'
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Enter a title here (optional)"
                                    style={{
                                        width:'100%',
                                        padding: '10px 12px',
                                        borderRadius: 16,
                                        border: 'none',
                                        backgroundColor: '#e3cfb9',
                                        fontSize: 16,
                                        color: textBrown,
                                        outline: 'none',
                                        marginBottom: 12,
                                    }}
                                />
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    placeholder='Type your story here (max. 7,000 words)'
                                    style={{
                                        width: '100%',
                                        height: 260,
                                        padding: '14px 18px',
                                        borderRadius: 16,
                                        border: 'none',
                                        backgroundColor: '#e3cfb9',
                                        fontSize: 16,
                                        color: textBrown,
                                        outline: 'none',
                                        resize: 'vertical',
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 80,
                                    alignItems: 'center',
                                    marginBottom: 16,
                                }}
                            >
                                <ToggleRow
                                    label = "Display name?"
                                    checked={editDisplayName}
                                    onToggle={()  => setEditDisplayName((v) => !v)}
                                />
                                <ToggleRow
                                    label = "Display photo?"
                                    checked={editDisplayPhoto}
                                    onToggle={()  => setEditDisplayPhoto((v) => !v)}
                                />
                            </div>
                            <div style={{ textAlign: 'center', marginTop: 8}}>
                                <button
                                    type='button'
                                    disabled={savingEdit}
                                    onClick = {handleSaveEdit}
                                    style={{padding: '8px 40px', fontSize: 16, fontWeight: 700, color: '#fff', backgroundColor: '#a66532', borderRadius: 10, border: '2px solid #7a4520', boxShadow: '0 3px 4px rgba(0,0,0,0.2)', cursor: savingEdit ? 'not-allowed' : 'pointer', marginRight: 12,}}
                                >
                                    {savingEdit ? 'Saving story...' : 'Upload Changes'}
                                </button>

                                <button
                                    type='button'
                                    onClick={cancelEdit}
                                    style={{padding: '8px 24px', fontSize: 14, fontWeight: 600, color: textBrown, backgroundColor: '#f2e4d5', borderRadius: 10, border: '1px solid #b18a64', cursor: 'pointer'}}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    {!editing && selectedStory && (
                        <div
                            style={{display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24,}}
                        >
                            <ActionButton label='Edit' onClick = {startEdit} />
                            <ActionButton label={selectedStory?.archived ? 'Unarchive' : 'Archive'} onClick = {handleArchive} />
                            <ActionButton label='Delete' onClick = {handleDelete} variant="danger" />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleReturn}
                        style={{padding: '8px 24px', fontSize: 16, fontWeight: 600, color: textBrown, backgroundColor: '#d7c6b4', borderRadius: 10, border: '1px solid #b18a64', cursor: 'pointer'}}
                    > 
                        Return
                      </button>
                    </div>
                    <div>
                        <h3
                            style={{fontSize: 20, marginBottom: 10, textAlign: 'center'}}
                        >Your Stories</h3>
                        <div
                            style={{backgroundColor: cardBg, borderRadius: 16, padding: '10px 12px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',}}
                        >
                            {stories.map((story, idx) => (
                                <button
                                    key={story._id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedIndex(idx);
                                        setEditing(false);
                                        setMessage(null);
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '6px 8px',
                                        marginBottom: 4,
                                        borderRadius: 8,
                                        border: 'none',
                                        backgroundColor: idx === selectedIndex ? '#e8d6c2':'transparent',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                    }}
                                >
                                    {story.title || `Story ${stories.length - idx}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>                  
            </div>
        );
    }

// Toggle
function ToggleRow({
    label,
    checked,
    onToggle,
}: {
    label: string;
    checked: boolean;
    onToggle: () => void;
}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span>{label}</span>
            <ToggleSwitch checked={checked} onChange={onToggle} />
        </div>
    );
}

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

function ActionButton({
    label,
    onClick,
    variant = 'normal',
}:{
    label: string;
    onClick:() => void;
    variant?: 'normal' | 'danger';
}) {
    const isDanger = variant === 'danger';
    return(
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '8px 24px',
                fontSize: 15,
                fontWeight: 700,
                color: isDanger ? '#fff':textBrown,
                backgroundColor: isDanger ? '#b00020' : '#d7c6b4',
                borderRadius: 10,
                border: `1px solid ${isDanger ? '#7d0016':'#b18a64'}`,
                cursor: 'pointer',
            }}
        >{label}</button>
    );
}