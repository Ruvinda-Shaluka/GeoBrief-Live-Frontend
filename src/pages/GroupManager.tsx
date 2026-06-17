import { useEffect, useState } from "react";
import { useAppSelector } from "../store/store";
import groupService from "../services/groupService";
import incidentService from "../services/incidentService";
import IncidentCard from "../components/incidents/IncidentCard";
import type { Incident } from "../components/incidents/IncidentCard";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  admin: UserInfo | string;
  members: UserInfo[];
}

const GroupManager = () => {
  const { token, user } = useAppSelector((state) => state.auth);

  // Lists state
  const [groups, setGroups] = useState<Group[]>([]);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Forms state
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  // Loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Search filter states
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [incidentSearchTerm, setIncidentSearchTerm] = useState("");

  const [isMembersExpanded, setIsMembersExpanded] = useState(true);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const [groupsData, incidentsData] = await Promise.all([
        groupService.getUserGroups(token),
        incidentService.getIncidents(token),
      ]);
      setGroups(groupsData);
      setAllIncidents(incidentsData);
      if (groupsData.length > 0) {
        // Automatically select first group if none selected
        setSelectedGroup(groupsData[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newGroupName.trim()) return;

    try {
      setActionError(null);
      setActionSuccess(null);
      const newGroup = await groupService.createGroup(
        {
          name: newGroupName.trim(),
          description: newGroupDesc.trim() || undefined,
        },
        token
      );
      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setNewGroupName("");
      setNewGroupDesc("");
      setActionSuccess("Group created successfully!");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to create group.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedGroup || !inviteEmail.trim()) return;

    try {
      setActionError(null);
      setActionSuccess(null);
      const updatedGroup = await groupService.addMemberToGroup(
        selectedGroup._id,
        inviteEmail.trim(),
        token
      );
      
      // Update groups list
      setGroups((prev) =>
        prev.map((g) => (g._id === selectedGroup._id ? updatedGroup : g))
      );
      setSelectedGroup(updatedGroup);
      setInviteEmail("");
      setActionSuccess("Member added successfully!");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to add member.");
    }
  };

  // Upvote helper for group page
  const handleUpvote = async (incidentId: string) => {
    if (!token) return;
    try {
      const updatedIncident = await incidentService.toggleUpvote(incidentId, token);
      setAllIncidents((prev) =>
        prev.map((inc) => (inc._id === incidentId ? updatedIncident : inc))
      );
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  // Get incidents specifically shared with the selected group
  const groupIncidents = allIncidents.filter((incident) => {
    if (!selectedGroup) return false;
    return (
      incident.visibility === "group" &&
      incident.sharedWithGroups?.includes(selectedGroup._id)
    );
  });

  // Filter group incidents by search query
  const filteredGroupIncidents = groupIncidents.filter((incident) =>
    incident.title.toLowerCase().includes(incidentSearchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(incidentSearchTerm.toLowerCase()) ||
    incident.type.toLowerCase().includes(incidentSearchTerm.toLowerCase())
  );

  // Filter groups list by search query
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  const isAdminOfSelectedGroup = () => {
    if (!selectedGroup || !user) return false;
    const adminId = typeof selectedGroup.admin === "object" ? selectedGroup.admin._id : selectedGroup.admin;
    return adminId === user._id;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-darkText tracking-tight">
          Group Collaboration
        </h1>
        <p className="text-darkTextSecondary text-sm">
          Collaborate on incidents privately within customized groups.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="h-[450px] bg-darkCard border border-darkBorder rounded-2xl" />
          <div className="lg:col-span-2 h-[450px] bg-darkCard border border-darkBorder rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT PANEL: Group Listing & Controls */}
          <div className="space-y-6">
            {/* Create Group Card */}
            <div className="bg-darkCard border-2 border-darkBorder rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-darkText mb-4">Create New Group</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Group Name"
                    className="w-full bg-darkCard border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-darkText focus:outline-none focus:border-brandPrimary transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Short Description"
                    className="w-full bg-darkCard border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-darkText focus:outline-none focus:border-brandPrimary transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-brandPrimary text-white hover:bg-purple-500 transition-colors shadow-lg cursor-pointer"
                >
                  Create Group
                </button>
              </form>
            </div>

            {/* Groups List Selection */}
            <div className="bg-darkCard border-2 border-darkBorder rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-darkText mb-2">Your Groups</h3>
              
              {groups.length > 0 && (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-3.5 w-3.5 text-darkTextSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    placeholder="Search groups..."
                    className="w-full bg-darkCard border border-darkBorder rounded-xl pl-9 pr-3 py-2 text-xs text-darkText focus:outline-none focus:border-brandPrimary transition-colors"
                  />
                </div>
              )}

              {filteredGroups.length === 0 ? (
                <p className="text-xs text-darkTextSecondary py-4 text-center">
                  {groups.length === 0 ? "You are not in any groups yet." : "No matching groups found."}
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredGroups.map((group) => {
                    const isSelected = selectedGroup?._id === group._id;
                    return (
                      <button
                        key={group._id}
                        onClick={() => {
                          setSelectedGroup(group);
                          setActionError(null);
                          setActionSuccess(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brandPrimary/10 border-brandPrimary text-darkText font-bold"
                            : "bg-darkBg/30 border-darkBorder text-darkTextSecondary hover:bg-brandPrimary/10 hover:text-darkText"
                        }`}
                      >
                        <span className="font-bold text-sm block">{group.name}</span>
                        {group.description && (
                          <span className="text-xs text-darkTextSecondary line-clamp-1 mt-0.5">
                            {group.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Group Info & Shared Incidents */}
          <div className="lg:col-span-2 space-y-6">
            {selectedGroup ? (
              <div className="bg-darkCard border-2 border-darkBorder rounded-2xl p-6 shadow-xl space-y-6">
                {/* Group Details Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-darkBorder/40 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-darkText">{selectedGroup.name}</h2>
                    <p className="text-darkTextSecondary text-sm mt-0.5">{selectedGroup.description || "No description provided."}</p>
                  </div>
                  {/* Status Indicator / Admin badge */}
                  <span className="bg-brandPrimary/10 border-2 border-brandPrimary text-brandPrimary text-xs font-bold px-3 py-1.5 rounded-full">
                    {isAdminOfSelectedGroup() ? "Group Admin" : "Group Member"}
                  </span>
                </div>

                {/* Notifications */}
                {actionError && (
                  <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs py-2 px-3 rounded-xl font-medium">
                    {actionError}
                  </div>
                )}
                {actionSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs py-2 px-3 rounded-xl font-medium">
                    {actionSuccess}
                  </div>
                )}

                {/* Invite section (Only visible to Group Admin) */}
                {isAdminOfSelectedGroup() && (
                  <div className="bg-darkBg/40 border border-darkBorder p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-darkText uppercase tracking-wider">
                      Add Group Member
                    </h4>
                    <form onSubmit={handleAddMember} className="flex gap-3">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="User's email address"
                        className="flex-1 bg-darkCard border border-darkBorder rounded-xl px-4 py-2 text-xs text-darkText focus:outline-none focus:border-brandPrimary transition-colors"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-brandPrimary text-white hover:bg-purple-500 transition-colors shadow-lg cursor-pointer"
                      >
                        Add Member
                      </button>
                    </form>
                  </div>
                )}

                {/* Members list & Group Incidents */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Members list (Collapsible/Retractable) */}
                  <div className="space-y-3 self-start border border-darkBorder/40 p-4 rounded-2xl bg-darkBg/20">
                    <button
                      type="button"
                      onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                      className="w-full flex items-center justify-between text-left text-xs font-bold text-darkText uppercase tracking-wider focus:outline-none cursor-pointer group/btn select-none"
                    >
                      <span>Members ({selectedGroup.members.length})</span>
                      <svg
                        className={`h-4 w-4 text-darkTextSecondary transition-transform duration-200 ${
                          isMembersExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isMembersExpanded && (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 animate-fadeIn">
                        {selectedGroup.members.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center space-x-2.5 p-2 rounded-xl bg-darkBg/40 border border-darkBorder"
                          >
                            <div className="h-6 w-6 rounded-full bg-brandPrimary/25 flex items-center justify-center text-[10px] font-bold text-brandPrimary">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left leading-tight">
                              <span className="text-xs font-semibold text-darkText block">
                                {member.name}
                              </span>
                              <span className="text-[10px] text-darkTextSecondary">{member.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Incidents Shared */}
                  <div className="md:col-span-2 space-y-3 text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h3 className="text-xs font-bold text-darkText uppercase tracking-wider">
                        Shared Group Incidents ({filteredGroupIncidents.length})
                      </h3>
                      {groupIncidents.length > 0 && (
                        <div className="relative w-full sm:w-48">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-3 w-3 text-darkTextSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            value={incidentSearchTerm}
                            onChange={(e) => setIncidentSearchTerm(e.target.value)}
                            placeholder="Search group incidents..."
                            className="w-full bg-darkCard border border-darkBorder rounded-xl pl-8 pr-3 py-1.5 text-[10px] text-darkText focus:outline-none focus:border-brandPrimary transition-colors"
                          />
                        </div>
                      )}
                    </div>
                    {groupIncidents.length === 0 ? (
                      <div className="text-center py-12 bg-darkBg/40 border border-darkBorder px-4 rounded-2xl">
                        <p className="text-xs text-darkTextSecondary">
                          No group incidents have been reported. Set visibility to "group" when submitting an incident from the Map Dashboard.
                        </p>
                      </div>
                    ) : filteredGroupIncidents.length === 0 ? (
                      <div className="text-center py-12 bg-darkBg/40 border border-darkBorder px-4 rounded-2xl">
                        <p className="text-xs text-darkTextSecondary">
                          No group incidents match your search query.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-1">
                        {filteredGroupIncidents.map((incident) => (
                          <IncidentCard
                            key={incident._id}
                            incident={incident}
                            onUpvote={handleUpvote}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-darkCard border-2 border-darkBorder rounded-2xl p-12 text-center h-full flex flex-col justify-center items-center">
                <svg className="h-12 w-12 text-darkTextSecondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-bold text-darkText mb-2">No Group Selected</h3>
                <p className="text-darkTextSecondary text-sm max-w-xs leading-relaxed">
                  Select a group from the list or create a new group to coordinate and collaborate on incidents.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManager;
