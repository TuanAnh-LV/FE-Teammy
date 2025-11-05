import React from "react";
import { UserRound } from "lucide-react";

export default function MembersList({ members, totalLabel, membersLabel }) {
  return (
    <div className="!bg-white/90 !border !border-gray-200 !rounded-2xl !shadow-md !p-6">
      <h3 className="!font-bold !text-lg !text-gray-800 !mb-4 !flex !items-center !gap-2">
        <span className="!bg-green-100 !p-2 !rounded-lg">
          <UserRound className="!text-green-600 !w-5 !h-5" />
        </span>
        {membersLabel || "Members"}
      </h3>

      {members.map((m, i) => (
        <div
          key={i}
          className="!flex !items-center !gap-4 !border !rounded-xl !p-4 !mb-3 !bg-gray-50 hover:!bg-gray-100 !transition"
        >
          <img
            src={`https://i.pravatar.cc/80?img=${i + 3}`}
            alt={m.name}
            className="!w-12 !h-12 !rounded-full !object-cover !shadow"
          />
          <div className="!flex-1">
            <p className="!font-semibold !text-gray-800">{m.name}</p>
            <p className="!text-sm !text-gray-600">{m.email}</p>
          </div>
        </div>
      ))}

      <p className="!text-right !text-sm !text-gray-500 !mt-2">
        {totalLabel || "Total"}: {members.length} {membersLabel || "members"}
      </p>
    </div>
  );
}
