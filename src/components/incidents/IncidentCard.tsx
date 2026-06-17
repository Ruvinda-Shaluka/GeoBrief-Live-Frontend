import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/store";

export interface Incident {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: 'active' | 'resolved' | 'archived';
  visibility: 'public' | 'private' | 'group';
  upvotes: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  reportedBy: {
    _id: string;
    name: string;
  } | string;
  sharedWithGroups?: string[];
  createdAt: string;
}

interface IncidentCardProps {
  incident: Incident;
  onUpvote?: (id: string) => void;
}

const getCategoryIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "road":
      return (
        <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "power":
      return (
        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "safety":
      return (
        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case "food":
      return (
        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const getCategoryLabel = (type: string) => {
  switch (type.toLowerCase()) {
    case "road": return "Road & Traffic";
    case "power": return "Power Outage";
    case "safety": return "Public Safety";
    case "food": return "Food & Aid";
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

const IncidentCard = ({ incident, onUpvote }: IncidentCardProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleViewOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!incident.location || !incident.location.coordinates) return;
    navigate("/dashboard", {
      state: {
        centerCoordinates: incident.location.coordinates,
        selectedIncidentId: incident._id
      }
    });
  };
  const currentUserId = user?._id;
  const isUpvoted = currentUserId && incident.upvotes?.includes(currentUserId);
  const upvoteCount = incident.upvotes?.length || 0;

  const reporterName = typeof incident.reportedBy === 'object' && incident.reportedBy 
    ? incident.reportedBy.name 
    : "Community Member";

  const formattedDate = new Date(incident.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-darkCard/40 backdrop-blur-md border border-darkBorder/40 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-brandPrimary/30 transition-all duration-300 flex flex-col justify-between text-left group">
      <div>
        {/* Header: Category & Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-darkBorder/20">
              {getCategoryIcon(incident.type)}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-300 block">
                {getCategoryLabel(incident.type)}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                incident.visibility === 'public' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : incident.visibility === 'group'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {incident.visibility}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {formattedDate}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brandPrimary transition-colors duration-200">
          {incident.title}
        </h3>
        <p className="text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed">
          {incident.description}
        </p>
      </div>

      {/* Footer: Reporter & Upvote Button */}
      <div className="border-t border-darkBorder/20 pt-4 flex items-center justify-between mt-auto">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-full bg-purple-900/40 border border-purple-500/20 flex items-center justify-center text-[11px] font-semibold text-purple-300">
            {reporterName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-400">
            By <span className="font-semibold text-slate-300">{reporterName}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {incident.location && incident.location.coordinates && (
            <button
              onClick={handleViewOnMap}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-darkBorder/40 text-[11px] font-semibold text-slate-300 hover:bg-slate-800/40 hover:text-brandPrimary hover:border-brandPrimary/40 transition-all cursor-pointer"
              title="View on Interactive Map"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>View Map</span>
            </button>
          )}

          {onUpvote ? (
            <button
              onClick={() => onUpvote(incident._id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isUpvoted
                  ? "bg-brandPrimary/20 text-brandPrimary border-brandPrimary/50 shadow-md shadow-brandPrimary/10"
                  : "bg-transparent text-slate-400 border-darkBorder/40 hover:bg-slate-800/40 hover:text-white hover:border-slate-500"
              }`}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${isUpvoted ? "scale-110 fill-brandPrimary text-brandPrimary" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span>{upvoteCount}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-darkBorder/20 text-xs font-semibold text-slate-500 bg-darkCard/10 select-none">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{upvoteCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
