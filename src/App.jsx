import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignagePlayer from './SignagePlayer';
import AdminDashboard from './admin/AdminDashboard';

import AdminHub from './admin/AdminHub';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<SignagePlayer />} />
        <Route path="/admin" element={<AdminHub />} />
        <Route path="/admin/editor/:projectId" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
