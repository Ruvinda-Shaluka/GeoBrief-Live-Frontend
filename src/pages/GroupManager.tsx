import { useEffect, useState } from "react";
import { useAppSelector } from "../store/store";
import groupService from "../services/groupService";
import incidentService from "../services/incidentService";
import IncidentCard from "../components/incidents/IncidentCard";
import type { Incident } from "../components/incidents/IncidentCard";
import ConfirmModal from "../components/layout/ConfirmModal";

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

  // Custom confirmation dialog states
  const [isTransferConfirmOpen, setIsTransferConfirmOpen] = useState(false);
  const [pendingAdminId, setPendingAdminId] = useState<string | null>(null);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [pendingRemoveMemberId, setPendingRemoveMemberId] = useState<string | null>(null);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [selectedMemberForActions, setSelectedMemberForActions] = useState<UserInfo | null>(null);

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

  const handleMakeAdmin = (memberId: string) => {
    setPendingAdminId(memberId);
    setIsTransferConfirmOpen(true);
  };

  const executeTransferAdmin = async (memberId: string) => {
    if (!token || !selectedGroup) return;

    try {
      setActionError(null);
      setActionSuccess(null);
      const updatedGroup = await groupService.transferGroupAdmin(
        selectedGroup._id,
        memberId,
        token
      );

      // Update groups list
      setGroups((prev) =>
        prev.map((g) => (g._id === selectedGroup._id ? updatedGroup : g))
      );
      setSelectedGroup(updatedGroup);
      setActionSuccess("Transferred admin privilege successfully!");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to transfer admin privileges.");
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setPendingRemoveMemberId(memberId);
    setIsRemoveConfirmOpen(true);
  };

  const executeRemoveMember = async (memberId: string) => {
    if (!token || !selectedGroup) return;

    try {
      setActionError(null);
      setActionSuccess(null);
      const updatedGroup = await groupService.removeMember(
        selectedGroup._id,
        memberId,
        token
      );

      // Update groups list
      setGroups((prev) =>
        prev.map((g) => (g._id === selectedGroup._id ? updatedGroup : g))
      );
      setSelectedGroup(updatedGroup);
      setActionSuccess("Member removed successfully.");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to remove member.");
    }
  };

  const handleLeaveGroup = () => {
    setIsLeaveConfirmOpen(true);
  };

  const executeLeaveGroup = async () => {
    if (!token || !selectedGroup) return;

    try {
      setActionError(null);
      setActionSuccess(null);
      await groupService.leaveGroup(selectedGroup._id, token);

      // Remove group from user's groups list
      const remainingGroups = groups.filter((g) => g._id !== selectedGroup._id);
      setGroups(remainingGroups);
      if (remainingGroups.length > 0) {
        setSelectedGroup(remainingGroups[0]);
      } else {
        setSelectedGroup(null);
      }
      setActionSuccess("Successfully left the group.");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to leave group.");
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
      <hr className="border-darkBorder/30 my-6" />

      {error && (
        <div className="bg-rose-500/10 border-2 border-rose-500/35 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-medium mb-6 text-left flex items-start gap-3 animate-fadeIn">
          <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
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
                  className="w-full py-3 rounded-xl text-xs font-bold bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 transition-colors shadow-lg cursor-pointer select-none"
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
                  <div className="bg-rose-500/10 border-2 border-rose-500/35 text-rose-600 dark:text-rose-400 text-xs py-3 px-4 rounded-xl font-medium flex items-start gap-2 animate-fadeIn">
                    <svg className="h-4.5 w-4.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{actionError}</span>
                  </div>
                )}
                {actionSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs py-2.5 px-4 rounded-xl font-medium flex items-center gap-2 animate-fadeIn">
                    <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{actionSuccess}</span>
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
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 transition-colors shadow-lg cursor-pointer select-none"
                      >
                        Add Member
                      </button>
                    </form>
                  </div>
                )}

                <hr className="border-darkBorder/40" />

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
                        {selectedGroup.members.map((member) => {
                          const adminId = typeof selectedGroup.admin === "object" ? selectedGroup.admin._id : selectedGroup.admin;
                          const isMemberAdmin = member._id === adminId;
                          
                          return (
                            <button
                              key={member._id}
                              type="button"
                              onClick={() => setSelectedMemberForActions(member)}
                              className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl bg-darkBg/40 border border-darkBorder hover:bg-brandPrimary/10 hover:border-brandPrimary/40 transition-all cursor-pointer text-left focus:outline-none group/item"
                            >
                              <div className="h-7 w-7 rounded-full bg-brandPrimary/25 flex items-center justify-center text-[10px] font-bold text-brandPrimary group-hover/item:bg-brandPrimary group-hover/item:text-white transition-colors">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-left leading-tight flex-1">
                                <span className="text-xs font-semibold text-darkText block group-hover/item:text-brandPrimary transition-colors">
                                  {member.name}
                                </span>
                                <span className="text-[10px] text-darkTextSecondary block">{member.email}</span>
                              </div>
                              {isMemberAdmin ? (
                                <span className="bg-amber-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Admin
                                </span>
                              ) : (
                                <span className="bg-slate-500/15 border border-slate-500/35 text-slate-600 dark:text-slate-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Member
                                </span>
                              )}
                            </button>
                          );
                        })}
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
      <ConfirmModal
        isOpen={isTransferConfirmOpen}
        title="Transfer Admin Privileges"
        message="Are you sure you want to transfer group admin privileges to this member? You will lose admin status for this group."
        confirmText="Transfer"
        cancelText="Cancel"
        onConfirm={async () => {
          if (pendingAdminId) {
            setIsTransferConfirmOpen(false);
            await executeTransferAdmin(pendingAdminId);
          }
        }}
        onCancel={() => {
          setIsTransferConfirmOpen(false);
          setPendingAdminId(null);
        }}
      />
      <ConfirmModal
        isOpen={isRemoveConfirmOpen}
        title="Remove Member"
        message="Are you sure you want to remove this member from the group?"
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
        onConfirm={async () => {
          if (pendingRemoveMemberId) {
            setIsRemoveConfirmOpen(false);
            await executeRemoveMember(pendingRemoveMemberId);
          }
        }}
        onCancel={() => {
          setIsRemoveConfirmOpen(false);
          setPendingRemoveMemberId(null);
        }}
      />
      <ConfirmModal
        isOpen={isLeaveConfirmOpen}
        title="Leave Group"
        message="Are you sure you want to leave this group?"
        confirmText="Leave Group"
        cancelText="Cancel"
        type="danger"
        onConfirm={async () => {
          setIsLeaveConfirmOpen(false);
          await executeLeaveGroup();
        }}
        onCancel={() => {
          setIsLeaveConfirmOpen(false);
        }}
      />

      {/* Member Options Popup/Modal */}
      {selectedMemberForActions && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-darkCard border-2 border-darkBorder rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
            {/* Close button in top-right */}
            <button
              type="button"
              onClick={() => setSelectedMemberForActions(null)}
              className="absolute top-4 right-4 text-darkTextSecondary hover:text-darkText cursor-pointer transition-colors p-1"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-darkText flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-brandPrimary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Member Options
            </h3>

            {/* Member Card Profile representation inside modal */}
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-darkBg/50 border border-darkBorder mb-6">
              <div className="h-12 w-12 rounded-full bg-brandPrimary/20 flex items-center justify-center text-lg font-bold text-brandPrimary">
                {selectedMemberForActions.name.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight flex-1">
                <span className="text-sm font-bold text-darkText block">
                  {selectedMemberForActions.name}
                </span>
                <span className="text-xs text-darkTextSecondary block mb-1">
                  {selectedMemberForActions.email}
                </span>
                {/* Role representation inside modal */}
                {(() => {
                  const adminId = typeof selectedGroup?.admin === "object" ? selectedGroup.admin._id : selectedGroup?.admin;
                  const isMemberAdmin = selectedMemberForActions._id === adminId;
                  return isMemberAdmin ? (
                    <span className="inline-block bg-amber-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Admin / Owner
                    </span>
                  ) : (
                    <span className="inline-block bg-slate-500/15 border border-slate-500/35 text-slate-600 dark:text-slate-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Group Member
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Buttons options */}
            <div className="flex flex-col gap-2.5">
              {(() => {
                const adminId = typeof selectedGroup?.admin === "object" ? selectedGroup.admin._id : selectedGroup?.admin;
                const isUserAdmin = user?._id === adminId;
                const isMeSelected = selectedMemberForActions._id === user?._id;

                return (
                  <>
                    {/* Admin Options */}
                    {isUserAdmin && !isMeSelected && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const memberId = selectedMemberForActions._id;
                            setSelectedMemberForActions(null);
                            handleMakeAdmin(memberId);
                          }}
                           className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-brandPrimary hover:bg-teal-800 dark:hover:bg-teal-400 text-white dark:text-slate-950 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5 select-none"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Make Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const memberId = selectedMemberForActions._id;
                            setSelectedMemberForActions(null);
                            handleRemoveMember(memberId);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5 select-none"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 0v3M4 7h16" />
                          </svg>
                          Remove Member
                        </button>
                      </>
                    )}

                    {/* Non-Admin Me Option */}
                    {!isUserAdmin && isMeSelected && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMemberForActions(null);
                          handleLeaveGroup();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5 select-none"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave Group
                      </button>
                    )}

                    {/* Info text for cases with no actions */}
                    {((!isUserAdmin && !isMeSelected) || (isUserAdmin && isMeSelected)) && (
                      <p className="text-[11px] text-darkTextSecondary bg-darkBg/30 border border-darkBorder p-2.5 rounded-xl text-center">
                        {isMeSelected 
                          ? "You are the Group Admin. You must transfer ownership to another member before leaving." 
                          : "Only the group administrator can manage this member."}
                      </p>
                    )}
                  </>
                );
              })()}

              <button
                type="button"
                onClick={() => setSelectedMemberForActions(null)}
                className="w-full py-2.5 border border-darkBorder bg-darkBg/20 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-darkTextSecondary hover:text-darkText transition-colors cursor-pointer select-none text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManager;
