import { useState } from "react";
import StatCard from "../components/StatCard";
import { naira } from "../lib/format";
import { useApi } from "../lib/useApi";
import UsersSection from "./admin/UsersSection";
import StudentsSection from "./admin/StudentsSection";
import TeachersSection from "./admin/TeachersSection";
import AcademicsSection from "./admin/AcademicsSection";
import AttendanceSection from "./admin/AttendanceSection";
import ExamsSection from "./admin/ExamsSection";
import FeesSection from "./admin/FeesSection";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const students = useApi("/api/students/");
  const teachers = useApi("/api/teachers/");
  const session = useApi("/api/academics/sessions/current/");
  const owing = useApi("/api/fees/balances/outstanding/");
  const classes = useApi("/api/academics/classes/");

  const studentCount = students.data?.count ?? (Array.isArray(students.data) ? students.data.length : "—");
  const teacherCount = teachers.data?.count ?? (Array.isArray(teachers.data) ? teachers.data.length : "—");

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Administrator Portal</h1>
          <p className="text-muted small mb-0">
            Current Academic Session:{" "}
            <span className="badge bg-primary-subtle text-primary fw-semibold">
              {session.loading ? "Loading…" : session.data?.name || "Not set"}
            </span>
          </p>
        </div>
      </div>

      {/* Main Module Tabs */}
      <div className="d-flex flex-wrap gap-2 py-2">
        <button
          className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`btn btn-sm ${activeTab === "users" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("users")}
        >
          👥 User Accounts
        </button>
        <button
          className={`btn btn-sm ${activeTab === "students" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("students")}
        >
          🎓 Students
        </button>
        <button
          className={`btn btn-sm ${activeTab === "teachers" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("teachers")}
        >
          🧑‍🏫 Teachers
        </button>
        <button
          className={`btn btn-sm ${activeTab === "academics" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("academics")}
        >
          📚 Academics & Enrollment
        </button>
        <button
          className={`btn btn-sm ${activeTab === "attendance" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("attendance")}
        >
          📋 Attendance
        </button>
        <button
          className={`btn btn-sm ${activeTab === "exams" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("exams")}
        >
          📝 Exams & Grades
        </button>
        <button
          className={`btn btn-sm ${activeTab === "fees" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("fees")}
        >
          💳 School Fees
        </button>
      </div>

      {/* OVERVIEW CONTENT */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="row g-3">
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Total Students" state={students}>
                {() => studentCount}
              </StatCard>
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Total Teachers" state={teachers}>
                {() => teacherCount}
              </StatCard>
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Classes Configured" state={classes}>
                {(d) => d?.length || 0}
              </StatCard>
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Fees Outstanding" state={owing}>
                {(d) => naira(d.total_outstanding)}
              </StatCard>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">Management Modules</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-primary">Students & Teachers</h6>
                      <p className="small text-muted mb-3">
                        Register user accounts, admission numbers, staff credentials, guardian contacts, and search records.
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => setActiveTab("students")}>
                        Students
                      </button>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => setActiveTab("teachers")}>
                        Teachers
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-primary">Classes & Enrollments</h6>
                      <p className="small text-muted mb-3">
                        Set up classes (JSS1–SS3), subjects (Maths, English), assign subject teachers, and bulk-enroll students.
                      </p>
                    </div>
                    <button className="btn btn-outline-primary btn-sm align-self-start" onClick={() => setActiveTab("academics")}>
                      Manage Academics
                    </button>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-primary">Attendance Registers</h6>
                      <p className="small text-muted mb-3">
                        Mark daily class attendance (present, late, absent) and review automated attendance percentage calculations.
                      </p>
                    </div>
                    <button className="btn btn-outline-primary btn-sm align-self-start" onClick={() => setActiveTab("attendance")}>
                      Mark Register
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-primary">Exams, Scores & Class Results</h6>
                      <p className="small text-muted mb-3">
                        Create assessments, record batch test and exam scores with max-mark validation, and generate compiled class result sheets.
                      </p>
                    </div>
                    <button className="btn btn-outline-primary btn-sm align-self-start" onClick={() => setActiveTab("exams")}>
                      Exams & Results
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-primary">Fee Structures & Payments</h6>
                      <p className="small text-muted mb-3">
                        Define school fees by class and term, record payments with receipt numbers, and monitor outstanding debtors.
                      </p>
                    </div>
                    <button className="btn btn-outline-primary btn-sm align-self-start" onClick={() => setActiveTab("fees")}>
                      Fees Management
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE SECTION CONTENT */}
      {activeTab === "users" && <UsersSection />}
      {activeTab === "students" && <StudentsSection />}
      {activeTab === "teachers" && <TeachersSection />}
      {activeTab === "academics" && <AcademicsSection />}
      {activeTab === "attendance" && <AttendanceSection />}
      {activeTab === "exams" && <ExamsSection />}
      {activeTab === "fees" && <FeesSection />}
    </div>
  );
}
