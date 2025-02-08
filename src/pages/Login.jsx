import React, { useState } from 'react'
import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom'
import { useAuth } from '../assets/context/ContextProvider'



const Login = () => {
const navigate = useNavigate()
const[email,setEmail] = useState()
const[password,setPassword] = useState()
const {login} = useAuth()

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post("https://notes-app-backend-6nc9.onrender.com/api/auth/login", 
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data && response.data.token) {
      // Store the complete token including 'Bearer '
      localStorage.setItem("token", response.data.token);
      login(response.data.user);
      console.log("Token stored:", response.data.token); // Debug log
      navigate("/");
    }
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Login failed");
  }
};
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => setEmail( e.target.value )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have account?
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
             Register
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login