import React, { useState } from 'react';
import { 
  FaMoon, FaBell, FaSync, FaFileExport, FaTrashAlt, 
  FaDatabase, FaStar, FaRegStar, FaCalendarAlt, FaCoins,
  FaPlus, FaCrown, FaCloudUploadAlt, FaUndo
} from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, collection, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Settings.css';

function Settings() {
  const { 
    taskBank, 
    addTaskToBank, 
    removeTaskFromBank,
    tokens,
    setTokens,
    xp,
    setXp,
    tickets,
    setTickets,
    inventoryItems,
    setInventoryItems,
    activeTasks,
    setActiveTasks,
    setTaskBank,
    setEquippedAbilities,
    setWeaponCooldowns,
    setClaimedMilestones,
    initialItems
  } = useAppContext();
  
  const { currentUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Task form state
  const [newTask, setNewTask] = useState('');
  const [taskRepetition, setTaskRepetition] = useState('one-time');
  const [taskRarity, setTaskRarity] = useState('common');
  const [formExpanded, setFormExpanded] = useState(false);
  
  // Helper functions for task creation
  const getTokenValue = (rarity) => {
    switch (rarity) {
      case 'common': return 10;
      case 'uncommon': return 25;
      case 'rare': return 50;
      case 'epic': return 100;
      case 'legendary': return 150;
      default: return 10;
    }
  };

  const getRarityStarCount = (rarity) => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 2;
      case 'rare': return 3;
      case 'epic': return 4;
      case 'legendary': return 5;
      default: return 1;
    }
  };
  
  const getRarityFromStars = (stars) => {
    switch (stars) {
      case 1: return 'common';
      case 2: return 'uncommon';
      case 3: return 'rare';
      case 4: return 'epic';
      case 5: return 'legendary';
      default: return 'common';
    }
  };
  
  // Push data to Firebase
  const pushToFirebase = async () => {
    if (!currentUser) {
      setSyncMessage('Error: You must be logged in to sync data');
      return;
    }
    
    setIsSyncing(true);
    setSyncMessage('Syncing data to Firebase...');
    
    try {
      // Create/update user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || 'User',
        tokens,
        xp,
        tickets,
        lastUpdated: new Date()
      }, { merge: true });
      
      // Create/update inventory collection
      const inventoryCollectionRef = collection(db, 'users', currentUser.uid, 'inventory');
      for (const item of inventoryItems) {
        await setDoc(doc(inventoryCollectionRef, item.id.toString()), {
          ...item,
          userId: currentUser.uid,
          lastUpdated: new Date()
        });
      }
      
      // Create/update task bank collection
      const taskBankCollectionRef = collection(db, 'users', currentUser.uid, 'taskBank');
      for (const task of taskBank) {
        await setDoc(doc(taskBankCollectionRef, task.id.toString()), {
          ...task,
          userId: currentUser.uid,
          lastUpdated: new Date()
        });
      }
      
      // Create/update active tasks collection
      const activeTasksCollectionRef = collection(db, 'users', currentUser.uid, 'activeTasks');
      for (const task of activeTasks) {
        await setDoc(doc(activeTasksCollectionRef, task.id.toString()), {
          ...task,
          userId: currentUser.uid,
          lastUpdated: new Date()
        });
      }
      
      setSyncMessage('Data successfully synced to Firebase!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSyncMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncMessage(`Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Reset account function
  const resetAccount = async () => {
    if (!currentUser) {
      setSyncMessage('Error: You must be logged in to reset account');
      return;
    }
    
    setIsResetting(true);
    setSyncMessage('Resetting account...');
    
    try {
      // Save the current task bank before resetting
      const currentTaskBank = [...taskBank];
      
      // Reset local state
      setTokens(1250);
      setXp(0);
      setTickets(8);
      setInventoryItems(initialItems);
      setActiveTasks([]);
      // Preserve the task bank
      // setTaskBank([]);
      setEquippedAbilities([null, null, null]);
      setWeaponCooldowns({});
      setClaimedMilestones({});
      
      // Update user document in Firebase
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || 'User',
        tokens: 1250,
        xp: 0,
        tickets: 8,
        equippedItems: [null, null, null],
        weaponCooldowns: {},
        claimedMilestones: {},
        lastUpdated: new Date()
      });
      
      // Delete only active tasks from Firebase, preserve task bank
      const activeTasksCollectionRef = collection(db, 'users', currentUser.uid, 'activeTasks');
      const activeTasksSnapshot = await getDocs(activeTasksCollectionRef);
      await Promise.all(activeTasksSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      
      // Do NOT delete task bank collection
      // const taskBankCollectionRef = collection(db, 'users', currentUser.uid, 'taskBank');
      // const taskBankSnapshot = await getDocs(taskBankCollectionRef);
      // await Promise.all(taskBankSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      
      // Delete all inventory items and re-initialize with defaults
      const inventoryCollectionRef = collection(db, 'users', currentUser.uid, 'inventory');
      const inventorySnapshot = await getDocs(inventoryCollectionRef);
      await Promise.all(inventorySnapshot.docs.map(doc => deleteDoc(doc.ref)));
      
      // Re-add initial inventory items
      await Promise.all(initialItems.map(async (item) => {
        const itemDocRef = doc(db, 'users', currentUser.uid, 'inventory', item.id.toString());
        await setDoc(itemDocRef, item);
      }));
      
      setSyncMessage('Account successfully reset! Task bank preserved.');
      setShowResetConfirm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSyncMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error resetting account:', error);
      setSyncMessage(`Error: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };
  
  // Add task to the task bank
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim() === '') return;
    
    const task = {
      text: newTask,
      repetition: taskRepetition,
      rarity: taskRarity,
      tokenValue: getTokenValue(taskRarity)
    };
    
    addTaskToBank(task);
    setNewTask('');
    setTaskRepetition('one-time');
    setTaskRarity('common');
    setFormExpanded(false);
  };
  
  // Handle star click for rarity selection
  const handleStarClick = (starIndex) => {
    const newRarity = getRarityFromStars(starIndex + 1);
    setTaskRarity(newRarity);
  };

  // Render star selection for rarity input
  const renderStarSelection = () => {
    const stars = [];
    const starCount = getRarityStarCount(taskRarity);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star-select ${i < starCount ? taskRarity : ''}`}
          onClick={() => handleStarClick(i)}
        >
          {i < starCount ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    
    return stars;
  };

  // Render stars for task rarity
  const renderRarityStars = (rarity) => {
    const stars = [];
    const starCount = getRarityStarCount(rarity);
    
    for (let i = 0; i < starCount; i++) {
      stars.push(
        <FaStar key={i} className={`rarity-icon ${rarity}`} />
      );
    }
    
    // Add crown icon for legendary tasks
    if (rarity === 'legendary') {
      stars.push(<FaCrown key="crown" className="rarity-icon legendary crown" />);
    }
    
    return <div className="rarity-stars">{stars}</div>;
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <p className="settings-intro">Configure your SuperDo experience</p>
      
      {/* Task Bank */}
      <div className="settings-card">
        <div className="settings-header">
          <FaDatabase className="settings-icon" />
          <h3>Task Bank</h3>
        </div>
        <div className="task-bank-container">
          {/* Task Creation Form */}
          <form 
            onSubmit={handleAddTask} 
            className={`task-form ${formExpanded ? 'expanded' : ''} ${formExpanded ? taskRarity : ''}`}
          >
            <div className="task-input-container">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onClick={() => setFormExpanded(true)}
                placeholder="Add a new task to the bank..."
                className={`task-input ${formExpanded ? taskRarity : ''}`}
              />

              {formExpanded && (
                <div className="task-options">
                  <div className="option-group">
                    <label className="option-label">
                      <FaCalendarAlt /> Repeat:
                    </label>
                    <div className="option-controls">
                      <select 
                        value={taskRepetition} 
                        onChange={(e) => setTaskRepetition(e.target.value)}
                        className="task-select"
                      >
                        <option value="one-time">One-time</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="option-group">
                    <label className="option-label">
                      <FaStar /> Difficulty:
                    </label>
                    <div className="option-controls star-rating-container">
                      {renderStarSelection()}
                      <span className="token-value">
                        <FaCoins /> {getTokenValue(taskRarity)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button type="submit" className="add-button">
              <FaPlus /> Add
            </button>
          </form>
          
          {/* Task Bank List */}
          <div className="task-bank-list">
            <h4>Available Tasks</h4>
            <ul className="task-list">
              {taskBank.length === 0 ? (
                <li className="empty-state">
                  No tasks in the bank yet. Add one above!
                </li>
              ) : (
                taskBank.map(task => (
                  <li key={task.id} className={`task-item ${task.rarity}`}>
                    <div className="task-content">
                      <span className="task-text">{task.text}</span>
                      <div className="task-meta">
                        {task.repetition !== 'one-time' && (
                          <span className="task-repetition">
                            <FaCalendarAlt /> {task.repetition}
                          </span>
                        )}
                        <span className="task-value">
                          <FaCoins /> {task.tokenValue}
                        </span>
                        {renderRarityStars(task.rarity)}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeTaskFromBank(task.id)}
                      className="delete-button"
                    >
                      <FaTrashAlt />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Other Settings */}
      <div className="settings-card">
        <div className="settings-header">
          <FaMoon className="settings-icon" />
          <h3>Appearance</h3>
        </div>
        <div className="settings-option toggle">
          <span>Dark Mode</span>
          <label className="switch">
            <input type="checkbox" checked />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      
      <div className="settings-card">
        <div className="settings-header">
          <FaBell className="settings-icon" />
          <h3>Notifications</h3>
        </div>
        <div className="settings-option toggle">
          <span>Enable Notifications</span>
          <label className="switch">
            <input type="checkbox" checked />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      
      <div className="settings-card">
        <div className="settings-header">
          <FaSync className="settings-icon" />
          <h3>Data Management</h3>
        </div>
        <div className="settings-action">
          <button className="settings-button">
            <FaFileExport /> Export Data
          </button>
          <button 
            className="settings-button"
            onClick={pushToFirebase}
            disabled={isSyncing || !currentUser}
          >
            <FaCloudUploadAlt /> {isSyncing ? 'Syncing...' : 'Push to Firebase'}
          </button>
          <button 
            className="settings-button danger"
            onClick={() => setShowResetConfirm(true)}
          >
            <FaUndo /> Reset Account
          </button>
        </div>
        {syncMessage && (
          <div className={`sync-message ${syncMessage.includes('Error') ? 'error' : 'success'}`}>
            {syncMessage}
          </div>
        )}
        
        {/* Reset confirmation dialog */}
        {showResetConfirm && (
          <div className="reset-confirmation">
            <p>Are you sure you want to reset your account? This will delete all your progress, including tasks, inventory, tokens, and XP.</p>
            <p>This action cannot be undone.</p>
            <div className="reset-actions">
              <button 
                className="settings-button danger"
                onClick={resetAccount}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
              </button>
              <button 
                className="settings-button"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings; 