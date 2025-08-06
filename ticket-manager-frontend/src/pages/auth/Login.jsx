// src/components/auth/Login.jsx
import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../serivces/api';
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from '../../context/useAuth';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const { loginUser } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };



const handleLogin = async (e) => {
  e.preventDefault();
  await loginUser(username, password); // ✅ Use context
};


//   const handleLogin = async (e) => {
//   e.preventDefault();
//   setError(""); // clear previous error

//   try {
//     setLoading(true);
//     const response = await api.post("http://localhost:8000/api/token/", { username, password });

//     // ✅ Handle non-200 response (defensive, although axios throws on error by default)
//     if (response.status !== 200) {
//       const errMsg =
//         response.data?.error ||
//         response.data?.message ||
//         "Login failed. Please check your credentials.";
//       setError(errMsg);
//       toast.error(errMsg);
//       return;
//     }

//     const { user, access, refresh, status } = response.data;

//     // ✅ Save tokens and user
//     console.log("Login Successful:", response);

//     localStorage.setItem("user", JSON.stringify(user));
//     localStorage.setItem("access", access);
//     localStorage.setItem("refresh", refresh);

//     // ✅ Update Redux auth state
//     // dispatch(setAuthData(response.data));

//     // ✅ Navigate only if status is 200
//     if (response.status === 200) {
//       navigate("/dashboard", { replace: true });
//     }

//   } catch (error) {
//     const errMsg =
//       error.response?.data?.error ||
//       error.response?.data?.message ||
//       "Login failed. Please check your credentials.";
//     setError(errMsg);
//     toast.error(errMsg);
//     console.error("Login Failed:", error);
//   } finally {
//     setLoading(false);
//   }
// };







  // const handleChange = e => {
  //   setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  // };

  // const handleSubmit = async e => {
  //   e.preventDefault();
  //   try {
  //     const res = await api.post('http://localhost:8000/api/token/', formData);
  //     localStorage.setItem('access', res.data.access);
  //     localStorage.setItem('refresh', res.data.refresh);
  //     navigate('/dashboard');
  //   } catch (error) {
  //     alert('Invalid credentials');
  //   }
  // };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-col justify-center items-center mb-6">
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 rounded-full shadow-lg">
            User Login
          </h2>
        </div>

        <form onSubmit={handleLogin}>
          {/* <div className="mb-4">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}


          <div className='mb-4'>
            <input 
            type='text'
            name='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='username'
            required 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'/>
          </div>
          
          <div className="mb-6 relative">
            <input
              type={showPassword ? "text" : "password"} // Toggle input type
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              onClick={togglePasswordVisibility} // Toggle password visibility
              className="absolute top-2 right-2 cursor-pointer text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}{" "}
              {/* Change the icon based on visibility */}
            </span>
          </div>
      
          <button
          //   type="submit"
          //   className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          // >
          //   LOGIN
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-lg transition duration-200 ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}>
            {loading ? "loging in..." : "LOGIN"}
          </button>
        </form>

  

        {error && <div className="mt-4 bg-red-100 text-red-700 text-center">{error}</div>}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?
            <Link to="/register" className="text-blue-500 hover:underline">
              Signup
            </Link>

          
          </p>
        </div>
      </div>
    </div>
  );






















}

export default Login;
