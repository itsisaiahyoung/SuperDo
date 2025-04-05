import React, { createContext, useState, useContext, useEffect } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

// Function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Initial items data
const initialItems = [
  { id: 1, name: 'Random Task', type: 'ability', icon: 'dice', description: 'Generate a random task of varying difficulty', owned: true },
  { id: 2, name: 'Flip Coin', type: 'ability', icon: 'exchange-alt', description: 'Flip for either an easy or hard task', owned: true },
  { id: 3, name: 'Card Monte', type: 'ability', icon: 'play-circle', description: 'Play 3-card monte for a task reward', owned: true },
  { id: 4, name: 'Common Loot Box', type: 'lootbox', icon: 'box', description: 'Contains 10-50 XP', owned: true, rarity: 'common' },
  { id: 5, name: 'Rare Loot Box', type: 'lootbox', icon: 'gift', description: 'Contains 50-100 XP', owned: true, rarity: 'rare' },
  { id: 6, name: 'Epic Loot Box', type: 'lootbox', icon: 'trophy', description: 'Contains 100-200 XP', owned: false, rarity: 'epic' },
  { id: 7, name: 'XP Booster', type: 'armor', icon: 'tachometer-alt', description: 'Increase XP gain by 2%', owned: true, rarity: 'common' },
  { id: 8, name: 'Token Booster', type: 'armor', icon: 'coins', description: 'Increase token gain by 2%', owned: true, rarity: 'common' },
  { id: 9, name: 'Task Eraser', type: 'weapon', icon: 'eraser', description: 'Delete a task (5% success rate)', owned: true, rarity: 'common', cooldown: 'daily' },
  { id: 10, name: 'Token Generator', type: 'weapon', icon: 'money-bill', description: 'Add 500 tokens (5% success rate)', owned: true, rarity: 'common', cooldown: 'daily' },
  { id: 11, name: 'Time Warp', type: 'ability', icon: 'clock', description: 'Reset daily task timers', owned: false },
  { id: 12, name: 'Double Rewards', type: 'ability', icon: 'gem', description: 'Double tokens for next 5 tasks', owned: false },
  { id: 13, name: 'Task Skip', type: 'ability', icon: 'forward', description: 'Skip a difficult task without penalty', owned: false }
];

// Initial task bank data
const initialTaskBank = [
  { id: 1, text: "Clean your desk", repetition: "weekly", rarity: "common", tokenValue: 10 },
  { id: 2, text: "Exercise for 20 minutes", repetition: "daily", rarity: "uncommon", tokenValue: 25 },
  { id: 3, text: "Read 30 pages", repetition: "daily", rarity: "uncommon", tokenValue: 25 },
  { id: 4, text: "Organize your files", repetition: "monthly", rarity: "rare", tokenValue: 50 },
  { id: 5, text: "Meditate for 15 minutes", repetition: "daily", rarity: "rare", tokenValue: 50 },
  { id: 6, text: "Complete a work project", repetition: "one-time", rarity: "epic", tokenValue: 100 },
  { id: 7, text: "Deep clean your living space", repetition: "monthly", rarity: "legendary", tokenValue: 150 }
];

// Define milestone rewards
const milestoneRewards = [
  { percent: 25, reward: 50 },
  { percent: 50, reward: 100 },
  { percent: 75, reward: 150 },
  { percent: 100, reward: 300 }
];

