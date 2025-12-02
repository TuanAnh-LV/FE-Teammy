import React, { useState, useEffect } from "react";
import { GroupService } from "../../../services/group.service";

const ProfileGroups = ({ userId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await GroupService.getMyGroups(false);
        const data = response?.data || [];
        const normalizedGroups = Array.isArray(data) ? data : data?.items || [];
        
        setGroups(
          normalizedGroups.map((g, idx) => ({
            id: g.id || g.groupId || idx,
            name: g.name || g.groupName || "Project",
            role: g.role || g.memberRole || "",
            status: g.status || "Active",
            progress: g.progress || g.projectProgress || 0,
          }))
        );
      } catch (error) {

        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No groups found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">My Groups</h2>
      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="border border-gray-100 rounded-2xl p-4 md:p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {group.name}
                </p>
                {group.role && (
                  <p className="text-sm text-gray-500">Role: {group.role}</p>
                )}
              </div>
              <button className="px-4 py-1.5 text-xs md:text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm">
                View Details
              </button>
            </div>

            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              {group.status}
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Project Progress</span>
                <span>{group.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${group.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileGroups;

