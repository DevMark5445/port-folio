import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

function AppContent() {
  const location = useLocation();

  const hideNavbarRoutes = ['/login', '/register', '/dashboard', '/medication', '/appoint'];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
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