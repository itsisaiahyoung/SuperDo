import React from 'react';
import { FaTasks, FaBox, FaStore, FaCog } from 'react-icons/fa';
import './TabNav.css';

function TabNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: <FaTasks /> },
    { id: 'inventory', label: 'Inventory', icon: <FaBox /> },
    { id: 'shop', label: 'Shop', icon: <FaStore /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ];

  return (
    <nav className="tab-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default TabNav; 