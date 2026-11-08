import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import StudentProfileTab from "./student/StudentProfileTab";
import StudentAttendanceTab from "./student/StudentAttendanceTab";
import StudentGradesTab from "./student/StudentGradesTab";
import StudentFeesTab from "./student/StudentFeesTab";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Student Portal</h1>
          <p className="text-muted small mb-0">Welcome, <strong>{displayName}</strong></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex flex-wrap gap-2 py-2">
        <button
          className={`btn btn-sm ${activeTab === "profile" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("profile")}
        >
          🎓 Profile & Subjects
        </button>
        <button
          className={`btn btn-sm ${activeTab === "attendance" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("attendance")}
        >
          📋 Attendance
        </button>
        <button
          className={`btn btn-sm ${activeTab === "grades" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("grades")}
        >
          📝 Grades & Report Card
        </button>
        <button
          className={`btn btn-sm ${activeTab === "fees" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("fees")}
        >
          💳 School Fees & Payment
        </button>
      </div>

      {activeTab === "profile" && <StudentProfileTab />}
      {activeTab === "attendance" && <StudentAttendanceTab />}
      {activeTab === "grades" && <StudentGradesTab />}
      {activeTab === "fees" && <StudentFeesTab />}
    </div>
  );
}
