import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';

// Page imports
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import Bookings from './pages/Bookings';
import Booking from './pages/Booking';
import Rides from './pages/Rides';
import RideDetails from './pages/RideDetails';
import MyRides from './pages/MyRides';
import CreateRide from './pages/CreateRide';
import RideRequests from './pages/RideRequests';
import HostVehicles from './pages/HostVehicles';
import HostAddVehicle from './pages/HostAddVehicle';
import HostEditVehicle from './pages/HostEditVehicle';
import HostRides from './pages/HostRides';

// ProtectedRoute wrapper component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('email');
    const userId = localStorage.getItem('userId');
    
    if (token && email) {
      setUser({ email, userId });
      setIsLoggedIn(true);
    }
  }, []);

  // Login handler - receives data from Login component
  const handleLogin = (data) => {
    setUser({
      email: data.email,
      userId: data.userId,
      ...data.user
    });
    setIsLoggedIn(true);
    navigate('/');
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <nav className="topbar">
        <div className="brand">
          <div className="brand-mark">Z</div>
          <span>ZoomHopr</span>
        </div>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
          <NavLink to="/vehicles" className={({ isActive }) => isActive ? 'active' : ''}>
            Vehicles
          </NavLink>
          <NavLink to="/rides" className={({ isActive }) => isActive ? 'active' : ''}>
            Rides
          </NavLink>
          {isLoggedIn && (
            <>
              <NavLink to="/my-rides" className={({ isActive }) => isActive ? 'active' : ''}>
                My Rides
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                Profile
              </NavLink>
            </>
          )}
        </div>

        <div className="nav-user">
          {isLoggedIn ? (
            <>
              <div className="avatar">{getUserInitial()}</div>
              <button onClick={handleLogout} style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                color: '#777'
              }}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" style={{
              fontWeight: '600',
              fontSize: '14px',
              color: '#777',
              textDecoration: 'none'
            }}>
              Login
            </NavLink>
          )}
        </div>
      </nav>

      {/* Main Content Area with Routes */}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          
          {/* Semi-public routes - accessible but may show different content when logged in */}
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/rides/:id" element={<RideDetails />} />

          {/* Protected Routes - require authentication */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile user={user} setUser={setUser} />
            </ProtectedRoute>
          } />
          
          <Route path="/bookings" element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } />
          
          <Route path="/booking/:id" element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          } />
          
          <Route path="/my-rides" element={
            <ProtectedRoute>
              <MyRides />
            </ProtectedRoute>
          } />

          {/* Host Routes - Protected */}
          <Route path="/host/vehicles" element={
            <ProtectedRoute>
              <HostVehicles />
            </ProtectedRoute>
          } />
          
          <Route path="/host/vehicles/new" element={
            <ProtectedRoute>
              <HostAddVehicle />
            </ProtectedRoute>
          } />
          
          <Route path="/host/vehicles/:id/edit" element={
            <ProtectedRoute>
              <HostEditVehicle />
            </ProtectedRoute>
          } />
          
          <Route path="/host/rides" element={
            <ProtectedRoute>
              <HostRides />
            </ProtectedRoute>
          } />
          
          <Route path="/host/rides/new" element={
            <ProtectedRoute>
              <CreateRide />
            </ProtectedRoute>
          } />
          
          <Route path="/ride-requests" element={
            <ProtectedRoute>
              <RideRequests />
            </ProtectedRoute>
          } />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;