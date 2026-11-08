import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import TeacherClassesTab from "./teacher/TeacherClassesTab";
import TeacherAttendanceTab from "./teacher/TeacherAttendanceTab";
import TeacherExamsTab from "./teacher/TeacherExamsTab";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("classes");

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Teacher Portal</h1>
          <p className="text-muted small mb-0">Welcome back, <strong>{displayName}</strong></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex flex-wrap gap-2 py-2">
        <button
          className={`btn btn-sm ${activeTab === "classes" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("classes")}
        >
          🏫 My Classes & Students
        </button>
        <button
          className={`btn btn-sm ${activeTab === "attendance" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("attendance")}
        >
          📋 Mark Attendance
        </button>
        <button
          className={`btn btn-sm ${activeTab === "exams" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("exams")}
        >
          📝 Assessments & Scores
        </button>
      </div>

      {activeTab === "classes" && <TeacherClassesTab />}
      {activeTab === "attendance" && <TeacherAttendanceTab />}
      {activeTab === "exams" && <TeacherExamsTab />}
    </div>
  );
}
