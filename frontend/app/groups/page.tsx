'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Users, KeyRound, ClipboardList, Copy, Check } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type GroupType = 'classroom' | 'nonprofit' | 'club' | 'corporate';

type GroupAssignmentType =
  | 'pledges'
  | 'freerice_grains'
  | 'stories'
  | 'volunteer_hours'
  | 'quiz'
  | 'country_story_reads';

type GroupAssignment = {
  id: string;
  title: string;
  assignmentType: GroupAssignmentType;
  description?: string;
  target: number;
  dueDate?: string | null;
  createdBy: string;
  createdAt: string;
};

type Group = {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  leaderEmail: string;
  leaderUsername: string;
  memberCount: number;
  code: string;
  inviteLink: string;
  isPublic: boolean;
  assignments: GroupAssignment[];
  createdAt: string;
  updatedAt: string;
};

type GroupMember = {
  email: string;
  username: string;
};

type GroupDetails = {
  group: Group;
  members: GroupMember[];
};

type Notice = { type: 'success' | 'error'; text: string };
type GroupTab = 'overview' | 'assignments';

const GROUP_TYPE_OPTIONS: GroupType[] = ['classroom', 'nonprofit', 'club', 'corporate'];
const ASSIGNMENT_TYPE_OPTIONS: GroupAssignmentType[] = [
  'pledges',
  'freerice_grains',
  'stories',
  'volunteer_hours',
  'quiz',
  'country_story_reads',
];

