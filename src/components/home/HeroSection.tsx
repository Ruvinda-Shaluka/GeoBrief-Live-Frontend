const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-darkCard backdrop-blur-xl border-2 border-darkBorder p-8 md:p-12 mb-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Background glowing decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brandPrimary/10 rounded-full blur-[80px] -z-10 animate-pulse" />
      <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-purple-600/10 rounded-full blur-[60px] -z-10" />

      {/* Hero Content */}
      <div className="flex-1 space-y-4 text-left">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brandPrimary/10 border border-brandPrimary/35 text-brandPrimary text-xs font-semibold uppercase tracking-wider">
          <span className="flex h-2 w-2 rounded-full bg-brandPrimary animate-ping" />
          <span>Real-time Spatial Feed</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-darkText leading-tight">
          Track Local Incidents <br />
          <span className="bg-gradient-to-r from-brandPrimary to-purple-400 bg-clip-text text-transparent">
            In Real-Time
          </span>
        </h1>
        <p className="text-darkTextSecondary max-w-xl text-base md:text-lg leading-relaxed">
          GeoBrief-Live empowers communities to monitor road hazards, power outages, and civic safety alerts. Stay connected with public, private, and group visibility layers.
        </p>
      </div>

      {/* Visual Feature/Card Showcase */}
      <div className="flex-shrink-0 w-full md:w-80 bg-darkBg border-2 border-darkBorder p-6 rounded-2xl shadow-xl space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-darkTextSecondary">STATUS MONITOR</span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-3/4 bg-darkCard rounded" />
          <div className="h-2 w-1/2 bg-darkCard rounded" />
        </div>
        <div className="border-t border-darkBorder/40 pt-4 flex justify-between items-center text-xs">
          <div className="flex items-center space-x-1.5 text-darkTextSecondary">
            <svg className="h-4 w-4 text-brandPrimary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Live Map Active</span>
          </div>
          <span className="text-brandPrimary font-bold">CartoDB Dark</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
