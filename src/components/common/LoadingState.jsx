const LoadingState = ({ fullscreen = true, rows = 2 }) => {
  const activitySkeletons = Array.from({ length: rows });

  return (
    <div
      className={`w-full flex justify-center ${
        fullscreen ? "min-h-screen pt-20 pb-24" : "py-10"
      }`}
      role="status"
      aria-busy="true"
    >
      <div className="w-full max-w-6xl px-6 animate-pulse">
        {/* Header: back link + group info + buttons */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="space-y-3">
            {/* Back to groups */}
            <div className="h-4 w-28 rounded-full bg-gray-100" />

            {/* Group name + status */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-40 rounded-full bg-gray-200" />
              <div className="h-5 w-16 rounded-full bg-gray-100" />
            </div>

            {/* Chips (major, semester, due date, members) */}
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`chip-${i}`}
                  className="h-5 w-24 rounded-full bg-gray-100"
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 self-start md:self-auto">
            <div className="h-10 w-28 rounded-xl bg-gray-200" />
            <div className="h-10 w-28 rounded-xl bg-gray-200" />
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 space-y-2">
          <div className="h-3 w-24 rounded-full bg-gray-100" />
          <div className="h-2 w-full rounded-full bg-gray-100" />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-100 mb-6">
          {["Overview", "Team Members", "Workspace", "Files"].map((tab) => (
            <div
              key={tab}
              className="h-9 w-24 rounded-full bg-gray-100"
            />
          ))}
        </div>

        {/* Main content: 2-column layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Description card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-24 rounded-full bg-gray-200 mb-4" />
              <div className="h-3 w-1/2 rounded-full bg-gray-100" />
            </div>

            {/* Recent Activity card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-28 rounded-full bg-gray-200" />
                <div className="h-3 w-16 rounded-full bg-gray-100" />
              </div>

              <div className="space-y-4">
                {activitySkeletons.map((_, idx) => (
                  <div
                    key={`activity-${idx}`}
                    className="flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded-full bg-gray-200" />
                      <div className="h-3 w-1/3 rounded-full bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Team Members card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-28 rounded-full bg-gray-200" />
                <div className="h-3 w-16 rounded-full bg-gray-100" />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 rounded-full bg-gray-200" />
                  <div className="h-3 w-1/4 rounded-full bg-gray-100" />
                </div>
              </div>

              <div className="h-9 w-full rounded-xl bg-gray-100" />
            </div>

            {/* Mentor card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-20 rounded-full bg-gray-200 mb-4" />
              <div className="h-3 w-1/2 rounded-full bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
