import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Particle from './pages/Particle';


function AppContent({ isDarkMode, onToggleTheme }) {
  const location = useLocation();

  const hideNavbarRoutes = ['/login', '/register', '/dashboard', '/medication', '/appoint'];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && (
        <Navbar isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
      )}
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/particle' element={<Particle />} />
          <Route path='/about' element={<Navigate to='/#about' replace />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return window.localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // The selected theme still works for this visit when storage is unavailable.
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className='App' data-theme={isDarkMode ? 'dark' : 'light'}>
        <AppContent
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((currentMode) => !currentMode)}
        />
      </div>
    </Router>
  );
}

export default App;