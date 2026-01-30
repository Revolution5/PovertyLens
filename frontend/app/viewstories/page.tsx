'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Eye, Heart, Calendar, Edit2, Archive, Trash2, ArchiveRestore, Save, X } from 'lucide-react';

const BACKEND_URL = 'http://localhost:4000';

type Story = {
    _id: string;
    title: string;
    storyText: string;
    displayName: boolean;
    displayPhoto: boolean;
    createdAt?: string;
    updatedAt?: string;
    archived?: boolean;
    views?: number;
    likes?: number;
    status?: 'published';
};

export default function ViewStoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'all'>('active');

    const [editTitle, setEditTitle] = useState('');
    const [editText, setEditText] = useState('');
    const [editDisplayName, setEditDisplayName] = useState(true);
    const [editDisplayPhoto, setEditDisplayPhoto] = useState(true);
    const [savingEdit, setSavingEdit] = useState(false);

    const showMessage = (msg: string, duration = 5000) => {
    setMessage(msg);
    if (duration > 0) {
        setTimeout(() => {
            setMessage(null);
        }, duration);
    }
};

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
                if (!userEmail) {
                    setMessage('You must be logged in to view your stories.');
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${BACKEND_URL}/api/stories?userEmail=${encodeURIComponent(userEmail)}&includeArchived=true`);
                const data = await res.json();

                if (!res.ok || !data.success) {
                    showMessage(data.message || 'Error fetching stories.');
                    setLoading(false);
                    return;
                }

                setStories(data.stories || []);
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

    const startEdit = (story: Story) => {
        setEditing(story._id);
        setEditTitle(story.title || '');
        setEditText(story.storyText || '');
        setEditDisplayName(story.displayName);
        setEditDisplayPhoto(story.displayPhoto);
        setMessage(null);
    };

    const cancelEdit = () => {
        setEditing(null);
        setMessage(null);
    };

    const handleSaveEdit = async (storyId: string) => {
        if (!editText.trim()) {
            setMessage('Story text cannot be empty.');
            return;
        }
        const words = editText.trim().split(/\s+/).length;
        if (words > 7000) {
            setMessage('Story exceeds 7,000 word limit.');
            return;
        }

        try {
            setSavingEdit(true);
            const res = await fetch(`${BACKEND_URL}/api/stories/${storyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    storyText: editText,
                    displayName: editDisplayName,
                    displayPhoto: editDisplayPhoto,
                }),
            });

            let data;
            // const data = await res.json();
            try {
                data = await res.json();
            } catch (parseErr) {
                console.error('Failed to parse JSON from PUT /api/stories/:id', parseErr);
                setMessage('Server returned an invalid response.');
                setSavingEdit(false);
                return;
            }
            if (!res.ok || !data.success) {
                console.error('PUT /api/stories/:id returned error', res.status, data);
                setMessage(data.message || 'Error saving changes.');
                setSavingEdit(false);
                return;
            }

            if (!data.story){
                console.warn('PUT returned success but with no story object. Data:', data);
                setStories(prev => prev.map(s => s._id === storyId ? {
                    ...s,
                    title: editTitle,
                    storyText: editText,
                    displayName: editDisplayName,
                    displayPhoto: editDisplayPhoto,
                    updatedAt: new Date().toISOString(),
                }
            :s
        ));
            } else {
                setStories(prev => prev.map(s => s._id === storyId ? {
                ...s, ...data.story 
            } : s
        ));
            }
            showMessage('Changes saved successfully!');
            setEditing(null);
        } catch (err) {
            console.error(err);
            showMessage('Error connecting to server to save changes.');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleArchive = async (storyId: string, currentArchived: boolean) => {
        const newArchived = !currentArchived;
        const confirmed = window.confirm(newArchived ?
            'Are you sure you want to archive this story?\nYou will still be able to access it later on.' : 
            'Are you sure you want to unarchive this story?');
        if (!confirmed) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/stories/${storyId}/archive`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archived: newArchived }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                showMessage(data.message || 'Error archiving story.');
                return;
            }

            setStories(stories.map(s => s._id === storyId ? { ...s, archived: newArchived } : s));
            showMessage(newArchived ? 'Story archived successfully.' : 'Story unarchived successfully.');
        } catch (err) {
            console.error(err);
            showMessage('Error connecting to server to update archive status.');
        }
    };

    const handleDelete = async (storyId: string, storyTitle: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this story?\nThis action CANNOT be undone.');
        if (!confirmed) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/stories/${storyId}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                showMessage(data.message || 'Error deleting story.');
                return;
            }

            setStories(stories.filter(s => s._id !== storyId));
            showMessage(`Story "${storyTitle}" deleted successfully`);
        } catch (err) {
            console.error(err);
            showMessage('Error connecting to server to delete story.');
        }
    };

    const activeStories = stories.filter(s => !s.archived);
    const archivedStories = stories.filter(s => s.archived);

    const getFilteredStories = () => {
        if (activeTab === 'active') return activeStories;
        if (activeTab === 'archived') return archivedStories;
        return stories;
    };

    const filteredStories = getFilteredStories();

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#8CE4FF] rounded-lg">
                            <BookOpen className="h-8 w-8 text-gray-900" />
                        </div>
                        <h1 className="text-4xl font-bold text-black">
                            Your Stories
                        </h1>
                    </div>
                    <p className="text-gray-700">Manage all your published and draft stories in one place</p>
                </div>

                {/* Toast Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg font-medium ${
                        message.includes('Error') || message.includes('cannot') || message.includes('exceeds')
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : message.includes('success') || message.includes('saved') || message.includes('deleted')
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-blue-50 border border-blue-200 text-blue-800'
                    }`}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Loading your stories...</p>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No stories found</p>
                    </div>
                ) : (
                    <div className="w-full">
                        {/* Tabs */}
                        <div className="mb-6 inline-flex rounded-full border border-[#8CE4FF] bg-white/80 p-1">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-5 py-2 rounded-full font-medium transition-all ${
                                    activeTab === 'active'
                                        ? '!bg-[#FF5656] text-black'
                                        : 'text-gray-600 hover:!bg-[#FF5656] hover:text-gray-900'
                                }`}
                            >
                                Active Stories ({activeStories.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('archived')}
                                className={`px-5 py-2 rounded-full font-medium transition-all ${
                                    activeTab === 'archived'
                                        ? '!bg-[#FEEE91] text-black'
                                        : 'text-gray-600 hover:!bg-[#FEEE91] hover:text-gray-900'
                                }`}
                            >
                                Archived ({archivedStories.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-5 py-2 rounded-full font-medium transition-all ${
                                    activeTab === 'all'
                                        ? '!bg-[#FFA239] text-black'
                                        : 'text-gray-600 hover:!bg-[#FFA239] hover:text-gray-900'
                                }`}
                            >
                                All Stories ({stories.length})
                            </button>
                        </div>

                        {/* Story Cards */}
                        <div className="space-y-4">
                            {filteredStories.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No {activeTab} stories found</p>
                                </div>
                            ) : (
                                filteredStories.map((story) => (
                                    <StoryCard
                                        key={story._id}
                                        story={story}
                                        isEditing={editing === story._id}
                                        editTitle={editTitle}
                                        editText={editText}
                                        editDisplayName={editDisplayName}
                                        editDisplayPhoto={editDisplayPhoto}
                                        savingEdit={savingEdit}
                                        onEditTitleChange={setEditTitle}
                                        onEditTextChange={setEditText}
                                        onEditDisplayNameChange={setEditDisplayName}
                                        onEditDisplayPhotoChange={setEditDisplayPhoto}
                                        onEdit={() => startEdit(story)}
                                        onSave={() => handleSaveEdit(story._id)}
                                        onCancel={cancelEdit}
                                        onArchive={() => handleArchive(story._id, story.archived || false)}
                                        onDelete={() => handleDelete(story._id, story.title || 'Untitled')}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StoryCard({
    story,
    isEditing,
    editTitle,
    editText,
    editDisplayName,
    editDisplayPhoto,
    savingEdit,
    onEditTitleChange,
    onEditTextChange,
    onEditDisplayNameChange,
    onEditDisplayPhotoChange,
    onEdit,
    onSave,
    onCancel,
    onArchive,
    onDelete,
}: {
    story: Story;
    isEditing: boolean;
    editTitle: string;
    editText: string;
    editDisplayName: boolean;
    editDisplayPhoto: boolean;
    savingEdit: boolean;
    onEditTitleChange: (val: string) => void;
    onEditTextChange: (val: string) => void;
    onEditDisplayNameChange: (val: boolean) => void;
    onEditDisplayPhotoChange: (val: boolean) => void;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onArchive: () => void;
    onDelete: () => void;
}) {
    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    if (isEditing) {
        return (
            <div className="bg-white rounded-3xl overflow-hidden p-6 shadow-xl hover:shadow-2x1 hover:-translate-y-1 border-2 border-[#8CE4FF]/30 hover:border-[#8CE4FF]/70 transition-all duration-300">
                <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
                    Edit Your Story
                </h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => onEditTitleChange(e.target.value)}
                        placeholder="Story title (optional)"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FFA239] focus:bg-white transition-all text-gray-900 font-medium"
                    />
                    <textarea
                        value={editText}
                        onChange={(e) => onEditTextChange(e.target.value)}
                        placeholder="Type your story here (max 7,000 words)"
                        rows={12}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FFA239] focus:bg-white transition-all resize-vertical text-gray-900"
                    />
                    
                    <div className="flex justify-center gap-12 py-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-gray-700 font-medium">Display name?</span>
                            <ToggleSwitch checked={editDisplayName} onChange={() => onEditDisplayNameChange(!editDisplayName)} />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-gray-700 font-medium">Display photo?</span>
                            <ToggleSwitch checked={editDisplayPhoto} onChange={() => onEditDisplayPhotoChange(!editDisplayPhoto)} />
                        </label>
                    </div>

                    <div className="flex justify-center gap-3 pt-4">
                        <button
                            onClick={onSave}
                            disabled={savingEdit}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#FFA239] to-[#FF5656] text-black font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-5 w-5" />
                            {savingEdit ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                        >
                            <X className="h-5 w-5" />
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl overflow-hidden p-6 shadow-xl hover:shadow-2x1 hover:-translate-y-1 border-2 border-[#8CE4FF]/30 hover:border-[#8CE4FF]/70 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {story.title || 'Untitled Story'}
                        </h3>
                        {story.archived && (
                            <span className="px-3 py-1 bg-[#FEEE91] text-gray-900 text-xs font-bold rounded-full">
                                ARCHIVED
                            </span>
                        )}
                        {!story.archived && (
                            <span className="px-3 py-1 bg-green-200 text-gray-700 text-xs font-bold rounded-full">
                                PUBLISHED
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {story.storyText}
                    </p>
                </div>
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDateTime(story.createdAt)}</span>
                </div>
                {story.updatedAt && (
                    <div className="flex items-center gap-2">
                        <Edit2 className="h-4 w-4"/>
                        <span>Updated {formatDateTime(story.updatedAt)}</span>
                    </div>
                )}
                {story.views !== undefined && (
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{story.views.toLocaleString()} views</span>
                    </div>
                )}
                {story.likes !== undefined && (
                    <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>{story.likes.toLocaleString()} likes</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8CE4FF] text-gray-900 font-semibold rounded-lg hover:bg-[#6DD5FF] transition-all"
                >
                    <Edit2 className="h-4 w-4" />
                    Edit
                </button>
                <button
                    onClick={onArchive}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FEEE91] text-gray-900 font-semibold rounded-lg hover:bg-[#FEEE91]/80 transition-all"
                >
                    {story.archived ? (
                        <>
                            <ArchiveRestore className="h-4 w-4" />
                            Unarchive
                        </>
                    ) : (
                        <>
                            <Archive className="h-4 w-4" />
                            Archive
                        </>
                    )}
                </button>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF5656] text-[#FF4646] font-semibold rounded-lg hover:bg-[#FF5656]/90 transition-all"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </button>
            </div>
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
    return (
        <button
            type="button"
            onClick={onChange}
            aria-pressed={checked}
            className={`relative inline-flex w-12 h-6 shrink-0 rounded-full transition-all
                border border-green-300
                focus: outline-none focus:ring-2 focus:ring-green-300
                ${checked ? '!bg-green-400' : '!bg-gray-300'
            }`}
        >
            <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform
                    ${checked ? 'translate-x-6' : 'translate-x-0'}
                `}
            />
        </button>
    );
}