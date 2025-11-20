import React from "react";
import { Users } from "lucide-react";

export default function MentorCard({ name,email, label }) {
  return (
    <div className="bg-white/90 border border-gray-200 rounded-2xl shadow-md p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
        {label || "Mentor"}
      </h3>
      <div className="rounded-xl border border-gray-100 p-4 flex items-center gap-4">
        <img
          src={name.avatarUrl}
          alt="mentor"
          className="w-12 h-12 rounded-full object-cover border border-white shadow"
        />
        <div>
          <p className="text-sm font-semibold text-gray-800">{name}  </p>
          <p className="text-[12px] text-gray-400">{label || "Mentor"}</p>
          <p className="text-[12px] text-gray-400">{email}</p>
        </div>
      </div>
    </div>
  );
}
