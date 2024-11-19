import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home.js';
import Winner from './pages/Winner.js';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/winner" element={<Winner />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;