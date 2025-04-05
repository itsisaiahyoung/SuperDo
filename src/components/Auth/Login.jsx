import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Login({ onToggleView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      await login(email, password);
      // Successful login handled by AuthContext
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(
        error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password'
          : 'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Login to SuperDo</h2>
      
      {errorMessage && (
        <div className="auth-error">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-toggle">
        <p>Don't have an account? <button onClick={onToggleView}>Sign Up</button></p>
      </div>
    </div>
  );
}

export default Login; 