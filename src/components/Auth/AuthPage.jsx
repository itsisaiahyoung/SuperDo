import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import './Auth.css';

function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  
  const toggleView = () => {
    setShowLogin(!showLogin);
  };
  
  return (
    <div className="auth-page">
      {showLogin ? (
        <Login onToggleView={toggleView} />
      ) : (
        <SignUp onToggleView={toggleView} />
      )}
    </div>
  );
}

export default AuthPage; 