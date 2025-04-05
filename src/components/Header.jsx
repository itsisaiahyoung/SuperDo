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
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <FaCheckSquare className="logo-icon" />
          <h1>SuperDo</h1>
          <span className="season-title">Season One</span>
        </div>
      </div>
      
      <div className="header-right">
        <button className="events-button" onClick={() => setShowEventsModal(true)}>
          <FaCalendarAlt />
          <span>Events</span>
        </button>
        
        <div className="currency">
          <div className="currency-item">
            <FaCoins className="currency-icon tokens" />
            <span>{tokens}</span>
          </div>
          
          <div className="currency-item">
            <FaTrophy className="currency-icon xp" />
            <span>{xp}</span>
          </div>
          
          <div className="currency-item">
            <FaTicketAlt className="currency-icon tickets" />
            <span>{tickets}</span>
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
                <div className="event-date">May 15</div>
                <div className="event-content">
                  <h3>Double Tokens Weekend</h3>
                  <p>Complete tasks to earn 2x tokens all weekend!</p>
                </div>
              </div>
              
              <div className="event-item">
                <div className="event-date">May 20</div>
                <div className="event-content">
                  <h3>Special Lootbox Sale</h3>
                  <p>All lootboxes are 20% off for 24 hours only.</p>
                </div>
              </div>
              
              <div className="event-item">
                <div className="event-date">June 1</div>
                <div className="event-content">
                  <h3>Summer Theme Launch</h3>
                  <p>New exclusive summer themes will be available in the shop!</p>
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