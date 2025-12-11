import React from "react";
import { useAuth } from "../../../context/AuthContext";
import GroupPostsList from "./GroupPostsList";


export default function GroupPostsTab({ groupId, groupData }) {
  const { userInfo } = useAuth();

  const isLeader = groupData?.leader?.userId === userInfo?.userId;

  return (
    <GroupPostsList 
      groupId={groupId} 
      isLeader={isLeader}
    />
  );
}
