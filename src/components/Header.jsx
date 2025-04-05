import React, { useState } from 'react';
import { FaCheckSquare, FaCoins, FaTrophy, FaTicketAlt, FaCalendarAlt, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { tokens, xp, tickets } = useAppContext();
  const { currentUser, logout } = useAuth();
  const [showEventsModal, setShowEventsModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <FaCheckSquare className="logo-icon" />
        <h1>SuperDo</h1>
        <span className="season-title">Season One</span>
      </div>
      
      <div className="header-right">
        <button className="events-button" onClick={() => setShowEventsModal(true)}>
          <FaCalendarAlt />
          <span>Events</span>
        </button>
        
        <div className="currency-container">
          <div className="currency">
            <FaCoins className="currency-icon tokens" />
            <span className="currency-value">{tokens}</span>
          </div>
          
          <div className="currency">
            <FaTrophy className="currency-icon xp" />
            <span className="currency-value">{xp}</span>
          </div>
          
          <div className="currency">
            <FaTicketAlt className="currency-icon tickets" />
            <span className="currency-value">{tickets}</span>
          </div>
        </div>
        
        <div className="user-info">
          <span className="username">{currentUser?.displayName}</span>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </div>
      
      {showEventsModal && (
        <div className="modal-overlay">
          <div className="events-modal">
            <div className="modal-header">
              <h2>Upcoming Events</h2>
              <button 
                className="close-button"
                onClick={() => setShowEventsModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="events-list">
              <div className="event-item">
                <div className="event-date">
                  <div className="event-month">JUN</div>
                  <div className="event-day">15</div>
                </div>
                <div className="event-content">
                  <h3>Summer Challenge</h3>
                  <p>Complete daily tasks to earn double tokens in our special summer event!</p>
                </div>
              </div>
              
              <div className="event-item">
                <div className="event-date">
                  <div className="event-month">JUL</div>
                  <div className="event-day">01</div>
                </div>
                <div className="event-content">
                  <h3>New Abilities Release</h3>
                  <p>Check out the new abilities coming to the shop in July!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header; 