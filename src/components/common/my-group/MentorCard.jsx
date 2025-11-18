import React from "react";
import { Users } from "lucide-react";

export default function MentorCard({ name, label }) {
  return (
    <div className="!bg-white/90 !border !border-gray-200 !rounded-2xl !shadow-md !p-6">
      <h3 className="!font-bold !text-lg !text-gray-800 !mb-4 !flex !items-center !gap-2">
        {label || "Mentor"}
      </h3>
      <div className="!bg-amber-50 !rounded-xl !border !border-amber-100 !p-4 !flex !items-center !gap-4">
        <img
          src="https://i.pravatar.cc/80?img=12"
          alt="mentor"
          className="!w-12 !h-12 !rounded-full !object-cover !border !border-white !shadow"
        />
        <div>
          <p className="!font-semibold !text-gray-800">{name}</p>
          <p className="!font-semibold !text-gray-800">{name.email}</p>
          <p className="!text-sm !text-amber-700 !font-medium">
            {label || "Mentor"}
          </p>
        </div>
      </div>
    </div>
  );
}
