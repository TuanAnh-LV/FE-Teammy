import React from "react";
import { Users, Circle } from "lucide-react";

const PresenceIndicator = ({ presence = {}, currentUserId }) => {
  const members = Object.entries(presence).map(([userId, data]) => ({
    userId,
    ...data,
  }));

  const onlineMembers = members.filter((m) => m.status === "online");
  const offlineMembers = members.filter((m) => m.status === "offline");

  if (members.length === 0) return null;

  return (
    <div className="space-y-2">
      {onlineMembers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 px-2">ONLINE</p>
          <div className="space-y-1">
            {onlineMembers.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-2 px-2 py-1 hover:bg-blue-50 rounded"
              >
                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                <span className="text-sm text-gray-700">{member.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {offlineMembers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 px-2">OFFLINE</p>
          <div className="space-y-1">
            {offlineMembers.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-2 px-2 py-1 opacity-60"
              >
                <Circle className="w-2 h-2 fill-gray-300 text-gray-300" />
                <span className="text-sm text-gray-500">{member.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresenceIndicator;
