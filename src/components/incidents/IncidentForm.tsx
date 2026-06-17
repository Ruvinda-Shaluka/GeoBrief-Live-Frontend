import { useState } from "react";

interface Group {
  _id: string;
  name: string;
}

interface IncidentFormProps {
  coordinates: [number, number];
  groups: Group[];
  onSubmit: (data: {
    title: string;
    description: string;
    type: string;
    visibility: "public" | "private" | "group";
    sharedWithGroups?: string[];
  }) => void;
  onCancel: () => void;
}

const IncidentForm = ({ coordinates, groups, onSubmit, onCancel }: IncidentFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("road");
  const [visibility, setVisibility] = useState<"public" | "private" | "group">("public");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    if (visibility === "group" && selectedGroups.length === 0) {
      setError("Please select at least one group.");
      return;
    }

    onSubmit({
      title,
      description,
      type,
      visibility,
      sharedWithGroups: visibility === "group" ? selectedGroups : [],
    });
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <div className="bg-darkCard/80 backdrop-blur-xl border border-darkBorder/60 p-6 rounded-2xl shadow-2xl text-left space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-darkBorder/20">
        <h3 className="text-xl font-bold text-white">Report New Incident</h3>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Coordinates Read-only Info */}
        <div className="bg-slate-900/60 border border-darkBorder/20 px-4 py-2.5 rounded-xl text-xs space-y-1">
          <span className="text-slate-400 font-semibold block">PINNED LOCATION</span>
          <div className="flex justify-between text-slate-300 font-mono">
            <span>Lat: {coordinates[1].toFixed(5)}</span>
            <span>Lng: {coordinates[0].toFixed(5)}</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs py-2 px-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <label htmlFor="title" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Severe Road Pothole, Power Outage"
            className="w-full bg-slate-900/40 border border-darkBorder/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandPrimary transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="description" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detail on the incident..."
            rows={3}
            className="w-full bg-slate-900/40 border border-darkBorder/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandPrimary transition-colors resize-none"
          />
        </div>

        {/* Category Type */}
        <div className="space-y-1">
          <label htmlFor="type" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Incident Category
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-900 border border-darkBorder/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandPrimary transition-colors"
          >
            <option value="road">Road & Traffic</option>
            <option value="power">Power Outage</option>
            <option value="safety">Public Safety</option>
            <option value="food">Food & Aid</option>
            <option value="other">Other Category</option>
          </select>
        </div>

        {/* Visibility */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
            Visibility Layer
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["public", "private", "group"] as const).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => {
                  setVisibility(layer);
                  setError(null);
                }}
                className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                  visibility === layer
                    ? "bg-brandPrimary text-white border-brandPrimary shadow-lg shadow-brandPrimary/10"
                    : "bg-slate-900/40 text-slate-400 border-darkBorder/40 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* Group Selector - only visible when visibility is group */}
        {visibility === "group" && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Share With Groups
            </label>
            {groups.length === 0 ? (
              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-darkBorder/20">
                You are not in any groups. Go to <span className="font-semibold text-brandPrimary">My Groups</span> to create or join one first.
              </div>
            ) : (
              <div className="max-h-28 overflow-y-auto border border-darkBorder/40 rounded-xl p-2 space-y-1 bg-slate-900/40">
                {groups.map((group) => {
                  const isChecked = selectedGroups.includes(group._id);
                  return (
                    <button
                      key={group._id}
                      type="button"
                      onClick={() => handleGroupToggle(group._id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isChecked 
                          ? "bg-brandPrimary/15 text-brandPrimary border border-brandPrimary/30" 
                          : "bg-transparent text-slate-300 border border-transparent hover:bg-slate-800"
                      }`}
                    >
                      <span>{group.name}</span>
                      {isChecked ? (
                        <svg className="h-4 w-4 text-brandPrimary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="h-4 w-4 rounded border border-darkBorder/60" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-darkBorder/20">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-darkBorder/60 text-slate-300 bg-transparent hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brandPrimary text-white hover:bg-purple-500 transition-colors shadow-lg cursor-pointer"
          >
            Create Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;
