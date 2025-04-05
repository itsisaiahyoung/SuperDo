import React, { useState } from 'react';
import { FaCheckSquare, FaCoins, FaTicketAlt, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import './Header.css';

function Header() {
  const { tokens, tickets } = useAppContext();
  const [showEventsModal, setShowEventsModal] = useState(false);

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
            <FaCoins className="currency-icon" />
            <span className="currency-value">{tokens}</span>
          </div>
          
          <div className="currency">
            <FaTicketAlt className="currency-icon" />
            <span className="currency-value">{tickets}</span>
          </div>
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