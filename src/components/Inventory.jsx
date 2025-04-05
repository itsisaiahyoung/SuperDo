import React, { useState, useRef } from 'react';
import { 
  FaPlus, FaTimes, FaBolt, FaBullseye, FaShieldAlt, 
  FaMoon, FaPalette, FaStar, FaClock, FaGem, FaForward,
  FaDice, FaExchangeAlt, FaPlayCircle, FaBox, FaGift, FaTrophy,
  FaTachometerAlt, FaCoins, FaEraser, FaMoneyBill
} from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import './Inventory.css';

function Inventory() {
  const { inventoryItems, activeItemFilter, setActiveItemFilter, useItem, equipAbility, equippedAbilities } = useAppContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [slotSelectOpen, setSlotSelectOpen] = useState(false);
  const [itemUseFeedback, setItemUseFeedback] = useState(null);
  const abilitiesDropdownRef = useRef(null);
  
  // Get icon based on item.icon string
  const getItemIcon = (iconName) => {
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
      case 'box': return <FaBox />;
      case 'gift': return <FaGift />;
      case 'trophy': return <FaTrophy />;
      case 'tachometer-alt': return <FaTachometerAlt />;
      case 'coins': return <FaCoins />;
      case 'eraser': return <FaEraser />;
      case 'money-bill': return <FaMoneyBill />;
      default: return <FaPlus />;
    }
  };
  
  // Get filtered items
  const filteredItems = activeItemFilter === 'all' 
    ? inventoryItems 
    : inventoryItems.filter(item => item.type === activeItemFilter);
  
  // Only show owned items
  const ownedItems = filteredItems.filter(item => item.owned);

  // Handle equipping ability to a slot
  const handleEquipAbility = (slotIndex) => {
    if (selectedItem && ['ability', 'armor', 'weapon'].includes(selectedItem.type)) {
      equipAbility(selectedItem.id, slotIndex);
      setSlotSelectOpen(false);
    }
  };
  
  // Get appropriate items for slot type
  const getItemsForSlot = (slotType) => {
    return inventoryItems.filter(item => item.owned && item.type === slotType);
  };
  
  // Handle using an item
  const handleUseItem = (item) => {
    const result = useItem(item.id);
    
    if (result && result.success && result.xpAmount) {
      // Show XP gain feedback
      setItemUseFeedback(`+${result.xpAmount} XP gained!`);
      
      // Hide feedback after a delay
      setTimeout(() => {
        setItemUseFeedback(null);
        setSelectedItem(null);
      }, 2000);
    } else {
      // For non-lootbox items
      setSelectedItem(prev => ({...prev, owned: prev.owned === true ? false : prev.owned - 1}));
      if (item.owned === true || item.owned <= 1) {
        setTimeout(() => setSelectedItem(null), 500);
      }
    }
  };
  
  return (
    <div className="inventory-container">
      <h2>Inventory</h2>
      
      <div className="inventory-filters">
        <button 
          className={`filter-button ${activeItemFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveItemFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-button ${activeItemFilter === 'ability' ? 'active' : ''}`}
          onClick={() => setActiveItemFilter('ability')}
        >
          Abilities
        </button>
        <button 
          className={`filter-button ${activeItemFilter === 'lootbox' ? 'active' : ''}`}
          onClick={() => setActiveItemFilter('lootbox')}
        >
          Loot Boxes
        </button>
      </div>
      
      <div className="inventory-grid">
        {ownedItems.length === 0 ? (
          <div className="empty-inventory">
            <p>No items in this category. Visit the shop to purchase items!</p>
          </div>
        ) : (
          ownedItems.map(item => (
            <div 
              key={item.id} 
              className="inventory-slot" 
              onClick={() => setSelectedItem(item)}
              data-rarity={item.rarity}
            >
              <div className="slot-inner">
                <div className="item-icon">
                  {getItemIcon(item.icon)}
                </div>
                <div className="item-name">{item.name}</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Item detail modal */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="item-modal">
            <div className="modal-header">
              <h3>{selectedItem.name}</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setSelectedItem(null);
                  setSlotSelectOpen(false);
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="item-details">
              <div className="item-detail-icon" data-rarity={selectedItem.rarity}>
                {getItemIcon(selectedItem.icon)}
              </div>
              <p className="item-description">{selectedItem.description}</p>
              <div className="item-quantity-detail">
                You have: <span>{selectedItem.owned}</span>
              </div>
              
              <div className="item-actions">
                {selectedItem.type === 'ability' && (
                  <button 
                    className="equip-button" 
                    onClick={() => setSlotSelectOpen(true)}
                    disabled={selectedItem.owned <= 0}
                  >
                    Equip Ability
                  </button>
                )}
                
                <button 
                  className="use-button" 
                  onClick={() => handleUseItem(selectedItem)}
                  disabled={selectedItem.owned <= 0}
                >
                  {selectedItem.type === 'lootbox' ? 'Open Box' : 'Use Item'}
                </button>
              </div>
              
              {/* Feedback for item use */}
              {itemUseFeedback && (
                <div className="use-feedback">
                  {itemUseFeedback}
                </div>
              )}
              
              {/* Slot selection for abilities */}
              {slotSelectOpen && (
                <div className="slot-selection">
                  <p>Select a slot to equip this {selectedItem.type}:</p>
                  <div className="ability-slots">
                    {['ability', 'armor', 'weapon'].map((slotType, slotIndex) => {
                      // Only show slots matching the item type
                      if (slotType !== selectedItem.type) return null;
                      
                      return (
                        <div 
                          key={slotIndex}
                          className="slot-option"
                          onClick={() => handleEquipAbility(slotIndex)}
                        >
                          Slot {slotIndex + 1}: {slotType}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory; 