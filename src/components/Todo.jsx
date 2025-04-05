import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrashAlt, 
  FaCalendarAlt, 
  FaStar, 
  FaRegStar, 
  FaCoins,
  FaCrown,
  FaDice,
  FaRandom,
  FaExchangeAlt,
  FaQuestionCircle,
  FaPlayCircle,
  FaSync,
  FaTimes,
  FaBolt,
  FaBullseye,
  FaShieldAlt,
  FaClock,
  FaGem,
  FaForward,
  FaDatabase,
  FaTrophy,
  FaCheckCircle,
  FaTachometerAlt,
  FaEraser,
  FaMoneyBill,
  FaTicketAlt
} from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import './Todo.css';

function Todo() {
  const { 
    tokens, 
    setTokens, 
    xp,
    setXp,
    tickets,
    inventoryItems, 
    equipAbility, 
    equippedAbilities, 
    useItem,
    activeTasks,
    taskBank,
    addTaskToActive,
    completeTask,
    removeTask,
    todayDate,
    isTaskDueToday,
    getTasksDueToday,
    milestoneRewards,
    claimedMilestones,
    weaponCooldowns,
    getXpBonus,
    getTokenBonus
  } = useAppContext();
  
  const [activeTaskTab, setActiveTaskTab] = useState('active');
  const [showMontyGame, setShowMontyGame] = useState(false);
  const [flippedCards, setFlippedCards] = useState([false, false, false]);
  const [correctCardIndex, setCorrectCardIndex] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [abilitySelectedTask, setAbilitySelectedTask] = useState(null);
  const abilitiesDropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (abilitiesDropdownRef.current && 
          !abilitiesDropdownRef.current.contains(event.target) && 
          activeSlot !== null) {
        setActiveSlot(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeSlot]);

  // Get tasks due today using the context function
  const tasksDueToday = activeTasks.filter(task => !task.completed && isTaskDueToday(task));
  const completedTasksToday = activeTasks.filter(task => task.completed && isTaskDueToday(task));
  
  // Get tasks from task bank that are due today but not in active tasks
  const taskBankDueToday = taskBank.filter(bankTask => {
    // Check if task is due today
    if (!isTaskDueToday(bankTask)) return false;
    
    // Check if task is not already in active tasks
    return !activeTasks.some(activeTask => 
      activeTask.text === bankTask.text && 
      activeTask.rarity === bankTask.rarity && 
      activeTask.repetition === bankTask.repetition);
  });
  
  // Get all tasks due today (from both active tasks and bank)
  const allTasksDueToday = [...tasksDueToday, ...taskBankDueToday];
  
  // Calculate progress based on all tasks due today vs completed
  const totalTasksForToday = allTasksDueToday.length + completedTasksToday.length;
  const progressPercentage = totalTasksForToday > 0 
    ? (completedTasksToday.length / totalTasksForToday) * 100 
    : 0;
    
  // Check if a milestone is claimed
  const isMilestoneClaimed = (milestonePercent) => {
    const milestoneId = `${todayDate}-${milestonePercent}`;
    return !!claimedMilestones[milestoneId];
  };

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

  // Filter tasks based on the active tab and avoid duplication
  const filteredTasks = activeTasks.filter(task => {
    if (activeTaskTab === 'active') return !task.completed;
    if (activeTaskTab === 'completed') return task.completed;
    return true; // 'all' tab - show all tasks
  });

  // Combined tasks including due today from bank but only for active tab
  const combinedTasks = [...filteredTasks];

  // Add tasks from bank that are due today for active tab and all tab
  if (activeTaskTab === 'active' || activeTaskTab === 'all') {
    taskBankDueToday.forEach(bankTask => {
      // Check if this task exists in ANY active task, regardless of completion status
      const existsInActiveTasks = activeTasks.some(task => 
        task.text === bankTask.text && 
        task.rarity === bankTask.rarity && 
        task.repetition === task.repetition
      );
      
      // Only add from bank if it doesn't exist in active tasks at all
      if (!existsInActiveTasks) {
        // Create a temporary task object with visual indicator
        const tempTask = {
          ...bankTask,
          isFromBank: true // Flag to show it's from the bank
        };
        combinedTasks.push(tempTask);
      }
    });
  }

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

  // Helper functions to get tasks from displayed tasks
  const getDisplayedTasks = () => {
    // Get all tasks that are currently displayed (including those from bank)
    return combinedTasks.filter(task => !task.completed);
  };

  const getDisplayedTasksByRarity = (rarity) => {
    return getDisplayedTasks().filter(task => task.rarity === rarity);
  };

  const getRandomDisplayedTask = () => {
    const availableTasks = getDisplayedTasks();
    if (availableTasks.length === 0) {
      // If no tasks available, return null
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    return availableTasks[randomIndex];
  };

  const getRandomDisplayedTaskByRarity = (rarity) => {
    const tasksOfRarity = getDisplayedTasksByRarity(rarity);
    if (tasksOfRarity.length === 0) {
      // If no tasks of this rarity exist, try to get any task
      return getRandomDisplayedTask();
    }
    const randomIndex = Math.floor(Math.random() * tasksOfRarity.length);
    return tasksOfRarity[randomIndex];
  };
  
  // Task generator functions - updated to work with displayed tasks
  const generateRandomTask = () => {
    const randomTask = getRandomDisplayedTask();
    if (randomTask) {
      // If task is from bank, add it to active tasks
      if (randomTask.isFromBank) {
        addTaskToActive(randomTask);
      }
      setAbilitySelectedTask(randomTask);
    } else {
      alert("No tasks available. Create tasks in Settings to see them here!");
    }
  };

  const flipCoin = () => {
    const isHeads = Math.random() > 0.5;
    const taskRarity = isHeads ? "common" : "epic";
    
    // Get a task of appropriate rarity from displayed tasks
    const task = getRandomDisplayedTaskByRarity(taskRarity);
    
    if (task) {
      setGameResult({
        type: 'coin',
        result: isHeads ? 'heads' : 'tails',
        task: task
      });
    } else {
      alert(`No ${taskRarity} tasks available. Create ${taskRarity} tasks in Settings!`);
    }
  };

  const startMontyGame = () => {
    setShowMontyGame(true);
    setFlippedCards([false, false, false]);
    setCorrectCardIndex(Math.floor(Math.random() * 3));
    setGameResult(null);
  };

  const handleCardFlip = (index) => {
    if (flippedCards.some(flipped => flipped)) return;
    
    const newFlippedCards = [false, false, false];
    newFlippedCards[index] = true;
    setFlippedCards(newFlippedCards);
    
    if (index === correctCardIndex) {
      // Player won - try to get uncommon task
      const task = getRandomDisplayedTaskByRarity('uncommon');
      if (task) {
        setGameResult({
          type: 'monty',
          result: 'win',
          task: task
        });
      } else {
        alert("No uncommon tasks available. Create uncommon tasks in Settings!");
        setFlippedCards([false, false, false]);
      }
    } else {
      // Player lost - try to get legendary task
      const task = getRandomDisplayedTaskByRarity('legendary');
      if (task) {
        setGameResult({
          type: 'monty',
          result: 'lose',
          task: task
        });
      } else {
        alert("No legendary tasks available. Create legendary tasks in Settings!");
        setFlippedCards([false, false, false]);
      }
    }
  };

  // Update game result handler to handle bank tasks properly
  const handleGameResultAction = (task) => {
    if (task.isFromBank) {
      // Check if this exact task already exists in active tasks
      const existingTask = activeTasks.find(activeTask => 
        activeTask.text === task.text && 
        activeTask.rarity === task.rarity && 
        activeTask.repetition === task.repetition
      );
      
      if (!existingTask) {
        // Only add if it doesn't already exist
        addTaskToActive(task);
      }
    }
    
    setAbilitySelectedTask(task);
    setGameResult(null);
    setShowMontyGame(false);
  };

  // Slot types
  const slotType = ['ability', 'armor', 'weapon'];
  
  // Handle ability slots
  const handleAbilitySlotClick = (slotIndex) => {
    const abilityId = equippedAbilities[slotIndex];
    
    if (abilityId) {
      // If ability is equipped, use it
      const item = getEquippedAbilityInfo(abilityId);
      if (item) {
        // Use the item based on type
        if (slotType[slotIndex] === 'ability') {
          // Use ability
          useAbility(item);
        } else if (slotType[slotIndex] === 'weapon') {
          // Use weapon
          const result = useItem(abilityId);
          
          if (result) {
            // Show result message
            alert(result.message || 'Weapon used');
          }
        } else if (slotType[slotIndex] === 'armor') {
          // Show armor effect
          const xpBonus = getXpBonus();
          const tokenBonus = getTokenBonus();
          
          if (xpBonus > 0) {
            alert(`XP Booster is active: +${xpBonus * 100}% XP from tasks`);
          } else if (tokenBonus > 0) {
            alert(`Token Booster is active: +${tokenBonus * 100}% tokens from milestones`);
          } else {
            alert('This armor has no effect yet');
          }
        }
      }
    } else {
      // Open dropdown to equip an ability
      setActiveSlot(activeSlot === slotIndex ? null : slotIndex);
    }
  };

  const handleEquipAbility = (abilityId) => {
    if (activeSlot !== null) {
      equipAbility(abilityId, activeSlot);
      setActiveSlot(null);
    }
  };

  // Use an equipped ability
  const useAbility = (ability) => {
    switch(ability.name) {
      case 'Random Task':
        generateRandomTask();
        break;
      case 'Flip Coin':
        flipCoin();
        break;
      case 'Card Monte':
        startMontyGame();
        break;
      default:
        console.log(`Using ability: ${ability.name}`);
    }
  };

  // Get icon based on icon name
  const getAbilityIcon = (iconName) => {
    switch(iconName) {
      case 'dice': return <FaDice />;
      case 'exchange-alt': return <FaExchangeAlt />;
      case 'play-circle': return <FaPlayCircle />;
      case 'bolt': return <FaBolt />;
      case 'bullseye': return <FaBullseye />;
      case 'shield': return <FaShieldAlt />;
      case 'clock': return <FaClock />;
      case 'gem': return <FaGem />;
      case 'forward': return <FaForward />;
      case 'tachometer-alt': return <FaTachometerAlt />;
      case 'coins': return <FaCoins />;
      case 'eraser': return <FaEraser />;
      case 'money-bill': return <FaMoneyBill />;
      default: return <FaQuestionCircle />;
    }
  };

  // Get ability info from equipped ability ID
  const getEquippedAbilityInfo = (abilityId) => {
    if (!abilityId) return null;
    return inventoryItems.find(item => item.id === abilityId);
  };

  // Filter abilities that are owned and match the current slot type
  const availableAbilities = inventoryItems.filter(
    item => item.owned === true && (activeSlot !== null ? item.type === slotType[activeSlot] : true)
  );

  return (
    <div className="todo-container">
      {/* Mobile Stats Display */}
      <div className="mobile-stats-display">
        <div className="mobile-stat-item">
          <FaCoins className="mobile-stat-icon tokens" />
          <span className="mobile-stat-value">{tokens}</span>
        </div>
        <div className="mobile-stat-item">
          <FaTrophy className="mobile-stat-icon xp" />
          <span className="mobile-stat-value">{xp}</span>
        </div>
        <div className="mobile-stat-item">
          <FaTicketAlt className="mobile-stat-icon tickets" />
          <span className="mobile-stat-value">{tickets}</span>
        </div>
      </div>
      
      <h2>Tasks</h2>
      
      {/* Progress Bar for Today's Tasks */}
      <div className="daily-progress-container">
        <div className="daily-progress-header">
          <div className="daily-progress-title">
            <FaCalendarAlt /> Today's Progress
          </div>
          <div className="daily-progress-stats">
            {completedTasksToday.length}/{totalTasksForToday} tasks completed
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
          
          {milestoneRewards.map((milestone, index) => (
            <div 
              key={index}
              className={`milestone ${progressPercentage >= milestone.percent ? 'reached' : ''} ${isMilestoneClaimed(milestone.percent) ? 'claimed' : ''}`}
              style={{ left: `${milestone.percent}%` }}
            >
              <div className="milestone-indicator">
                {isMilestoneClaimed(milestone.percent) && <FaCheckCircle className="check-icon" />}
              </div>
              <div className="milestone-reward">
                <FaCoins /> {milestone.reward}
              </div>
            </div>
          ))}
        </div>
        
        {totalTasksForToday === 0 && (
          <div className="no-tasks-message">
            No tasks scheduled for today. Add tasks in Settings to see them here!
          </div>
        )}
      </div>
      
      {/* Player Character */}
      <div className="player-character">
        <div className="player-head"></div>
        <div className="player-body"></div>
        <div className="player-arms">
          <div className="player-arm left"></div>
          <div className="player-arm right"></div>
        </div>
        <div className="player-legs">
          <div className="player-leg left"></div>
          <div className="player-leg right"></div>
        </div>
      </div>
      
      {/* Ability slots */}
      <div className="ability-slots">
        {['ability', 'armor', 'weapon'].map((slotType, index) => {
          const abilityId = equippedAbilities[index];
          const ability = getEquippedAbilityInfo(abilityId);
          
          return (
            <div 
              key={index} 
              className={`ability-slot ${slotType} ${abilityId ? 'equipped' : 'empty'}`}
              onClick={() => handleAbilitySlotClick(index)}
            >
              {ability ? (
                <>
                  <div className="ability-icon">
                    {getAbilityIcon(ability.icon)}
                  </div>
                  <div className="ability-name">{ability.name}</div>
                </>
              ) : (
                <div className="empty-slot-text">{slotType.charAt(0).toUpperCase() + slotType.slice(1)}</div>
              )}
              
              {activeSlot === index && (
                <div className="abilities-dropdown" ref={abilitiesDropdownRef}>
                  <h4>Select {slotType.charAt(0).toUpperCase() + slotType.slice(1)}</h4>
                  <ul>
                    {availableAbilities.map(ability => (
                      <li 
                        key={ability.id}
                        onClick={() => handleEquipAbility(ability.id)}
                        className="ability-option"
                      >
                        <div className="ability-option-icon">
                          {getAbilityIcon(ability.icon)}
                        </div>
                        <div className="ability-option-details">
                          <span className="ability-option-name">{ability.name}</span>
                          <span className="ability-option-description">{ability.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Selected Task from Ability */}
      {abilitySelectedTask && (
        <div className="ability-selected-task">
          <h3>Focus Task</h3>
          <div className={`task-item glowing ${abilitySelectedTask.rarity}`}>
            <div className="task-checkbox-container">
              <input 
                type="checkbox" 
                checked={abilitySelectedTask.completed}
                onChange={() => {
                  if (abilitySelectedTask.isFromBank) {
                    // First check if this task is already in active tasks to avoid duplicates
                    const existingTask = activeTasks.find(activeTask => 
                      activeTask.text === abilitySelectedTask.text && 
                      activeTask.rarity === abilitySelectedTask.rarity && 
                      activeTask.repetition === abilitySelectedTask.repetition
                    );
                    
                    if (existingTask) {
                      // If it exists, complete it but don't add a new one
                      completeTask(existingTask.id);
                    } else {
                      // Add to active tasks then complete
                      const newTask = addTaskToActive({...abilitySelectedTask});
                      if (newTask && newTask.id) {
                        completeTask(newTask.id);
                      }
                    }
                  } else {
                    // For regular tasks, just complete them
                    completeTask(abilitySelectedTask.id);
                  }
                  
                  // Clear the focused task
                  setAbilitySelectedTask(null);
                }}
              />
              <span className="custom-checkbox"></span>
            </div>
            
            <div className="task-details">
              <div className="task-text">{abilitySelectedTask.text}</div>
              <div className="task-meta">
                {abilitySelectedTask.repetition !== 'one-time' && (
                  <span className="task-repetition">
                    <FaSync /> {abilitySelectedTask.repetition}
                  </span>
                )}
                {isTaskDueToday(abilitySelectedTask) && (
                  <span className="due-today-badge">
                    <FaCalendarAlt /> Today
                  </span>
                )}
                <span className="task-value">
                  <FaTrophy /> {abilitySelectedTask.tokenValue} XP
                </span>
                {renderRarityStars(abilitySelectedTask.rarity)}
              </div>
            </div>
            
            <button 
              className="cancel-task" 
              onClick={() => setAbilitySelectedTask(null)}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
      
      {/* Game result display */}
      {gameResult && (
        <div className="game-result">
          <h3>
            {gameResult.type === 'coin' 
              ? (gameResult.result === 'heads' ? 'Heads!' : 'Tails!') 
              : (gameResult.result === 'win' ? 'You won!' : 'You lost!')}
          </h3>
          <div className="game-task">
            <p>{gameResult.task.text}</p>
            {renderRarityStars(gameResult.task.rarity)}
          </div>
          <button 
            onClick={() => handleGameResultAction(gameResult.task)}
            className="add-game-task"
          >
            Select Task
          </button>
          <button 
            onClick={() => setGameResult(null)}
            className="cancel-game"
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Three Card Monte */}
      {showMontyGame && !gameResult && (
        <div className="monty-game">
          <h3>Pick a Card!</h3>
          <div className="cards-container">
            {flippedCards.map((flipped, index) => (
              <div 
                key={index}
                className={`card ${flipped ? 'flipped' : ''}`}
                onClick={() => handleCardFlip(index)}
              >
                {flipped ? (
                  <div className="card-back">
                    {index === correctCardIndex ? '✓' : '✗'}
                  </div>
                ) : (
                  <div className="card-front">?</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Task tabs */}
      <div className="task-tabs">
        <button 
          className={activeTaskTab === 'active' ? 'active' : ''}
          onClick={() => setActiveTaskTab('active')}
        >
          Active
        </button>
        <button 
          className={activeTaskTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTaskTab('completed')}
        >
          Completed
        </button>
        <button 
          className={activeTaskTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTaskTab('all')}
        >
          All
        </button>
      </div>
      
      {/* Task list */}
      <ul className="task-list">
        {combinedTasks.length === 0 ? (
          <li className="no-tasks">
            {activeTaskTab === 'active' 
              ? 'No active tasks. Create tasks in Settings!'
              : activeTaskTab === 'completed'
                ? 'No completed tasks yet.'
                : 'No tasks found.'}
          </li>
        ) : (
          combinedTasks.map(task => (
            <li key={task.id} 
                className={`task-item ${task.rarity} ${task.completed ? 'completed' : ''} 
                           ${isTaskDueToday(task) ? 'due-today' : ''}`}>
              <div className="task-checkbox-container">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => {
                    if (task.isFromBank) {
                      // First check if this task is already in active tasks to avoid duplicates
                      const existingTask = activeTasks.find(activeTask => 
                        activeTask.text === task.text && 
                        activeTask.rarity === task.rarity && 
                        activeTask.repetition === task.repetition
                      );
                      
                      if (existingTask) {
                        // If it exists, complete it but don't add a new one
                        completeTask(existingTask.id);
                      } else {
                        // Add to active tasks then complete
                        const newTask = addTaskToActive({...task});
                        if (newTask && newTask.id) {
                          completeTask(newTask.id);
                        }
                      }
                    } else {
                      // For regular tasks, just complete them
                      completeTask(task.id);
                    }
                  }}
                />
                <span className="custom-checkbox"></span>
              </div>
              
              <div className="task-details">
                <div className="task-text">{task.text}</div>
                <div className="task-meta">
                  {task.repetition !== 'one-time' && (
                    <span className="task-repetition">
                      <FaSync /> {task.repetition}
                    </span>
                  )}
                  {isTaskDueToday(task) && (
                    <span className="due-today-badge">
                      <FaCalendarAlt /> Today
                    </span>
                  )}
                  {task.isFromBank && (
                    <span className="from-bank-badge">
                      <FaDatabase /> Bank
                    </span>
                  )}
                  <span className="task-value">
                    <FaTrophy /> {task.tokenValue} XP
                  </span>
                  {renderRarityStars(task.rarity)}
                </div>
              </div>
              
              {!task.isFromBank && !task.completed && (
                <button 
                  className="delete-task" 
                  onClick={() => removeTask(task.id)}
                >
                  <FaTrashAlt />
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Todo; 