export default function GroupsPage() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDetails, setSelectedDetails] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [groupName, setGroupName] = useState<string>('');
  const [groupDescription, setGroupDescription] = useState<string>('');
  const [groupType, setGroupType] = useState<GroupType>('classroom');
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const [joinCode, setJoinCode] = useState<string>('');

  const [assignmentTitle, setAssignmentTitle] = useState<string>('');
  const [assignmentDescription, setAssignmentDescription] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<GroupAssignmentType>('pledges');
  const [assignmentTarget, setAssignmentTarget] = useState<number>(1);
  const [assignmentDueDate, setAssignmentDueDate] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string>('');
  const [showMembersList, setShowMembersList] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<GroupTab>('overview');

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || '';
    const storedUsername = localStorage.getItem('username') || '';
    setUserEmail(storedEmail);
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    void fetchGroups();
  }, [userEmail]);

  useEffect(() => {
    if (!selectedGroupId || !userEmail) return;
    void fetchGroupDetails(selectedGroupId);
  }, [selectedGroupId, userEmail]);

  useEffect(() => {
    setShowMembersList(false);
    setActiveTab('overview');
  }, [selectedGroupId]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) || null,
    [groups, selectedGroupId]
  );

  const isLeader = Boolean(selectedGroup && selectedGroup.leaderEmail === userEmail.toLowerCase());

  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/groups?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load groups');
      }
      const loadedGroups: Group[] = Array.isArray(data.groups) ? data.groups : [];
      setGroups(loadedGroups);
      if (loadedGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(loadedGroups[0].id);
      }
      if (loadedGroups.length === 0) {
        setSelectedGroupId('');
        setSelectedDetails(null);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      setNotice({ type: 'error', text: 'Could not load your groups yet.' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchGroupDetails(groupId: string) {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/groups/${groupId}?email=${encodeURIComponent(userEmail)}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load group details');
      }
      setSelectedDetails({
        group: data.group,
        members: Array.isArray(data.members) ? data.members : [],
      });
    } catch (error) {
      console.error('Error loading group details:', error);
      setNotice({ type: 'error', text: 'Could not load group details.' });
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) {
      setNotice({ type: 'error', text: 'Please enter a group name.' });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          username,
          name: groupName.trim(),
          description: groupDescription.trim(),
          type: groupType,
          isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not create group');
      }

      setNotice({ type: 'success', text: 'Group created successfully.' });
      setGroupName('');
      setGroupDescription('');
      setIsPublic(false);
      await fetchGroups();
      setSelectedGroupId(data.group.id);
    } catch (error) {
      console.error('Error creating group:', error);
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create group.' });
    }
  }

  async function handleJoinGroup() {
    if (!joinCode.trim()) {
      setNotice({ type: 'error', text: 'Please enter a join code.' });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/groups/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          username,
          code: joinCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not join group');
      }

      setNotice({ type: 'success', text: `Joined ${data.group.name}.` });
      setJoinCode('');
      await fetchGroups();
      setSelectedGroupId(data.group.id);
    } catch (error) {
      console.error('Error joining group:', error);
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Failed to join group.' });
    }
  }

  async function handleCreateAssignment() {
    if (!selectedGroup) {
      setNotice({ type: 'error', text: 'Select a group first.' });
      return;
    }

    if (!assignmentTitle.trim()) {
      setNotice({ type: 'error', text: 'Assignment title is required.' });
      return;
    }

    if (!Number.isFinite(assignmentTarget) || assignmentTarget <= 0) {
      setNotice({ type: 'error', text: 'Assignment target must be greater than 0.' });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/groups/${selectedGroup.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          title: assignmentTitle.trim(),
          description: assignmentDescription.trim(),
          assignmentType,
          target: Number(assignmentTarget),
          dueDate: assignmentDueDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not create assignment');
      }

      setNotice({ type: 'success', text: 'Assignment created.' });
      setAssignmentTitle('');
      setAssignmentDescription('');
      setAssignmentTarget(1);
      setAssignmentDueDate('');
      await fetchGroupDetails(selectedGroup.id);
      await fetchGroups();
    } catch (error) {
      console.error('Error creating assignment:', error);
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create assignment.' });
    }
  }

  async function copyGroupCodeToClipboard(code: string) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = code;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode((previous) => (previous === code ? '' : previous));
      }, 1800);
    } catch (error) {
      console.error('Could not copy passcode:', error);
    }
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-3">Groups</h1>
          <p className="text-lg" style={{ color: 'var(--color-gray)' }}>
            Sign in to create or join a classroom, nonprofit, club, or corporate group.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Groups</h1>
          <div
            style={{
              height: 4,
              width: 88,
              borderRadius: 999,
              background: 'var(--gradient-orange-red)',
              marginBottom: 18,
            }}
          />
          <p className="text-lg" style={{ color: 'var(--color-gray)' }}>
            Build coordinated action with your class or organization, assign goals, and track shared impact.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-3 py-1.5 rounded-md text-xs font-semibold border"
              style={{
                borderColor: activeTab === 'overview' ? '#FFA239' : 'var(--color-gray-light)',
                color: activeTab === 'overview' ? '#FFA239' : 'var(--foreground)',
                backgroundColor: activeTab === 'overview' ? 'rgba(255,162,57,0.1)' : 'transparent',
              }}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className="px-3 py-1.5 rounded-md text-xs font-semibold border"
              style={{
                borderColor: activeTab === 'assignments' ? '#FFA239' : 'var(--color-gray-light)',
                color: activeTab === 'assignments' ? '#FFA239' : 'var(--foreground)',
                backgroundColor: activeTab === 'assignments' ? 'rgba(255,162,57,0.1)' : 'transparent',
              }}
            >
              Assignments
            </button>
          </div>
        </header>

        {notice && (
          <div
            className="mb-6 px-4 py-3 rounded-xl"
            style={{
              border: `1px solid ${notice.type === 'success' ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
              backgroundColor:
                notice.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            }}
          >
            {notice.text}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section
            className="xl:col-span-4 rounded-2xl p-5"
            style={{ border: '1px solid var(--color-gray-light)', backgroundColor: 'var(--background)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5" style={{ color: '#FFA239' }} />
              <h2 className="text-xl font-semibold">Create Group</h2>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Group name"
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
              />
              <textarea
                value={groupDescription}
                onChange={(event) => setGroupDescription(event.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 rounded-lg border min-h-20"
                style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={groupType}
                  onChange={(event) => setGroupType(event.target.value as GroupType)}
                  className="px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
                >
                  {GROUP_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <label className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-gray-light)' }}>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                  />
                  Public group
                </label>
              </div>

              <button
                onClick={() => void handleCreateGroup()}
                className="w-full py-2.5 rounded-lg font-semibold"
                style={{ backgroundColor: '#FFA239', color: '#111827' }}
              >
                Create Group
              </button>
            </div>

            <div className="mt-7 pt-6" style={{ borderTop: '1px solid var(--color-gray-light)' }}>
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5" style={{ color: '#8CE4FF' }} />
                <h2 className="text-xl font-semibold">Join Group</h2>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  placeholder="6-digit code"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
                />
                <button
                  onClick={() => void handleJoinGroup()}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: '#8CE4FF', color: '#0F172A' }}
                >
                  Join
                </button>
              </div>
            </div>
          </section>

          <section
            className="xl:col-span-8 rounded-2xl p-5"
            style={{ border: '1px solid var(--color-gray-light)', backgroundColor: 'var(--background)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" style={{ color: '#FF5656' }} />
              <h2 className="text-xl font-semibold">Your Groups</h2>
            </div>

            {loading ? (
              <p style={{ color: 'var(--color-gray)' }}>Loading groups...</p>
            ) : groups.length === 0 ? (
              <p style={{ color: 'var(--color-gray)' }}>
                You are not in any groups yet. Create one or join with a code.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className="text-left rounded-xl p-4 border transition-colors"
                    style={{
                      borderColor: selectedGroupId === group.id ? '#FFA239' : 'var(--color-gray-light)',
                      backgroundColor: selectedGroupId === group.id ? 'rgba(255,162,57,0.08)' : 'transparent',
                    }}
                  >
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                      {group.type} • {group.memberCount} members
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--color-gray)' }}>
                      Join code: <span className="font-semibold">{group.code}</span>
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedGroup && (
              <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--color-gray-light)' }}>
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="rounded-lg p-4" style={{ border: '1px solid var(--color-gray-light)' }}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-semibold">{selectedGroup.name}</h3>
                          <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                            Leader: {selectedGroup.leaderUsername} ({selectedGroup.leaderEmail})
                          </p>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                              Invite code: {selectedGroup.code}
                            </p>
                            <button
                              type="button"
                              onClick={() => void copyGroupCodeToClipboard(selectedGroup.code)}
                              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold border"
                              style={{
                                borderColor: 'var(--color-gray-light)',
                                color: 'var(--foreground)',
                                backgroundColor: copiedCode === selectedGroup.code ? 'rgba(34,197,94,0.12)' : 'transparent',
                              }}
                              aria-label="Copy invite code"
                              title="Copy invite code"
                            >
                              {copiedCode === selectedGroup.code ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-gray)' }}>
                          {selectedDetails?.members.length || selectedGroup.memberCount} members
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg p-4" style={{ border: '1px solid var(--color-gray-light)' }}>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h4 className="font-semibold">Members</h4>
                        <button
                          type="button"
                          onClick={() => setShowMembersList((previous) => !previous)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold border"
                          style={{
                            borderColor: 'var(--color-gray-light)',
                            color: 'var(--foreground)',
                            backgroundColor: showMembersList ? 'rgba(255,162,57,0.1)' : 'transparent',
                          }}
                        >
                          {showMembersList ? 'Hide Members' : 'View Members'}
                        </button>
                      </div>

                      {!showMembersList ? (
                        <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                          Click "View Members" to display the list.
                        </p>
                      ) : (selectedDetails?.members || []).length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                          No members found yet.
                        </p>
                      ) : (
                        <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
                          {(selectedDetails?.members || []).map((member) => (
                            <div
                              key={member.email}
                              className="flex items-center justify-between rounded-md px-3 py-2"
                              style={{
                                backgroundColor: 'rgba(140,228,255,0.08)',
                                border: '1px solid var(--color-gray-light)',
                              }}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold break-all" style={{ color: 'var(--foreground)' }}>
                                  {member.username}
                                </p>
                                <p className="text-xs break-all" style={{ color: 'var(--color-gray)' }}>
                                  {member.email}
                                </p>
                              </div>
                              {member.email === selectedGroup.leaderEmail && (
                                <span
                                  className="ml-3 px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: 'rgba(255,162,57,0.18)',
                                    color: '#FFA239',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  Leader
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </section>
          </div>
        )}

        {activeTab === 'assignments' && (
          <section
            className="rounded-2xl p-5"
            style={{ border: '1px solid var(--color-gray-light)', backgroundColor: 'var(--background)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5" style={{ color: '#FF5656' }} />
              <h2 className="text-xl font-semibold">Assignments</h2>
            </div>

            {loading ? (
              <p style={{ color: 'var(--color-gray)' }}>Loading groups...</p>
            ) : groups.length === 0 ? (
              <p style={{ color: 'var(--color-gray)' }}>
                You are not in any groups yet. Switch to Overview to create or join a group.
              </p>
            ) : (
              <>
                <div className="mb-4 max-w-md">
                  <label className="block text-sm mb-2" style={{ color: 'var(--color-gray)' }}>
                    Group
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--color-gray-light)', background: 'transparent', color: 'var(--foreground)' }}
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGroup ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div className="rounded-lg p-4" style={{ border: '1px solid var(--color-gray-light)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <ClipboardList className="w-4 h-4" />
                          <h4 className="font-semibold">Assignments for {selectedGroup.name}</h4>
                        </div>

                        {(selectedDetails?.group.assignments || []).length === 0 ? (
                          <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                            No assignments yet.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {(selectedDetails?.group.assignments || []).map((assignment) => (
                              <div
                                key={assignment.id}
                                className="rounded-lg p-3"
                                style={{ border: '1px solid var(--color-gray-light)' }}
                              >
                                <p className="font-medium">{assignment.title}</p>
                                <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
                                  Type: {assignment.assignmentType} • Target: {assignment.target}
                                </p>
                                {assignment.dueDate ? (
                                  <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
                                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {isLeader && (
                      <div className="rounded-lg p-4" style={{ border: '1px solid var(--color-gray-light)' }}>
                        <h4 className="font-semibold mb-3">Create Assignment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={assignmentTitle}
                            onChange={(event) => setAssignmentTitle(event.target.value)}
                            placeholder="Assignment title"
                            className="px-3 py-2 rounded-lg border"
                            style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
                          />
                          <select
                            value={assignmentType}
                            onChange={(event) => setAssignmentType(event.target.value as GroupAssignmentType)}
                            className="px-3 py-2 rounded-lg border"
                            style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
                          >
                            {ASSIGNMENT_TYPE_OPTIONS.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            min={1}
                            value={assignmentTarget}
                            onChange={(event) => setAssignmentTarget(Number(event.target.value))}
                            placeholder="Target"
                            className="px-3 py-2 rounded-lg border"
                            style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
                          />

                          <input
                            type="date"
                            value={assignmentDueDate}
                            onChange={(event) => setAssignmentDueDate(event.target.value)}
                            className="px-3 py-2 rounded-lg border"
                            style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
                          />

                          <textarea
                            value={assignmentDescription}
                            onChange={(event) => setAssignmentDescription(event.target.value)}
                            placeholder="Description (optional)"
                            className="md:col-span-2 px-3 py-2 rounded-lg border min-h-20"
                            style={{ borderColor: 'var(--color-gray-light)', background: 'transparent' }}
                          />
                        </div>

                        <button
                          onClick={() => void handleCreateAssignment()}
                          className="mt-3 px-4 py-2 rounded-lg font-semibold"
                          style={{ backgroundColor: '#FFA239', color: '#111827' }}
                        >
                          Save Assignment
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: 'var(--color-gray)' }}>Select a group to view assignments.</p>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
