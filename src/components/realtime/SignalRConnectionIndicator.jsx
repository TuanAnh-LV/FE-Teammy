import { useAuth } from "../../context/AuthContext";
import { useGroupInvitationSignalR } from "../../hook/useGroupInvitationSignalR";


export default function SignalRConnectionIndicator() {
  const { token, userInfo } = useAuth();
  const { isConnected } = useGroupInvitationSignalR(token, userInfo?.userId, {});

  if (!token || !userInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        
        <span className="text-xs font-semibold text-gray-700">
          {isConnected ? "SignalR Connected" : "SignalR Disconnected"}
        </span>
      </div>
    </div>
  );
}
