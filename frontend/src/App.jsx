import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route goes to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes — no login needed */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — must be logged in */}
        <Route path="/home" element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        } />

        {/* Catch any unknown URL and redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}