import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "./App.css"
import Register from './pages/Register';
import Login from './pages/Login';
import Admin from './pages/Dashboard';
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';
import AuthLayout from './components/layouts/AuthLayout';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">

        <div className="flex-grow flex flex-col">
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Route>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/users/:userId" element={<UserDetails />} />
          </Routes>
        </div>


      </div>
    </Router>
  );
}

export default App;
