// src/components/auth/Signup.jsx
import React, { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import api from '../../serivces/api';

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email:'',
    username:'',
    password:'',
    confirmPassword:'',
  });





  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };







  const [errors, setErrors] = useState({});
  const [err, setErr] = useState('');




  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]:value
    }));
  };




  const validate =() => {
    let tempErrors = {};
    


    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
    }


    if (!formData.username.trim()) {
      tempErrors.username = "Username is required";
    } else if (!/^[a-zA-Z]+$/.test(formData.username)){
      tempErrors.username = "Username can only contain letters (no numbers or special characters)";
    }

   

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at leat 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}/.test(formData.password)) {
      tempErrors.password ="Password must contain at least one upercase letter , one special character , one digit , and one lowercase leter";
    }


    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;

  };




    const handleSignup = async (e) => {
      e.preventDefault();

      if (validate()) {
        setLoading(true); // Start loader
        try {
          const response = await api.post('http://localhost:8000/api/register/', {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          });

          // Success: redirect to login page
          navigate('/login');
        } catch (error) {
          console.error('Signup failed:', error);

          // Try to extract readable error message
          if (error.response && error.response.data) {
            const errorData = error.response.data;

            // If the response includes field-specific errors
            const messages = Object.values(errorData)
              .flat()
              .join(' ');

            setErr(messages || 'Signup failed. Please try again.');
          } else {
            setErr('Something went wrong. Please try again later.');
          }
          
        } finally {
      setLoading(false); // Stop loader
    }
      }
    };


    return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-lg p-6'>
        <div className='text-center mb-6'>

        <div className="flex flex-col justify-center items-center mb-6">
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 rounded-full shadow-lg">
              User Register
          </h2>
        </div>
        </div>
        <form onSubmit={handleSignup}>
          
          <div className='mb-4'>
            <input 
            type='text'
            name='username'
            value={formData.username}
            onChange={handleChange}
            placeholder='username'
            required 
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'/>
            {errors.username && <span className='text-red-500 text-sm'>{errors.username}</span>}
          </div>



          <div className='mb-4'>
            <input
            type="email" 
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='Email'
            required
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500'
            />
            {errors.email && <span className='text-red-500 text-sm'>{errors.email}</span>}
          </div>


          <div className='mb-4 relative'>
            <input
            type={showPassword ? "text" : "password"}
            name='password'
            value={formData.password}
            onChange={handleChange}
            placeholder='Password'
            required
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus;ring-blue-500'
            ></input>
            <span
              onClick={togglePasswordVisibility} // Toggle password visibility
              className="absolute top-2 right-2 cursor-pointer text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}{" "}
              {/* Change the icon based on visibility */}
            </span>
            {errors.password && <span className='text-red-500  text-sm'>{errors.password}</span>}
          </div>


          <div className='mb-4'>
            <input 
            type='password'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder='Confirm Password'
            required
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' 
            />
            {errors.confirmPassword && <span className='text-red-500 text-sm'>{errors.confirmPassword}</span>}
          </div>

          <button 
          // type="submit"
          // className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
          // SIGNUP
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-lg transition duration-200 ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}>
            {loading ? "Signing Up..." : "SIGNUP"}
        </button>

          
          {/* <Button>SIGNUP</Button> */}
         

        </form>
{err && <div className='mt-4 text-red-500 text-center'>{err}</div>}

    <div className='mt-4 text-center'>
      <p className='text-gray-600'>
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 hover:underline" >
        Login </Link>
      </p>
    </div>
  </div>
</div>
  )
}

export default Signup;
