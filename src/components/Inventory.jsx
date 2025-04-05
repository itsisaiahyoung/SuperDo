import React, { useState } from 'react';
import {
  FaCheckSquare,
  FaTimesCircle,
  FaTimes,
  FaBolt,
  FaShieldAlt,
  FaBullseye,
  FaMoon,
  FaPalette,
  FaStar,
  FaClock,
  FaGem,
  FaForward,
  FaDice,
  FaExchangeAlt,
  FaPlayCircle,
  FaTachometerAlt,
  FaEraser,
  FaMoneyBill,
  FaTicketAlt
} from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import lootboxImage from '../assets/images/Lootbox.png';
import ticketImage from '../assets/images/Ticket.png';
import './Inventory.css';

function Inventory() {
  const { inventoryItems, useItem } = useAppContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Get filtered items
  const filteredItems = filterType === 'all' 
    ? inventoryItems.filter(item => item.quantity > 0 || item.owned)
    : inventoryItems.filter(item => (item.type === filterType) && (item.quantity > 0 || item.owned));

  // Get icon based on icon name
  const getItemIcon = (iconName) => {
    if (iconName === 'custom-lootbox') {
      return <img src={lootboxImage} alt="Lootbox" className="custom-icon" />;
    }
    
    if (iconName === 'custom-ticket') {
      return <img src={ticketImage} alt="Ticket" className="custom-icon" />;
    }
    
    switch(iconName) {
      case 'bolt': return <FaBolt />;
      case 'bullseye': return <FaBullseye />;
      case 'shield': return <FaShieldAlt />;
      case 'moon': return <FaMoon />;
      case 'palette': return <FaPalette />;
      case 'star': return <FaStar />;
      case 'clock': return <FaClock />;
      case 'gem': return <FaGem />;
      case 'forward': return <FaForward />;
      case 'dice': return <FaDice />;
      case 'exchange-alt': return <FaExchangeAlt />;
      case 'play-circle': return <FaPlayCircle />;
      case 'tachometer-alt': return <FaTachometerAlt />;
      case 'eraser': return <FaEraser />;
      case 'money-bill': return <FaMoneyBill />;
      case 'ticket-alt': return <FaTicketAlt />;
      default: return <FaBolt />;
    }
  };
  
  // Handle item use
  const handleUseItem = (item) => {
    const result = useItem(item.id);
    
    if (result && result.success) {
      // Show success message based on item type
      if (item.type === 'lootbox' && result.xpAmount) {
        alert(`Used ${item.name} successfully! Gained ${result.xpAmount} XP.`);
      } else if (item.type === 'ticket' && result.ticketAmount) {
        alert(`Used ${item.name} successfully! Added ${result.ticketAmount} tickets.`);
      } else {
        alert(`Used ${item.name} successfully!`);
      }
    } else {
      // Show error message
      alert('Error using item.');
    }
    
    setSelectedItem(null);
  };

  return (
    <div className="inventory-container">
      <h2>Inventory</h2>
      
      <div className="inventory-filters">
        <button 
          className={filterType === 'all' ? 'active' : ''}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button 
          className={filterType === 'ability' ? 'active' : ''}
          onClick={() => setFilterType('ability')}
        >
          Abilities
        </button>
        <button 
          className={filterType === 'lootbox' ? 'active' : ''}
          onClick={() => setFilterType('lootbox')}
        >
          Lootboxes
        </button>
        <button 
          className={filterType === 'ticket' ? 'active' : ''}
          onClick={() => setFilterType('ticket')}
        >
          Tickets
        </button>
      </div>
      
      <div className="inventory-slots">
        {filteredItems.length === 0 ? (
          <div className="no-items">No items found.</div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id}
              className={`inventory-slot ${item.type === 'lootbox' ? 'lootbox-slot' : ''} ${item.type === 'ticket' ? 'ticket-slot' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="slot-inner">
                <div className={
                  item.type === 'lootbox' ? 'lootbox-icon' : 
                  item.type === 'ticket' ? 'ticket-icon' : 
                  'item-icon'
                }>
                  {item.type === 'lootbox' 
                    ? getItemIcon('custom-lootbox')
                    : item.type === 'ticket'
                    ? getItemIcon('custom-ticket')
                    : getItemIcon(item.icon)}
                </div>
                <div className="item-name">{item.name}</div>
                {item.quantity > 1 && (
                  <div className="item-quantity">{item.quantity}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Modal for item details and use */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="item-modal">
            <button 
              className="close-button"
              onClick={() => setSelectedItem(null)}
            >
              <FaTimes />
            </button>
            
            <div className="item-details">
              <div className={
                selectedItem.type === 'lootbox' ? 'lootbox-detail-icon' : 
                selectedItem.type === 'ticket' ? 'ticket-detail-icon' : 
                'item-detail-icon'
              }>
                {selectedItem.type === 'lootbox' 
                  ? getItemIcon('custom-lootbox')
                  : selectedItem.type === 'ticket'
                  ? getItemIcon('custom-ticket')
                  : getItemIcon(selectedItem.icon)}
              </div>
              
              <h3>{selectedItem.name}</h3>
              
              <p className="item-description">
                {selectedItem.description || 'No description available.'}
              </p>
              
              {selectedItem.quantity > 1 && (
                <div className="item-quantity-info">
                  Quantity: {selectedItem.quantity}
                </div>
              )}
              
              <div className="item-actions">
                <button 
                  className="use-button"
                  onClick={() => handleUseItem(selectedItem)}
                  disabled={selectedItem.quantity <= 0 && !selectedItem.owned}
                >
                  {selectedItem.type === 'lootbox' ? 'Open Lootbox' : 
                   selectedItem.type === 'ticket' ? 'Use Tickets' : 
                   'Use Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;