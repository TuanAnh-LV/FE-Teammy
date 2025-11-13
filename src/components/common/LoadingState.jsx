import React from "react";

const LoadingState = ({
  message = "Loading...",
  subtext = "Please wait while we prepare everything for you.",
  fullscreen = false,
  rows = 4,
}) => {
  const skeletons = Array.from({ length: rows });

  return (
    <div
      className={`${
        fullscreen ? "min-h-screen" : "py-16"
      } flex flex-col items-center justify-center text-center px-6 mt-10`}
      role="status"
      aria-busy="true"
    >
      <div className="w-full max-w-2xl space-y-4">
        {skeletons.map((_, idx) => (
          <div
            key={`loading-row-${idx}`}
            className="flex w-full gap-4"
          >
            <span className="h-12 w-12 rounded-2xl bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-3">
              <span className="block h-4 w-3/4 rounded-full bg-gray-200 animate-pulse" />
              <span className="block h-3 w-full rounded-full bg-gray-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* <div className="mt-10">
        <p className="text-lg font-semibold text-gray-900">{message}</p>
        {subtext && (
          <p className="mt-2 text-sm text-gray-500 max-w-md">{subtext}</p>
        )}
      </div> */}
    </div>
  );
};

export default LoadingState;
