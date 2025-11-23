import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

export default function App() {
    return (
        <Router>
            <div className="app-container">
                <div className="main-card">
                    <Navbar />

                    {/* Image Placeholder */}
                    <div className="banner-image">
                        <div className="banner-placeholder">Campus Banner Area</div>
                    </div>

                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/teacher-login" element={<TeacherLogin />} />
                        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                        <Route path="/student-login" element={<StudentLogin />} />
                        <Route path="/student-dashboard/:id" element={<StudentDashboard />} />
                    </Routes>

                    <footer className="footer">
                        <div className="footer-text">DB: MongoDB Atlas (Cloud)</div>
                    </footer>
                </div>
            </div>
        </Router>
    );
}