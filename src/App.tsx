import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Statistics from './pages/Statistics';
import Users from './pages/Users';
import Zones from './pages/Zones';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { initializeData } from './store/initializeData';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'admin' | 'taskManager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requiredPermission === 'taskManager' && 
      user.role !== 'admin' && 
      !user.canManageTasksAndRoutines) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route 
            path="/statistics" 
            element={
              <ProtectedRoute requiredPermission="taskManager">
                <Statistics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredPermission="admin">
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/zones" 
            element={
              <ProtectedRoute requiredPermission="admin">
                <Zones />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;