import React, { createContext, useState, useContext, useEffect } from 'react';
import { doc, updateDoc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

// Function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Initial items data
const initialItems = [
  {
    id: 1,
    name: 'Lootbox',
    type: 'lootbox',
    icon: 'custom-lootbox',
    description: 'Contains 10-100 XP. Open to boost your productivity journey!',
    price: 150,
    owned: false,
    quantity: 0
  },
  {
    id: 201, 
    name: '5 Tickets', 
    type: 'ticket', 
    icon: 'custom-ticket', 
    description: 'Use tickets to unlock special rewards', 
    price: 600, 
    amount: 5,
    owned: false,
    quantity: 0
  },
  {
    id: 202, 
    name: '20 Tickets', 
    type: 'ticket', 
    icon: 'custom-ticket', 
    description: 'Use tickets to unlock special rewards', 
    price: 2000, 
    amount: 20,
    owned: false,
    quantity: 0
  },
  {
    id: 203, 
    name: '50 Tickets', 
    type: 'ticket', 
    icon: 'custom-ticket', 
    description: 'Use tickets to unlock special rewards', 
    price: 4500, 
    amount: 50,
    owned: false,
    quantity: 0
  },
  {
    id: 11,
    name: 'Time Warp',
    type: 'ability',
    icon: 'clock',
    description: 'Reset daily task timers',
    price: 800,
    owned: false,
    quantity: 0
  },
  {
    id: 12,
    name: 'Double Rewards',
    type: 'ability',
    icon: 'gem',
    description: 'Double tokens for next 5 tasks',
    price: 1200,
    owned: false,
    quantity: 0
  },
  {
    id: 13,
    name: 'Task Skip',
    type: 'ability',
    icon: 'forward',
    description: 'Skip a difficult task without penalty',
    price: 500,
    owned: false,
    quantity: 0
  },
  { id: 2, name: 'Flip Coin', type: 'ability', icon: 'exchange-alt', description: 'Flip for either an easy or hard task', owned: true },
  { id: 3, name: 'Card Monte', type: 'ability', icon: 'play-circle', description: 'Play 3-card monte for a task reward', owned: true },
  { id: 4, name: 'Lootbox', type: 'lootbox', icon: 'custom-lootbox', description: 'Contains 10-100 XP', owned: true },
  { id: 7, name: 'XP Booster', type: 'armor', icon: 'tachometer-alt', description: 'Increase XP gain by 2%', owned: true, rarity: 'common' },
  { id: 8, name: 'Token Booster', type: 'armor', icon: 'coins', description: 'Increase token gain by 2%', owned: true, rarity: 'common' },
  { id: 9, name: 'Task Eraser', type: 'weapon', icon: 'eraser', description: 'Delete a task (5% success rate)', owned: true, rarity: 'common', cooldown: 'daily' },
  { id: 10, name: 'Token Generator', type: 'weapon', icon: 'money-bill', description: 'Add 500 tokens (5% success rate)', owned: true, rarity: 'common', cooldown: 'daily' }
];

// Initial task bank data is empty
const initialTaskBank = [];

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
          
          if (userData.equippedAbilities) {
            setEquippedAbilities(userData.equippedAbilities);
          }
          
          if (userData.weaponCooldowns) {
            setWeaponCooldowns(userData.weaponCooldowns);
          }
          
          if (userData.claimedMilestones) {
            setClaimedMilestones(userData.claimedMilestones);
          }
          
          // Load inventory from inventory subcollection
          const inventoryCollectionRef = collection(db, 'users', currentUser.uid, 'inventory');
          const inventorySnapshot = await getDocs(inventoryCollectionRef);
          
          const inventoryItems = [];
          inventorySnapshot.forEach(doc => {
            inventoryItems.push(doc.data());
          });
          
          if (inventoryItems.length > 0) {
            setInventoryItems(inventoryItems);
          } else {
            // If no inventory items exist, use initial items
            setInventoryItems(initialItems);
          }
          
          // Load active tasks from active tasks collection
          const activeTasksCollectionRef = collection(db, 'users', currentUser.uid, 'activeTasks');
          const activeTasksSnapshot = await getDocs(activeTasksCollectionRef);
          
          const activeTasks = [];
          activeTasksSnapshot.forEach(doc => {
            activeTasks.push(doc.data());
          });
          
          setActiveTasks(activeTasks);
          
          // Load task bank from task bank collection
          const taskBankCollectionRef = collection(db, 'users', currentUser.uid, 'taskBank');
          const taskBankSnapshot = await getDocs(taskBankCollectionRef);
          
          const taskBank = [];
          taskBankSnapshot.forEach(doc => {
            taskBank.push(doc.data());
          });
          
          setTaskBank(taskBank);
        } else {
          // If no user data exists, set defaults and create a new document
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            username: currentUser.displayName,
            tokens: 1250,
            xp: 0,
            tickets: 8,
            equippedItems: [null, null, null],
            weaponCooldowns: {},
            claimedMilestones: {}
          });
          
          // Initialize inventory with initial items
          await Promise.all(initialItems.map(async (item) => {
            const itemDocRef = doc(db, 'users', currentUser.uid, 'inventory', item.id.toString());
            await setDoc(itemDocRef, item);
          }));
          
          setInventoryItems(initialItems);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUserData();
  }, [currentUser]);
  
  // Save user document data to Firestore whenever state changes
  useEffect(() => {
    const saveUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Only save main user properties to user document
        await updateDoc(userDocRef, {
          tokens,
          xp,
          tickets,
          equippedItems: equippedAbilities,
          weaponCooldowns,
          claimedMilestones,
          lastUpdated: new Date()
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
    equippedAbilities,
    weaponCooldowns,
    claimedMilestones
  ]);
  
  // Save inventory items to Firestore whenever inventory changes
  useEffect(() => {
    const saveInventoryData = async () => {
      if (!currentUser || !inventoryItems.length) return;
      
      try {
        // Save each inventory item as a separate document in the subcollection
        await Promise.all(inventoryItems.map(async (item) => {
          const itemDocRef = doc(db, 'users', currentUser.uid, 'inventory', item.id.toString());
          await setDoc(itemDocRef, {
            ...item,
            lastUpdated: new Date()
          });
        }));
      } catch (error) {
        console.error("Error saving inventory data:", error);
      }
    };
    
    // Debounce function to prevent too many writes
    const timeoutId = setTimeout(() => {
      if (currentUser) {
        saveInventoryData();
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [currentUser, inventoryItems]);
  
  // Save tasks to Firestore when they change
  useEffect(() => {
    const saveTaskData = async () => {
      if (!currentUser) return;
      
      try {
        // Save active tasks to subcollection
        const activeTasksToDelete = new Set();
        
        // Get current active tasks in Firestore
        const activeTasksCollectionRef = collection(db, 'users', currentUser.uid, 'activeTasks');
        const activeTasksSnapshot = await getDocs(activeTasksCollectionRef);
        
        // Collect IDs of tasks that may need to be deleted
        activeTasksSnapshot.forEach(doc => {
          activeTasksToDelete.add(doc.id);
        });
        
        // Save current active tasks and remove IDs from delete set
        await Promise.all(activeTasks.map(async (task) => {
          const taskId = task.id.toString();
          const taskDocRef = doc(db, 'users', currentUser.uid, 'activeTasks', taskId);
          await setDoc(taskDocRef, {
            ...task,
            lastUpdated: new Date()
          });
          activeTasksToDelete.delete(taskId);
        }));
        
        // Delete tasks that no longer exist
        await Promise.all([...activeTasksToDelete].map(async (taskId) => {
          const taskDocRef = doc(db, 'users', currentUser.uid, 'activeTasks', taskId);
          await deleteDoc(taskDocRef);
        }));
      } catch (error) {
        console.error("Error saving active tasks data:", error);
      }
    };
    
    // Debounce function to prevent too many writes
    const timeoutId = setTimeout(() => {
      if (currentUser) {
        saveTaskData();
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [currentUser, activeTasks]);
  
  // Save task bank to Firestore when it changes
  useEffect(() => {
    const saveTaskBankData = async () => {
      if (!currentUser) return;
      
      try {
        // Save task bank items to subcollection
        const taskBankToDelete = new Set();
        
        // Get current task bank items in Firestore
        const taskBankCollectionRef = collection(db, 'users', currentUser.uid, 'taskBank');
        const taskBankSnapshot = await getDocs(taskBankCollectionRef);
        
        // Collect IDs of tasks that may need to be deleted
        taskBankSnapshot.forEach(doc => {
          taskBankToDelete.add(doc.id);
        });
        
        // Save current task bank items and remove IDs from delete set
        await Promise.all(taskBank.map(async (task) => {
          const taskId = task.id.toString();
          const taskDocRef = doc(db, 'users', currentUser.uid, 'taskBank', taskId);
          await setDoc(taskDocRef, {
            ...task,
            lastUpdated: new Date()
          });
          taskBankToDelete.delete(taskId);
        }));
        
        // Delete tasks that no longer exist
        await Promise.all([...taskBankToDelete].map(async (taskId) => {
          const taskDocRef = doc(db, 'users', currentUser.uid, 'taskBank', taskId);
          await deleteDoc(taskDocRef);
        }));
      } catch (error) {
        console.error("Error saving task bank data:", error);
      }
    };
    
    // Debounce function to prevent too many writes
    const timeoutId = setTimeout(() => {
      if (currentUser) {
        saveTaskBankData();
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [currentUser, taskBank]);
  
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
  
  // Use lootbox to get random XP
  const useLootbox = (item) => {
    // Generate random XP amount between 10 and 100
    const xpAmount = Math.floor(Math.random() * 91) + 10;
    
    // Add XP
    setXp(prevXp => prevXp + xpAmount);
    
    // Update inventory - reduce quantity
    updateInventoryItem(item.id, { quantity: item.quantity - 1 });
    
    return { success: true, xpAmount };
  };
  
  // Use ticket to add tickets to the user
  const useTicket = (item) => {
    // Add tickets based on the amount
    const ticketAmount = item.amount || 1;
    setTickets(prevTickets => prevTickets + ticketAmount);
    
    // Update inventory - reduce quantity
    updateInventoryItem(item.id, { quantity: item.quantity - 1 });
    
    return { success: true, ticketAmount };
  };
  
  // Use item/ability
  const useItem = (itemId) => {
    const item = inventoryItems.find(item => item.id === itemId);
    
    if (!item) return false;
    
    // Handle loot boxes
    if (item.type === 'lootbox') {
      return useLootbox(item);
    }
    
    // Handle tickets
    if (item.type === 'ticket') {
      return useTicket(item);
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
  const addTaskToBank = async (newTask) => {
    if (!currentUser) return;
    
    const taskWithId = { ...newTask, id: Date.now() };
    
    // Update local state
    setTaskBank(prevTasks => [...prevTasks, taskWithId]);
    
    try {
      // Save to Firebase subcollection
      const taskDocRef = doc(db, 'users', currentUser.uid, 'taskBank', taskWithId.id.toString());
      await setDoc(taskDocRef, {
        ...taskWithId,
        userId: currentUser.uid,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error("Error adding task to bank:", error);
    }
  };
  
  const removeTaskFromBank = async (taskId) => {
    if (!currentUser) return;
    
    // Update local state
    setTaskBank(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    try {
      // Delete from Firebase subcollection
      const taskDocRef = doc(db, 'users', currentUser.uid, 'taskBank', taskId.toString());
      await deleteDoc(taskDocRef);
    } catch (error) {
      console.error("Error removing task from bank:", error);
    }
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
  const addTaskToActive = async (task) => {
    if (!currentUser) return;
    
    // Generate a new ID only if one doesn't already exist
    const taskId = task.id || Date.now();
    
    const newTask = {
      ...task,
      id: taskId,
      completed: false,
      dateAdded: todayDate,
      dueDate: todayDate // for one-time tasks, set due date to today
    };
    
    // Check if task already exists
    const taskExists = activeTasks.some(t => 
      t.text === task.text && 
      t.rarity === task.rarity && 
      t.repetition === task.repetition
    );
    
    // Only add if it doesn't exist
    if (!taskExists) {
      setActiveTasks(prevTasks => [...prevTasks, newTask]);
      
      try {
        // Save to Firebase subcollection
        const taskDocRef = doc(db, 'users', currentUser.uid, 'activeTasks', newTask.id.toString());
        await setDoc(taskDocRef, {
          ...newTask,
          userId: currentUser.uid,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error("Error adding task to active list:", error);
      }
      
      return newTask; // Return the newly created task
    }
    
    return null;
  };
  
  // Complete task and check for milestone rewards
  const completeTask = async (taskId) => {
    if (!currentUser) return;
    
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
        
        // Update the task in Firebase
        try {
          const updatedTask = { ...completedTask, completed: true, lastUpdated: new Date() };
          const taskDocRef = doc(db, 'users', currentUser.uid, 'activeTasks', taskId.toString());
          setDoc(taskDocRef, updatedTask);
        } catch (error) {
          console.error("Error completing task in Firebase:", error);
        }
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
  
  const removeTask = async (taskId) => {
    if (!currentUser) return;
    
    // Update local state
    setActiveTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    try {
      // Delete from Firebase subcollection
      const taskDocRef = doc(db, 'users', currentUser.uid, 'activeTasks', taskId.toString());
      await deleteDoc(taskDocRef);
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };
  
  // Get milestone data
  const getMilestoneData = () => {
    return {
      milestones: milestoneRewards,
      claimed: claimedMilestones
    };
  };
  
  // Update specific inventory item
  const updateInventoryItem = async (itemId, updates) => {
    if (!currentUser) return;
    
    // Update local state
    setInventoryItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, ...updates } 
          : item
      )
    );
    
    try {
      // Update in Firebase subcollection
      const itemDocRef = doc(db, 'users', currentUser.uid, 'inventory', itemId.toString());
      const itemSnapshot = await getDoc(itemDocRef);
      
      if (itemSnapshot.exists()) {
        await updateDoc(itemDocRef, {
          ...updates,
          lastUpdated: new Date()
        });
      } else {
        // If item doesn't exist, get it from local state and save it
        const item = inventoryItems.find(item => item.id === itemId);
        if (item) {
          await setDoc(itemDocRef, {
            ...item,
            ...updates,
            lastUpdated: new Date()
          });
        }
      }
    } catch (error) {
      console.error("Error updating inventory item:", error);
    }
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
    setClaimedMilestones,
    getMilestoneData,
    weaponCooldowns,
    setWeaponCooldowns,
    getXpBonus,
    getTokenBonus,
    updateInventoryItem,
    initialItems
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 