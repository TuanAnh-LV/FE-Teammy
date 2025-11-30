import React, { useState } from "react";
import { Drawer, Button } from "antd";
import { Users } from "lucide-react";
import PresenceIndicator from "./PresenceIndicator";

const MemberListDrawer = ({ presence = {}, currentUserId, isGroupSession }) => {
  const [open, setOpen] = useState(false);

  if (!isGroupSession) return null;

  const totalMembers = Object.keys(presence).length;
  const onlineMembers = Object.values(presence).filter((m) => m.status === "online").length;

  return (
    <>
      <Button
        type="text"
        icon={<Users className="w-4 h-4" />}
        onClick={() => setOpen(true)}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline text-xs text-gray-600">
          {onlineMembers}/{totalMembers}
        </span>
      </Button>

      <Drawer
        title="Group Members"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={300}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-green-600">{onlineMembers}</span> online of{" "}
              <span className="font-semibold">{totalMembers}</span> members
            </p>
          </div>
          <PresenceIndicator presence={presence} currentUserId={currentUserId} />
        </div>
      </Drawer>
    </>
  );
};

export default MemberListDrawer;
