import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import './App.css';

function App() {
  return (
    <Router>
      <DataProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<CoursePage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
          </Routes>
        </div>
      </DataProvider>
    </Router>
  );
}

export default App;