// Context setup
const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Currencies
  const [tokens, setTokens] = useState(1250);
  const [xp, setXp] = useState(0);
  const [tickets, setTickets] = useState(8);
  
  // Inventory
  const [inventoryItems, setInventoryItems] = useState(initialItems);
  
  // Active item filters
  const [activeItemFilter, setActiveItemFilter] = useState('all');

  // Equipped abilities
  const [equippedAbilities, setEquippedAbilities] = useState([null, null, null]);
  
  // Usage tracking for weapons
  const [weaponCooldowns, setWeaponCooldowns] = useState({});
  
  // Tasks
  const [activeTasks, setActiveTasks] = useState([]);
  const [taskBank, setTaskBank] = useState(initialTaskBank);
  
  // Task milestone tracking
  const [claimedMilestones, setClaimedMilestones] = useState({});
  
  // Init today's date in state
  const [todayDate, setTodayDate] = useState(getTodayDate());
  
  // Load user data from Firestore when user logs in
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Set user data from Firestore
          setTokens(userData.tokens || 1250);
          setXp(userData.xp || 0);
          setTickets(userData.tickets || 8);
          
          if (userData.inventory && userData.inventory.length > 0) {
            setInventoryItems(userData.inventory);
          }
          
          if (userData.activeTasks && userData.activeTasks.length > 0) {
            setActiveTasks(userData.activeTasks);
          }
          
          if (userData.taskBank && userData.taskBank.length > 0) {
            setTaskBank(userData.taskBank);
          }
          
          if (userData.equippedItems) {
            setEquippedAbilities(userData.equippedItems);
          }
          
          if (userData.weaponCooldowns) {
            setWeaponCooldowns(userData.weaponCooldowns);
          }
          
          if (userData.claimedMilestones) {
            setClaimedMilestones(userData.claimedMilestones);
          }
        } else {
          // If no user data exists, set defaults and create a new document
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            username: currentUser.displayName,
            tokens: 1250,
            xp: 0,
            tickets: 8,
            inventory: initialItems,
            activeTasks: [],
            taskBank: initialTaskBank,
            equippedItems: [null, null, null],
            weaponCooldowns: {},
            claimedMilestones: {}
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUserData();
  }, [currentUser]);
  
  // Save user data to Firestore whenever state changes
  useEffect(() => {
    const saveUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        await updateDoc(userDocRef, {
          tokens,
          xp,
          tickets,
          inventory: inventoryItems,
          activeTasks,
          taskBank,
          equippedItems: equippedAbilities,
          weaponCooldowns,
          claimedMilestones
        });
      } catch (error) {
        console.error("Error saving user data:", error);
      }
    };
    
    // Debounce function to prevent too many writes
    const timeoutId = setTimeout(() => {
      if (currentUser) {
        saveUserData();
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [
    currentUser,
    tokens,
    xp,
    tickets,
    inventoryItems,
    activeTasks,
    taskBank,
    equippedAbilities,
    weaponCooldowns,
    claimedMilestones
  ]);
  
  // Update today's date at midnight
  useEffect(() => {
    const updateDate = () => {
      const newDate = getTodayDate();
      if (newDate !== todayDate) {
        setTodayDate(newDate);
        // Reset claimed milestones for the new day
        setClaimedMilestones({});
        // Reset weapon cooldowns
        setWeaponCooldowns({});
      }
    };
    
    // Update date immediately
    updateDate();
    
    // Check for date change every minute
    const interval = setInterval(updateDate, 60000);
    
    return () => clearInterval(interval);
  }, [todayDate]);
  
  // Shopping
  const purchaseItem = (item, price) => {
    if (tokens >= price) {
      setTokens(tokens - price);
      
      // Update inventory to mark as owned
      setInventoryItems(prevItems => 
        prevItems.map(invItem => 
          invItem.id === item.id 
            ? { ...invItem, owned: true } 
            : invItem
        )
      );
      
      return true; // Purchase successful
    }
    
    return false; // Not enough tokens
  };
  
  // Check armor bonuses
  const getXpBonus = () => {
    // Check if XP Booster is equipped in armor slot (slot 1)
    const armorItem = inventoryItems.find(item => item.id === equippedAbilities[1]);
    if (armorItem && armorItem.name === 'XP Booster') {
      return 0.02; // 2% XP boost
    }
    return 0;
  };
  
  const getTokenBonus = () => {
    // Check if Token Booster is equipped in armor slot (slot 1)
    const armorItem = inventoryItems.find(item => item.id === equippedAbilities[1]);
    if (armorItem && armorItem.name === 'Token Booster') {
      return 0.02; // 2% token boost
    }
    return 0;
  };
  
  // Use a weapon
  const useWeapon = (weaponId) => {
    const weapon = inventoryItems.find(item => item.id === weaponId);
    
    if (!weapon || weapon.type !== 'weapon') {
      return { success: false, message: 'Not a valid weapon' };
    }
    
    // Check if weapon is on cooldown
    if (weaponCooldowns[weaponId]) {
      return { success: false, message: 'Weapon on cooldown until tomorrow' };
    }
    
    // Set cooldown
    setWeaponCooldowns(prev => ({
      ...prev,
      [weaponId]: todayDate
    }));
    
    // 5% success rate
    const isSuccessful = Math.random() < 0.05;
    
    if (!isSuccessful) {
      return { success: false, message: 'Weapon use failed (95% chance of failure)' };
    }
    
    // Handle specific weapons
    if (weapon.name === 'Task Eraser') {
      // Get a random task
      if (activeTasks.length === 0) {
        return { success: false, message: 'No tasks to delete' };
      }
      
      const randomIndex = Math.floor(Math.random() * activeTasks.length);
      const taskId = activeTasks[randomIndex].id;
      
      // Delete the task
      removeTask(taskId);
      
      return { 
        success: true, 
        message: 'Task successfully deleted!',
        taskName: activeTasks[randomIndex].text
      };
    }
    
    if (weapon.name === 'Token Generator') {
      // Add 500 tokens
      setTokens(prev => prev + 500);
      
      return { 
        success: true, 
        message: 'Generated 500 tokens!'
      };
    }
    
    return { success: false, message: 'Unknown weapon effect' };
  };
  
  // Use item/ability
  const useItem = (itemId) => {
    const item = inventoryItems.find(item => item.id === itemId);
    
    if (!item) return false;
    
    // Handle loot boxes
    if (item.type === 'lootbox') {
      // Generate random XP based on loot box rarity
      let minXP = 10;
      let maxXP = 50;
      
      if (item.rarity === 'rare') {
        minXP = 50;
        maxXP = 100;
      } else if (item.rarity === 'epic') {
        minXP = 100;
        maxXP = 200;
      }
      
      // Random XP within range
      const xpAmount = Math.floor(Math.random() * (maxXP - minXP + 1)) + minXP;
      
      // Add XP
      setXp(prevXP => prevXP + xpAmount);
      
      // Remove loot box from inventory
      setInventoryItems(prevItems => 
        prevItems.map(invItem => 
          invItem.id === itemId
            ? { ...invItem, owned: false } // Set owned to false to remove it
            : invItem
        )
      );
      
      return { success: true, xpAmount };
    }
    
    // Handle weapons
    if (item.type === 'weapon') {
      return useWeapon(itemId);
    }
    
    return false; // Not a consumable item
  };

  // Equip ability
  const equipAbility = (abilityId, slotIndex) => {
    if (slotIndex >= 0 && slotIndex < 3) {
      const newEquippedAbilities = [...equippedAbilities];
      newEquippedAbilities[slotIndex] = abilityId;
      setEquippedAbilities(newEquippedAbilities);
    }
  };
  
  // Get filtered items
  const getFilteredItems = () => {
    if (activeItemFilter === 'all') {
      return inventoryItems;
    }
    
    return inventoryItems.filter(item => item.type === activeItemFilter);
  };
  
  // Task Bank Functions
  const addTaskToBank = (newTask) => {
    setTaskBank([...taskBank, { ...newTask, id: Date.now() }]);
  };
  
  const removeTaskFromBank = (taskId) => {
    setTaskBank(taskBank.filter(task => task.id !== taskId));
  };
  
  // Check if a task is due today
  const isTaskDueToday = (task) => {
    // Daily tasks are always due today
    if (task.repetition === 'daily') return true;
    
    // If the task has a specific due date, check if it's today
    if (task.dueDate && task.dueDate === todayDate) return true;
    
    // Weekly tasks are due on the same day of the week
    if (task.repetition === 'weekly') {
      // For simplicity, we'll just consider all weekly tasks due today
      // In a real app, you'd check the day of the week it was created
      return true;
    }
    
    // Monthly tasks are due on the same date
    if (task.repetition === 'monthly') {
      // For simplicity, we'll just consider all monthly tasks due today
      // In a real app, you'd check the date it was created
      return true;
    }
    
    // For one-time tasks, they're all due today
    return task.repetition === 'one-time';
  };
  
  // Get tasks due today
  const getTasksDueToday = () => {
    return activeTasks.filter(task => isTaskDueToday(task));
  };
  
  // Add task to active list with current date
  const addTaskToActive = (task) => {
    // Generate a new ID only if one doesn't already exist
    const taskId = task.id || Date.now();
    
    const newTask = {
      ...task,
      id: taskId,
      completed: false,
      dateAdded: todayDate,
      dueDate: todayDate // for one-time tasks, set due date to today
    };
    
    setActiveTasks(prevTasks => {
      // Check if task already exists first
      const taskExists = prevTasks.some(t => 
        t.text === task.text && 
        t.rarity === task.rarity && 
        t.repetition === task.repetition
      );
      
      // Only add if it doesn't exist
      if (!taskExists) {
        return [...prevTasks, newTask];
      }
      return prevTasks;
    });
    
    return newTask; // Return the newly created task
  };
  
  // Complete task and check for milestone rewards
  const completeTask = (taskId) => {
    setActiveTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      );
      
      // Find the completed task to award XP
      const completedTask = prevTasks.find(t => t.id === taskId);
      if (completedTask && !completedTask.completed) {
        // Get XP bonus from armor
        const xpBonus = getXpBonus();
        const bonusAmount = Math.floor(completedTask.tokenValue * xpBonus);
        const totalXp = completedTask.tokenValue + bonusAmount;
        
        // Add XP when task is completed
        setXp(prevXp => prevXp + totalXp);
        
        // Schedule milestone check after state update
        setTimeout(() => checkAndRewardMilestones(), 0);
      }
      
      return updatedTasks;
    });
  };
  
  // Check and reward milestones (these still give tokens)
  const checkAndRewardMilestones = () => {
    // Get tasks due today
    const dueTasks = getTasksDueToday();
    const completedTasks = dueTasks.filter(task => task.completed);
    
    // Calculate progress
    const totalTaskCount = dueTasks.length;
    if (totalTaskCount === 0) return;
    
    const completedTaskCount = completedTasks.length;
    const progressPercentage = (completedTaskCount / totalTaskCount) * 100;
    
    // Check each milestone to see if it's newly reached
    milestoneRewards.forEach(milestone => {
      const milestoneId = `${todayDate}-${milestone.percent}`;
      
      // If milestone is reached and not yet claimed
      if (progressPercentage >= milestone.percent && !claimedMilestones[milestoneId]) {
        // Get token bonus from armor
        const tokenBonus = getTokenBonus();
        const bonusAmount = Math.floor(milestone.reward * tokenBonus);
        const totalReward = milestone.reward + bonusAmount;
        
        // Award the tokens
        setTokens(prevTokens => prevTokens + totalReward);
        
        // Mark milestone as claimed
        setClaimedMilestones(prev => ({
          ...prev,
          [milestoneId]: true
        }));
      }
    });
  };
  
  const removeTask = (taskId) => {
    setActiveTasks(activeTasks.filter(task => task.id !== taskId));
  };
  
  // Get milestone data
  const getMilestoneData = () => {
    return {
      milestones: milestoneRewards,
      claimed: claimedMilestones
    };
  };
  
  // Context value
  const value = {
    tokens,
    setTokens,
    xp,
    setXp,
    tickets,
    setTickets,
    inventoryItems,
    setInventoryItems,
    activeItemFilter,
    setActiveItemFilter,
    purchaseItem,
    useItem,
    getFilteredItems,
    equippedAbilities,
    setEquippedAbilities,
    equipAbility,
    activeTasks,
    setActiveTasks,
    taskBank,
    setTaskBank,
    addTaskToBank,
    removeTaskFromBank,
    addTaskToActive,
    completeTask,
    removeTask,
    todayDate,
    isTaskDueToday,
    getTasksDueToday,
    milestoneRewards,
    claimedMilestones,
    getMilestoneData,
    weaponCooldowns,
    getXpBonus,
    getTokenBonus
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 