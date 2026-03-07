// Created by Christella - 12/10/2025
'use client';

import { useEffect, useState } from 'react';

const BACKEND_URL = 'http://localhost:4000';

// Sets the types of each component
type Story = {
    _id: string;
    title: string;
    storyText: string;
    displayName: boolean;
    displayPhoto: boolean;
    createdAt?: string;
    updatedAt?: string; // Added for "updated story" date/time
    archived?: boolean;
    published?: boolean; // Added to show "published" status
};

// Formats date for "date posted" - added by Christella - 1/30/2026
function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// Formats time for "last updated" time  - added by Christella - 1/30/2026
function formatDateTime(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

// Sets the constants for the view stories page
export default function ViewStoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'all'>('active');  // Added by Christella - 1/30/2026
    const [isOffline, setIsOffline] = useState(false);

    const [editTitle, setEditTitle] = useState('');
    const [editText, setEditText] = useState('');
    const [editDisplayName, setEditDisplayName] = useState(true);
    const [editDisplayPhoto, setEditDisplayPhoto] = useState(true);
    const [savingEdit, setSavingEdit] = useState(false);
{/* ============== Marisol Morales Code 2/8/2026 - Dark Mode Start ============== */}
    // Track dark mode state
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial dark mode state
        setIsDark(document.documentElement.classList.contains('dark'));

        // Create observer to detect theme changes
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });

        // Watch for class attribute changes on html element
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Clean up observer on component unmount
        return () => observer.disconnect();
    }, []);
{/* ============== Marisol Morales Code 2/8/2026 - Dark Mode End ============== */}
    const selectedStory = stories[selectedIndex];

    // edited by daniel q. - 3/7/26 - added offline support and caching start
    useEffect(() => {
        const loadStories = async () => {
            try {
                const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null; // Added by Christella - 1/30/2026
                if (!userEmail) {
                    setMessage('You must be logged in to view your stories.');
                    setLoading(false);
                    return;
                }

                const cacheKey = `stories_${userEmail}`;
                const cachedStories = localStorage.getItem(cacheKey);
                
                if (cachedStories) {
                    try {
                        const parsed = JSON.parse(cachedStories);
                        setStories(parsed);
                        setSelectedIndex(0);
                        setIsOffline(true);
                    } catch (e) {
                        console.error('Error parsing cached stories:', e);
                    }
                }

                const res = await fetch(`${BACKEND_URL}/api/stories?userEmail=${encodeURIComponent(userEmail)}&includeArchived=true`)
                    .catch(() => null);
                
                if (res && res.ok) {
                    const data = await res.json();
                    
                    if (data.success && data.stories) {
                        setStories(data.stories);
                        setSelectedIndex(0);
                        setIsOffline(false);
                        
                        localStorage.setItem(cacheKey, JSON.stringify(data.stories));
                    }
                } else {
                    if (cachedStories) {
                        setMessage('You are currently offline. Showing cached stories.');
                    } else {
                        setMessage('Unable to connect to server and no cached stories found.');
                    }
                }
            } catch (err) {
                console.error('Error in loadStories:', err);
                setMessage('Error loading stories. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        loadStories();
    }, []);
    // edited by daniel q. - 3/7/26 - added offline support and caching end

    useEffect(() => {
        if (selectedStory && editing) {
            setEditTitle(selectedStory.title || '');
            setEditText(selectedStory.storyText || '');
            setEditDisplayName(selectedStory.displayName);
            setEditDisplayPhoto(selectedStory.displayPhoto);
        }
    }, [selectedStory, editing]);

    // Sets a timer for "success" message to go away  - added by Christella - 1/30/2026
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Handles edit feature
    const startEdit = () => {
        if (!selectedStory) return;
        setEditing(true);
        setMessage(null);
    };

    // Handles cancel feature
    const cancelEdit = () => {
        setEditing(false);
        setMessage(null);
    };

    // Handles saving edits to the stories
    const handleSaveEdit = async () => {
        if (!selectedStory) return;

        if (!editText.trim()) {
            setMessage('Story text cannot be empty.');
            return;
        }
        const words = editText.trim().split(/\s+/).length;
        if (words > 7000) {
            setMessage('Story exceeds 7,000 word limit.');
            return;
        }

        if (isOffline) {

            const pendingEdits = JSON.parse(localStorage.getItem('pendingEdits') || '[]');
            pendingEdits.push({
                storyId: selectedStory._id,
                title: editTitle,
                storyText: editText,
                displayName: editDisplayName,
                displayPhoto: editDisplayPhoto,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('pendingEdits', JSON.stringify(pendingEdits));
            
            const updated = [...stories];
            updated[selectedIndex] = {
                ...selectedStory,
                title: editTitle,
                storyText: editText,
                displayName: editDisplayName,
                displayPhoto: editDisplayPhoto,
                updatedAt: new Date().toISOString(),
            };
            setStories(updated);
            setMessage('Changes saved locally. They will sync when you\'re back online.');
            setEditing(false);
            return;
        }

        try {
            setSavingEdit(true);
            const res = await fetch(`${BACKEND_URL}/api/stories/${selectedStory._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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

            const updated = [...stories];
            updated[selectedIndex] = {
                ...selectedStory,
                title: editTitle,
                storyText: editText,
                displayName: editDisplayName,
                displayPhoto: editDisplayPhoto,
                updatedAt: data.story?.updatedAt || new Date().toISOString(),
            };
            setStories(updated);
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                localStorage.setItem(`stories_${userEmail}`, JSON.stringify(updated));
            }
            setMessage('Changes saved successfully!');
            setEditing(false);
        } catch (err) {
            console.error(err);
            setMessage('Error connecting to server to save changes.');
        } finally {
            setSavingEdit(false);
        }
    };

    // Handles archiving the story and ensures that it is updated in the database
    const handleArchive = async () => {
        if (!selectedStory) return;

        const newArchived = !selectedStory.archived;

        const confirmed = window.confirm(newArchived ?
            'Are you sure you want to archive this story?\nYou will still be able to access it later on.' : 'Are you sure you want to unarchive this story?');
        if (!confirmed) return;

        if (isOffline) {
            const pendingArchives = JSON.parse(localStorage.getItem('pendingArchives') || '[]');
            pendingArchives.push({
                storyId: selectedStory._id,
                archived: newArchived,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('pendingArchives', JSON.stringify(pendingArchives));
            
            const updated = [...stories];
            updated[selectedIndex] = { ...selectedStory, archived: newArchived };
            setStories(updated);
            setMessage(`Story marked as ${newArchived ? 'archived' : 'unarchived'} locally. Will sync when online.`);
            setEditing(false);
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/stories/${selectedStory._id}/archive`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archived: newArchived }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setMessage(data.message || 'Error archiving story.');
                return;
            }

            const updated = [...stories];
            updated[selectedIndex] = { ...selectedStory, archived: newArchived };
            setStories(updated);
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                localStorage.setItem(`stories_${userEmail}`, JSON.stringify(updated));
            }
            setEditing(false);
            setMessage(newArchived ? 'Story archived successfully.' : 'Story unarchived successfully.');
        } catch (err) {
            console.error(err);
            setMessage('Error connecting to server to update archive status.');
        }
    };

    // Handles delete and confirms with user prior to removal from database - added by Christella - 1/30/2026
    const handleDelete = async (storyId?: string) => {
        const targetStory = storyId ? stories.find(s => s._id === storyId) : selectedStory;
        if (!targetStory) return;
       
        const confirmed = window.confirm('Are you sure you want to delete this story?\nThis action CANNOT be undone.');
        if (!confirmed) return;

        if (isOffline) {
            const pendingDeletes = JSON.parse(localStorage.getItem('pendingDeletes') || '[]');
            pendingDeletes.push({
                storyId: targetStory._id,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('pendingDeletes', JSON.stringify(pendingDeletes));
            
            const updated = stories.filter((s) => s._id !== targetStory._id);
            setStories(updated);
            setSelectedIndex(0);
            setEditing(false);
            setMessage('Story marked for deletion. Will be deleted when online.');
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/stories/${targetStory._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setMessage(data.message || 'Error deleting story.');
                return;
            }

            const updated = stories.filter((s) => s._id !== targetStory._id);
            setStories(updated);
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                localStorage.setItem(`stories_${userEmail}`, JSON.stringify(updated));
            }
            setSelectedIndex(0);
            setEditing(false);
            setMessage('Story deleted.');
        } catch (err) {
            console.error(err);
            setMessage('Error connecting to server to delete story.');
        }
    };

    const handleReturn = () => {
        if (typeof window !== 'undefined') {
            if (window.history.length > 1) window.history.back();
            else window.location.href = '/';
        }
    };

    // Filter stories based on active tab  - added by Christella - 1/30/2026
    const filteredStories = stories.filter(story => {
        if (activeTab === 'active') return !story.archived;
        if (activeTab === 'archived') return story.archived;
        return true; 
    });

    // Edited by Christella - 1/30/2026
    return (
        <div style={{
            minHeight: '100vh',
            background: isDark ? 'var(--background)' : '#ffffff', // Changed by Marisol - 2/8/2026 for Dark Mode
            padding: '2rem',
        }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
                {/* Header - edited by daniel q. 3/7/26 start */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            padding: '0.5rem',
                            background: '#8CE4FF',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                            </svg>
                        </div>
                        <h1 style={{
                            fontSize: '2.25rem',
                            fontWeight: 700,
                            color: isDark ? 'var(--foreground)' : '#1a1a1a', // Changed by Marisol for Dark Mode - 2/8/2026
                        }}>
                            Your Stories
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ color: isDark ? 'var(--color-gray)' : '#333', fontSize: '1rem' }}> {/* Changed by Marisol for Dark Mode - 2/8/2026*/}
                            Manage all your published and draft stories in one place
                        </p>
                        {isOffline && (
                            <span style={{
                                background: '#726556',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}>
                                Offline Mode - Changes saved locally
                            </span>
                        )}
                    </div> {/*- edited by daniel q. 3/7/26 end */}
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: isDark ? 'var(--color-gray)' : '#666' }}>
                        <p>Loading your stories...</p>
                    </div>
                )}

                {!loading && stories.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: isDark ? 'var(--color-gray)' : '#666' }}>
                        <p>You have not uploaded any stories</p>
                    </div>
                )}

                {!loading && stories.length > 0 && (
                    <>
                        {/* Tabs */}
                        <div style={{
                            marginBottom: '1.5rem',
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)', // Changed by Marisol for Dark Mode - 2/8/2026
                            backdropFilter: 'blur(8px)',
                            borderRadius: '0.75rem',
                            padding: '0.25rem',
                            display: 'inline-flex',
                            gap: '0.25rem',
                            border: `1px solid ${isDark ? 'rgba(140, 228, 255, 0.2)' : 'rgba(140, 228, 255, 0.3)'}`, // Changed by Marisol for Dark Mode - 2/8/2026
                        }}>
                            <TabButton
                                active={activeTab === 'active'}
                                onClick={() => {
                                    setActiveTab('active');
                                    setEditing(false);
                                    setSelectedIndex(0);
                                }}
                                color="#8CE4FF"
                                isDark={isDark} // Changed by Marisol for Dark Mode - 2/8/2026
                            >
                                Active Stories ({stories.filter(s => !s.archived).length})
                            </TabButton>
                            <TabButton
                                active={activeTab === 'archived'}
                                onClick={() => {
                                    setActiveTab('archived');
                                    setEditing(false);
                                    setSelectedIndex(0);
                                }}
                                color="#FEEE91"
                                isDark={isDark} // Changed by Marisol for Dark Mode - 2/8/2026
                            >
                                Archived ({stories.filter(s => s.archived).length})
                            </TabButton>
                            <TabButton
                                active={activeTab === 'all'}
                                onClick={() => {
                                    setActiveTab('all');
                                    setEditing(false);
                                    setSelectedIndex(0);
                                }}
                                color="#FFA239"
                                isDark={isDark} // Changed by Marisol for Dark Mode - 2/8/2026
                            >
                                All Stories ({stories.length})
                            </TabButton>
                        </div>

                        {/* Message Toast */}
                        {message && (
                            <div style={{
                                marginBottom: '1rem',
                                padding: '1rem 1.5rem',
                                background: message.includes('Error') || message.includes('cannot') || message.includes('exceeds')
                                    ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#ffebee') // Changed by Marisol for Dark Mode - 2/8/2026
                                    : (isDark ? 'rgba(34, 197, 94, 0.2)' : '#e8f5e9'), // Changed by Marisol for Dark Mode - 2/8/2026
                                border: `2px solid ${message.includes('Error') || message.includes('cannot') || message.includes('exceeds')
                                    ? (isDark ? 'rgba(239, 68, 68, 0.4)' : '#ef5350') // Changed by Marisol for Dark Mode - 2/8/2026
                                    : (isDark ? 'rgba(34, 197, 94, 0.4)' : '#66bb6a')}`, // Changed by Marisol for Dark Mode - 2/8/2026
                                borderRadius: '0.75rem',
                                color: isDark ? 'var(--foreground)' : '#333', // Changed by Marisol for Dark Mode - 2/8/2026
                                fontSize: '0.95rem',
                                fontWeight: 500,
                            }}>
                                {message}
                            </div>
                        )}

                        {/* Main Content Area */}
                        <div>
                            {filteredStories.length === 0 ? (
                                <div style={{
                                    background: isDark ? 'var(--background)' : 'white', // Changed by Marisol for Dark Mode - 2/8/2026
                                    borderRadius: '1rem',
                                    padding: '3rem',
                                    textAlign: 'center',
                                    color: isDark ? 'var(--color-gray)' : '#666',// Changed by Marisol for Dark Mode - 2/8/2026
                                    boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)', // Changed by Marisol for Dark Mode - 2/8/2026
                                }}>
                                    <p>No {activeTab} stories found</p>
                                </div>
                            ) : (
                                <>
                                    {editing && selectedStory ? (
                                        <div style={{
                                            background: isDark ? 'var(--background)' : 'white', 
                                            borderRadius: '1rem',
                                            padding: '2rem',
                                            boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)', // Changed by Marisol for Dark Mode - 2/8/2026
                                            marginBottom: '1.5rem',
                                            border: '2px solid #FFA239',
                                        }}>
                                            <h2 style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                margin: '0 0 1.5rem 0',
                                                textAlign: 'center',
                                                color: isDark ? 'var(--foreground)' : '#1a1a1a', // Changed by Marisol for Dark Mode - 2/8/2026
                                            }}>
                                                Edit Your Story
                                            </h2>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    placeholder="Enter a title here (optional)"
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.875rem 1rem',
                                                        borderRadius: '0.75rem',
                                                        border: `2px solid ${isDark ? 'var(--color-gray-light)' : '#e0e0e0'}`, // Changed by Marisol for Dark Mode - 2/8/2026
                                                        fontSize: '1rem',
                                                        color: isDark ? 'var(--foreground)' : '#1a1a1a', // Changed by Marisol for Dark Mode - 2/8/2026
                                                        backgroundColor: isDark ? 'var(--background)' : '#ffffff', // Changed by Marisol for Dark Mode - 2/8/2026
                                                        outline: 'none',
                                                        marginBottom: '1rem',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#8CE4FF'}
                                                    onBlur={(e) => e.target.style.borderColor = isDark ? 'var(--color-gray-light)' : '#e0e0e0'}
                                                />
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    placeholder="Type your story here (max. 7,000 words)"
                                                    style={{
                                                        width: '100%',
                                                        height: '300px',
                                                        padding: '1rem',
                                                        borderRadius: '0.75rem',
                                                        border: `2px solid ${isDark ? 'var(--color-gray-light)' : '#e0e0e0'}`, // Changed by Marisol for Dark Mode - 2/8/2026
                                                        fontSize: '1rem',
                                                        color: isDark ? 'var(--foreground)' : '#1a1a1a', // Changed by Marisol for Dark Mode - 2/8/2026
                                                        backgroundColor: isDark ? 'var(--background)' : '#ffffff', // Changed by Marisol for Dark Mode - 2/8/2026
                                                        outline: 'none',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit',
                                                        lineHeight: 1.6,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#8CE4FF'}
                                                    onBlur={(e) => e.target.style.borderColor = isDark ? 'var(--color-gray-light)' : '#e0e0e0'} // Changed by Marisol for Dark Mode - 2/8/2026
                                                />
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: '4rem',
                                                alignItems: 'center',
                                                marginBottom: '1.5rem',
                                            }}>
                                                <ToggleRow
                                                    label="Display name?"
                                                    checked={editDisplayName}
                                                    onToggle={() => setEditDisplayName((v) => !v)}
                                                    isDark={isDark} // Changed by Marisol for Dark Mode - 2/8/2026
                                                />
                                                <ToggleRow
                                                    label="Display photo?"
                                                    checked={editDisplayPhoto}
                                                    onToggle={() => setEditDisplayPhoto((v) => !v)}
                                                    isDark={isDark} // Changed by Marisol for Dark Mode - 2/8/2026
                                                />
                                            </div>
                                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                                <button
                                                    type="button"
                                                    disabled={savingEdit}
                                                    onClick={handleSaveEdit}
                                                    style={{
                                                        padding: '0.75rem 2.5rem',
                                                        fontSize: '1rem',
                                                        fontWeight: 700,
                                                        color: '#000000',
                                                        background: '#88c98b',
                                                        borderRadius: '0.75rem',
                                                        border: 'none',
                                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                        cursor: savingEdit ? 'not-allowed' : 'pointer',
                                                        marginRight: '0.75rem',
                                                        opacity: savingEdit ? 0.6 : 1,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onMouseEnter={(e) => !savingEdit && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                                    onMouseLeave={(e) => !savingEdit && (e.currentTarget.style.transform = 'translateY(0)')}
                                                >
                                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    style={{
                                                        padding: '0.75rem 1.5rem',
                                                        fontSize: '0.95rem',
                                                        fontWeight: 600,
                                                        color: '#666',
                                                        background: '#f5f5f5',
                                                        borderRadius: '0.75rem',
                                                        border: '2px solid #e0e0e0',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#e0e0e0';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#f5f5f5';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {filteredStories.map((story) => {
                                                const actualIndex = stories.indexOf(story);
                                                return (
                                                    <StoryCard
                                                        key={story._id}
                                                        story={story}
                                                        onEdit={() => {
                                                            setSelectedIndex(actualIndex);
                                                            startEdit();
                                                        }}
                                                        onArchive={() => {
                                                            setSelectedIndex(actualIndex);
                                                            handleArchive();
                                                        }}
                                                        onDelete={() => {
                                                            handleDelete(story._id);
                                                        }}
                                                        isDark={isDark} // Changed by Marisol for Dark Mode - 2/8/2026
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleReturn}
                                        style={{
                                            padding: '0.75rem 2rem',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: '#666',
                                            background: 'white',
                                            borderRadius: '0.75rem',
                                            border: '2px solid #e0e0e0',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            marginTop: '1.5rem',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#8CE4FF';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e0e0e0';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        ← Return
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Tab Button Component
function TabButton({
    active,
    onClick,
    color,
    children,
    isDark, // Added by Marisol for Dark Mode - 2/8/2026
}: {
    active: boolean;
    onClick: () => void;
    color: string;
    children: React.ReactNode;
    isDark?: boolean; // Added by Marisol for Dark Mode - 2/8/2026
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: active ? color : 'transparent',
                color: active && color === '#FFA239' ? '#fff' : (isDark ? 'var(--foreground)' : '#1a1a1a'), // Changed by Marisol for Dark Mode - 2/8/2026
                fontSize: '0.95rem',
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'; // Changed by Marisol for Dark Mode - 2/8/2026
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
            }}
        >
            {children}
        </button>
    );
}

// Toggle Components
function ToggleRow({
    label,
    checked,
    onToggle,
    isDark, // Added by Marisol for Dark Mode - 2/8/2026
}: {
    label: string;
    checked: boolean;
    onToggle: () => void;
    isDark?: boolean; // Added by Marisol for Dark Mode - 2/8/2026
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.95rem', color: isDark ? 'var(--foreground)' : '#333', fontWeight: 500 }}>{label}</span> {/* Changed by Marisol for Dark Mode - 2/8/2026 */}
            <ToggleSwitch checked={checked} onChange={onToggle} />
        </div>
    );
}

// Toggle Switch function to show changes
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
                transition: 'all 0.2s ease',
            }}
        >
            <div
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
            />
        </button>
    );
}

// Action Button Component
function ActionButton({
    label,
    onClick,
    variant = 'normal',
    color,
}: {
    label: string;
    onClick: () => void;
    variant?: 'normal' | 'danger';
    color?: string;
}) {
    const isDanger = variant === 'danger';
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '0.75rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: isDanger ? '#fff' : '#1a1a1a',
                background: isDanger ? '#FF5656' : (color || '#8CE4FF'),
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
        >
            {label}
        </button>
    );
}

// Story Card Component
function StoryCard({
    story,
    onEdit,
    onArchive,
    onDelete,
    isDark, // Added by Marisol for Dark Mode - 2/8/2026
}: {
    story: Story;
    onEdit: () => void;
    onArchive: () => void;
    onDelete: () => void;
    isDark?: boolean; // Added by Marisol for Dark Mode - 2/8/2026
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxPreviewLength = 200;
    const needsTruncation = story.storyText.length > maxPreviewLength;
    const displayText = isExpanded || !needsTruncation
        ? story.storyText
        : story.storyText.slice(0, maxPreviewLength) + '...';

    return (
        <div style={{
            background: isDark ? 'var(--background)' : 'white', // Changed by Marisol for Dark Mode - 2/8/2026
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)', // Changed by Marisol for Dark Mode - 2/8/2026
            border: '2px solid transparent',
            borderColor: story.archived ? '#FEEE91' : '#8CE4FF',
            transition: 'all 0.2s ease',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = isDark ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 8px 16px rgba(0, 0, 0, 0.1)'; // Changed by Marisol for Dark Mode - 2/8/2026
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'; // Changed by Marisol for Dark Mode - 2/8/2026
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    margin: 0,
                    color: isDark ? 'var(--foreground)' : '#1a1a1a', // Changed by Marisol for Dark Mode - 2/8/2026
                    flex: 1,
                }}>
                    {story.title || 'Untitled Story'}
                </h3>
                {story.archived && (
                    <span style={{
                        background: '#FEEE91',
                        color: '#666',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginLeft: '1rem',
                    }}>
                        Archived
                    </span>
                )}
            </div>

            {/*Date & Time Information for story creation & updates */}
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: isDark ? 'var(--color-gray)' : '#666', // Changed by Marisol for Dark Mode - 2/8/2026
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>
                        <strong>Created:</strong> {formatDate(story.createdAt)}
                    </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>
                        <strong>Updated:</strong> {formatDateTime(story.updatedAt)}
                    </span>
                </div>
            </div>

            <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: isDark ? 'var(--foreground)' : '#333', // Changed by Marisol for Dark Mode - 2/8/2026
                marginBottom: '1rem',
                whiteSpace: 'pre-wrap',
            }}>
                {displayText}
            </p>

            {needsTruncation && (
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#FFA239',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: '0.25rem 0',
                        marginBottom: '1rem',
                    }}
                >
                    {isExpanded ? 'Show less' : 'Read more'}
                </button>
            )}

            <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${isDark ? 'var(--color-gray-light)' : '#e0e0e0'}`, // Changed by Marisol for Dark Mode - 2/8/2026
            }}>
                <ActionButton
                    label="Edit"
                    onClick={onEdit}
                    color="#8CE4FF"
                />
                <ActionButton
                    label={story.archived ? 'Unarchive' : 'Archive'}
                    onClick={onArchive}
                    color="#FEEE91"
                />
                <ActionButton
                    label="Delete"
                    onClick={onDelete}
                    variant="danger"
                />
            </div>
        </div>
    );
}