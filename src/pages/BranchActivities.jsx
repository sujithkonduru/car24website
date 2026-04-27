import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function BranchActivities() {
  const { user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Branch Activities Log</h1>
      <p>Branch Head: {user?.name || "Unknown"}</p>
      <p>Role: branch_head</p>
      <div style={{ marginTop: "2rem", color: "#666" }}>
        Placeholder - Recent activities and logs for your branch coming soon.
      </div>
    </div>
  );
}
