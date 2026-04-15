import { Navigate } from 'react-router-dom';

// This component wraps any page that needs login
// If no token is found it redirects to login automatically
export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}