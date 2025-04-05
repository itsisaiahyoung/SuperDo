import React, { useState, useEffect } from 'react';
import {
  FaCoins,
  FaPlus,
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
import lootboxesImage from '../assets/images/Lootboxes.png';
import ticketsImage from '../assets/images/Tickets.png';
import ticketImage from '../assets/images/Ticket.png';
import './Shop.css';

function Shop() {
  const { tokens, purchaseItem, inventoryItems } = useAppContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('abilities');
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Featured items for slideshow
  const featuredItems = [
    {
      id: 1,
      name: 'Lootbox',
      type: 'lootbox',
      description: 'Contains 10-100 XP. Open to boost your productivity journey!',
      price: 150,
      image: lootboxesImage
    },
    {
      id: 2,
      name: 'Premium Tickets',
      type: 'ticket',
      description: 'Get 10 tickets for the price of 8!',
      price: 1200,
      image: ticketsImage
    },
    {
      id: 3,
      name: 'Legendary Ability Pack',
      type: 'ability',
      description: 'Unlock all premium abilities at once',
      price: 2500,
      icon: 'gem'
    }
  ];
  
  // Shop items by category
  const shopItems = {
    abilities: [
      { id: 11, name: 'Time Warp', type: 'ability', icon: 'clock', description: 'Reset daily task timers', price: 800 },
      { id: 12, name: 'Double Rewards', type: 'ability', icon: 'gem', description: 'Double tokens for next 5 tasks', price: 1200 },
      { id: 13, name: 'Task Skip', type: 'ability', icon: 'forward', description: 'Skip a difficult task without penalty', price: 500 }
    ],
    lootboxes: [
      { id: 4, name: 'Lootbox', type: 'lootbox', icon: 'custom-lootbox', description: 'Contains 10-100 XP', price: 150 }
    ],
    tickets: [
      { id: 201, name: '5 Tickets', type: 'ticket', icon: 'custom-ticket', description: 'Use tickets to unlock special rewards', price: 600, amount: 5 },
      { id: 202, name: '20 Tickets', type: 'ticket', icon: 'custom-ticket', description: 'Use tickets to unlock special rewards', price: 2000, amount: 20 },
      { id: 203, name: '50 Tickets', type: 'ticket', icon: 'custom-ticket', description: 'Use tickets to unlock special rewards', price: 4500, amount: 50 }
    ]
  };
  
  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % featuredItems.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredItems.length]);
  
  // Check if an item is owned
  const isItemOwned = (itemId) => {
    const item = inventoryItems.find(item => item.id === itemId);
    return item && item.owned;
  };
  
  // Handle purchase
  const handlePurchase = (item) => {
    const success = purchaseItem(item, item.price);
    
    if (success) {
      // Show success message
      alert(`Successfully purchased ${item.name}!`);
    } else {
      // Show error message
      alert('Not enough tokens for this purchase.');
    }
    
    setSelectedItem(null);
  };
  
  // Get icon based on icon name
  const getItemIcon = (iconName) => {
    if (iconName === 'custom-lootbox') {
      return <img src={lootboxesImage} alt="Lootbox" className="custom-icon" />;
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
      default: return <FaPlus />;
    }
  };

  return (
    <div className="shop-container">
      <h2>Shop</h2>
      
      <div className="token-balance">
        <FaCoins className="token-icon" />
        <span>{tokens} Tokens</span>
      </div>
      
      {/* Featured Item Slideshow */}
      <div className="featured-slideshow">
        <div 
          className="slideshow-inner" 
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {featuredItems.map((item, index) => (
            <div 
              key={index} 
              className="featured-item" 
              onClick={() => setSelectedItem(item)}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="featured-image" />
              ) : (
                <div className="featured-icon-container">
                  {getItemIcon(item.icon)}
                </div>
              )}
              <div className="featured-overlay">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="featured-price">
                  <FaCoins className="price-icon" />
                  <span>{item.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slideshow dots */}
        <div className="slideshow-dots">
          {featuredItems.map((_, index) => (
            <button 
              key={index}
              className={`dot ${activeSlide === index ? 'active' : ''}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Category Navigation */}
      <div className="shop-categories">
        <button 
          className={activeCategory === 'abilities' ? 'active' : ''}
          onClick={() => setActiveCategory('abilities')}
        >
          Abilities
        </button>
        <button 
          className={activeCategory === 'lootboxes' ? 'active' : ''}
          onClick={() => setActiveCategory('lootboxes')}
        >
          Lootboxes
        </button>
        <button 
          className={activeCategory === 'tickets' ? 'active' : ''}
          onClick={() => setActiveCategory('tickets')}
        >
          Tickets
        </button>
      </div>
      
      {/* Item Grid */}
      <div className="shop-grid">
        {shopItems[activeCategory].map(item => (
          <div 
            key={item.id}
            className={`shop-item ${isItemOwned(item.id) ? 'owned' : ''} ${item.type === 'ticket' ? 'ticket-item' : ''} ${item.type === 'lootbox' ? 'lootbox-item' : ''}`}
            onClick={() => !isItemOwned(item.id) && setSelectedItem(item)}
          >
            <div className={`item-icon ${item.type === 'ticket' ? 'ticket-icon' : ''} ${item.type === 'lootbox' ? 'lootbox-icon' : ''}`}>
              {item.type === 'lootbox' 
                ? getItemIcon('custom-lootbox')
                : item.type === 'ticket'
                  ? getItemIcon('custom-ticket')
                  : getItemIcon(item.icon)}
            </div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="item-price">
              {isItemOwned(item.id) ? (
                <span className="owned-label">Owned</span>
              ) : (
                <>
                  <FaCoins className="price-icon" />
                  <span>{item.price}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Item Purchase Modal */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="purchase-modal">
            <button 
              className="close-button"
              onClick={() => setSelectedItem(null)}
            >
              <FaTimes />
            </button>
            
            <h2>Purchase {selectedItem.name}</h2>
            
            <div className="modal-item-details">
              {selectedItem.type === 'lootbox' ? (
                <img src={lootboxesImage} alt="Lootboxes" className="modal-featured-image" />
              ) : selectedItem.type === 'ticket' ? (
                <img src={ticketsImage} alt="Tickets" className="modal-featured-image" />
              ) : selectedItem.image ? (
                <img src={selectedItem.image} alt={selectedItem.name} className="modal-featured-image" />
              ) : (
                <div className="modal-item-icon">
                  {getItemIcon(selectedItem.icon)}
                </div>
              )}
              
              <p>{selectedItem.description}</p>
              
              <div className="modal-price">
                <FaCoins className="price-icon" />
                <span>{selectedItem.price} Tokens</span>
              </div>
              
              <div className="modal-balance">
                <span>Your balance: </span>
                <FaCoins className="balance-icon" />
                <span>{tokens} Tokens</span>
              </div>
              
              <div className="purchase-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </button>
                
                <button 
                  className="confirm-button"
                  onClick={() => handlePurchase(selectedItem)}
                  disabled={tokens < selectedItem.price}
                >
                  {tokens < selectedItem.price ? 'Not enough tokens' : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop; 