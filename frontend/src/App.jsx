import './App.css';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Particle from './pages/Particle';


function AppContent() {
  const location = useLocation();

  const hideNavbarRoutes = ['/login', '/register', '/dashboard', '/medication', '/appoint'];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
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
  return (
    <Router>
      <div className='App'>
        <AppContent />
      </div>
    </Router>
  );
}

export default App;