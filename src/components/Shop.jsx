import React, { useState, useEffect } from 'react';
import { 
  FaGift, FaTicketAlt, FaPalette, FaCrown, FaBolt, FaFire, 
  FaTrophy, FaGem, FaGamepad, FaMagic, FaStar, FaRegStar,
  FaCoins, FaTimes, FaCheck, FaDice, FaExchangeAlt, FaPlayCircle, FaClock, FaForward
} from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import './Shop.css';

function Shop() {
  const { tokens, purchaseItem } = useAppContext();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('lootboxes');
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null);
  
  // Featured items for slideshow
  const featuredItems = [
    {
      id: 1,
      title: 'Legendary Lootbox',
      description: 'High chance of rare cosmetics and powerful boosts',
      icon: <FaCrown className="featured-icon-svg" />,
      price: 750,
      type: 'lootbox'
    },
    {
      id: 2,
      title: 'Premium Ticket Bundle',
      description: 'Get 10 tickets for the price of 8!',
      icon: <FaBolt className="featured-icon-svg" />,
      price: 1200,
      type: 'ticket'
    },
    {
      id: 3,
      title: 'Galaxy Theme Pack',
      description: 'Exclusive cosmic theme with animated backgrounds',
      icon: <FaFire className="featured-icon-svg" />,
      price: 950,
      type: 'theme'
    }
  ];
  
  // Shop items by category
  const shopItems = {
    lootboxes: [
      { id: 101, title: 'Basic Lootbox', icon: <FaGift />, price: 200, type: 'lootbox' },
      { id: 102, title: 'Premium Lootbox', icon: <FaGem />, price: 500, type: 'lootbox' },
      { id: 103, title: 'Legendary Lootbox', icon: <FaCrown />, price: 750, type: 'lootbox' },
      { id: 104, title: 'Mystery Box', icon: <FaMagic />, price: 400, type: 'lootbox' }
    ],
    tickets: [
      { id: 201, title: '5 Tickets', icon: <FaTicketAlt />, price: 100, type: 'ticket', amount: 5 },
      { id: 202, title: '20 Tickets', icon: <FaTicketAlt />, price: 350, type: 'ticket', amount: 20 },
      { id: 203, title: '50 Tickets', icon: <FaTicketAlt />, price: 800, type: 'ticket', amount: 50 },
      { id: 204, title: '100 Tickets', icon: <FaTicketAlt />, price: 1500, type: 'ticket', amount: 100 }
    ],
    abilities: [
      { id: 1, title: 'Random Task', icon: <FaDice />, price: 200, type: 'ability', description: 'Generate a random task of varying difficulty' },
      { id: 2, title: 'Flip Coin', icon: <FaExchangeAlt />, price: 250, type: 'ability', description: 'Flip for either an easy or hard task' },
      { id: 3, title: 'Card Monte', icon: <FaPlayCircle />, price: 300, type: 'ability', description: 'Play 3-card monte for a task reward' },
      { id: 7, title: 'Time Warp', icon: <FaClock />, price: 350, type: 'ability', description: 'Reset daily task timers' },
      { id: 8, title: 'Double Rewards', icon: <FaGem />, price: 400, type: 'ability', description: 'Double tokens for next 5 tasks' },
      { id: 9, title: 'Task Skip', icon: <FaForward />, price: 250, type: 'ability', description: 'Skip a difficult task without penalty' }
    ]
  };
  
  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredItems.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredItems.length]);
  
  // Handle manual slide navigation
  const goToSlide = (index) => {
    setActiveSlide(index);
  };
  
  // Handle purchase attempt
  const handlePurchase = (item) => {
    setPurchaseModal(item);
  };
  
  // Confirm purchase
  const confirmPurchase = () => {
    if (tokens >= purchaseModal.price) {
      const success = purchaseItem(purchaseModal, purchaseModal.price);
      setPurchaseResult({ success, item: purchaseModal });
      setPurchaseModal(null);
    } else {
      setPurchaseResult({ success: false, item: purchaseModal, reason: 'insufficient_tokens' });
      setPurchaseModal(null);
    }
  };
  
  return (
    <div className="shop-container">
      <h2>Shop</h2>
      
      {/* Token display */}
      <div className="shop-currency">
        <FaCoins className="shop-currency-icon" />
        <span className="shop-currency-value">{tokens} tokens</span>
      </div>
      
      {/* Slideshow */}
      <div className="shop-slideshow">
        <div 
          className="slideshow-inner" 
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {featuredItems.map(item => (
            <div key={item.id} className="featured-item">
              <div className="featured-icon-container">
                {item.icon}
              </div>
              <div className="featured-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="featured-footer">
                  <span className="price"><FaCoins /> {item.price}</span>
                  <button 
                    className="purchase-button"
                    onClick={() => handlePurchase(item)}
                    disabled={tokens < item.price}
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slideshow controls */}
        <div className="slideshow-controls">
          {featuredItems.map((_, index) => (
            <button 
              key={index}
              className={`slide-dot ${activeSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Category tabs */}
      <div className="shop-categories">
        <button 
          className={`category-tab ${activeCategory === 'lootboxes' ? 'active' : ''}`}
          onClick={() => setActiveCategory('lootboxes')}
        >
          <FaGift className="category-icon" /> Lootboxes
        </button>
        <button 
          className={`category-tab ${activeCategory === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveCategory('tickets')}
        >
          <FaTicketAlt className="category-icon" /> Tickets
        </button>
        <button 
          className={`category-tab ${activeCategory === 'abilities' ? 'active' : ''}`}
          onClick={() => setActiveCategory('abilities')}
        >
          <FaBolt className="category-icon" /> Abilities
        </button>
      </div>
      
      {/* Shop grid */}
      <div className="shop-grid">
        {shopItems[activeCategory].map(item => (
          <div key={item.id} className="shop-item">
            <div className="shop-item-icon-container">
              {item.icon}
            </div>
            <h4>{item.title}</h4>
            <div className="shop-item-footer">
              <span className="price"><FaCoins /> {item.price}</span>
              <button 
                className="item-button"
                onClick={() => handlePurchase(item)}
                disabled={tokens < item.price}
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Purchase confirmation modal */}
      {purchaseModal && (
        <div className="modal-overlay">
          <div className="purchase-modal">
            <div className="modal-header">
              <h3>Confirm Purchase</h3>
              <button 
                className="close-button" 
                onClick={() => setPurchaseModal(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="purchase-details">
              <p>Are you sure you want to purchase:</p>
              <div className="purchase-item">
                <div className="purchase-item-icon">
                  {purchaseModal.icon}
                </div>
                <div className="purchase-item-info">
                  <h4>{purchaseModal.title}</h4>
                  <div className="purchase-price">
                    <FaCoins /> {purchaseModal.price} tokens
                  </div>
                </div>
              </div>
              
              <div className="balance-info">
                <div>Current balance: <span>{tokens} tokens</span></div>
                <div>Balance after purchase: <span>{tokens - purchaseModal.price} tokens</span></div>
              </div>
              
              <div className="purchase-actions">
                <button className="cancel-button" onClick={() => setPurchaseModal(null)}>
                  Cancel
                </button>
                <button 
                  className="confirm-button" 
                  onClick={confirmPurchase}
                  disabled={tokens < purchaseModal.price}
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Purchase result modal */}
      {purchaseResult && (
        <div className="modal-overlay">
          <div className="result-modal">
            <div className="result-content">
              {purchaseResult.success ? (
                <>
                  <div className="result-icon success">
                    <FaCheck />
                  </div>
                  <h3>Purchase Successful!</h3>
                  <p>You've successfully purchased {purchaseResult.item.title}.</p>
                </>
              ) : (
                <>
                  <div className="result-icon error">
                    <FaTimes />
                  </div>
                  <h3>Purchase Failed</h3>
                  <p>
                    {purchaseResult.reason === 'insufficient_tokens'
                      ? 'You don\'t have enough tokens for this purchase.'
                      : 'There was an error processing your purchase.'}
                  </p>
                </>
              )}
              <button 
                className="close-result-button" 
                onClick={() => setPurchaseResult(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop; 