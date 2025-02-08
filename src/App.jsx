import React from 'react'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Login from './pages/Login'
import FavouriteCard from './pages/FavouriteCard'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/favourites" element={ <FavouriteCard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App
