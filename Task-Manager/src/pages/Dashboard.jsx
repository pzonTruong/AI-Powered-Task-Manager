import { useState, useEffect } from 'react';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import { useGemini } from '../hooks/useGemini'; 
import { useTheme } from '../context/ThemeContext'; 

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function Dashboard() {
  const { isDarkMode } = useTheme(); 
  
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('my-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const { generateSubtasks, loading, error } = useGemini();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    localStorage.setItem('my-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- ACTIONS ---
  const addTask = (text) => {
    const newTask = { id: Date.now(), text, completed: false, isParent: true, createdAt: new Date().toISOString() };
    setTasks([newTask, ...tasks]);
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id && t.parentId !== id));
  };

  const toggleTask = (id) => {
    setTasks(prevTasks => {
      let updatedTasks = prevTasks.map(task => ({ ...task }));
      const clickedTask = updatedTasks.find(t => t.id === id);
      if (!clickedTask) return prevTasks;

      const newStatus = !clickedTask.completed;
      clickedTask.completed = newStatus;

      // Cascade Down (Sync children)
      if (clickedTask.isParent) {
        updatedTasks.forEach(t => {
          if (t.parentId === clickedTask.id) t.completed = newStatus;
        });
      }

      // Bubble Up (Sync parent)
      updatedTasks.forEach(parent => {
        if (parent.isParent) {
          const children = updatedTasks.filter(t => t.parentId === parent.id);
          if (children.length > 0) {
            parent.completed = children.every(c => c.completed);
          }
        }
      });

      return updatedTasks;
    });
  };

  const addSubtask = (parentId) => {
    const newSubtask = { id: Date.now(), text: "", completed: false, isSubtask: true, parentId, createdAt: new Date().toISOString() };
    setTasks(prev => {
      const parentIndex = prev.findIndex(t => t.id === parentId);
      const before = prev.slice(0, parentIndex + 1);
      const after = prev.slice(parentIndex + 1);
      return [...before, newSubtask, ...after];
    });
  };

  const editTask = (id, newText) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const handleMagicAdd = async (mainTaskText) => {
    if (!mainTaskText) return;
    const parentId = Date.now();
    const newParent = { id: parentId, text: mainTaskText, completed: false, isParent: true, createdAt: new Date().toISOString() };
    setTasks(prev => [newParent, ...prev]);

    const subTasks = await generateSubtasks(mainTaskText);
    if (subTasks.length > 0) {
      const newSubTasks = subTasks.map((sub, index) => ({
        id: parentId + index + 1, text: sub, completed: false, isSubtask: true, parentId, createdAt: new Date().toISOString()
      }));
      setTasks(prev => {
        const parentIndex = prev.findIndex(t => t.id === parentId);
        if (parentIndex === -1) return [...newSubTasks, ...prev];
        const before = prev.slice(0, parentIndex + 1);
        const after = prev.slice(parentIndex + 1);
        return [...before, ...newSubTasks, ...after];
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTasks((items) => {
      const activeTask = items.find(t => t.id === active.id);
      
      if (activeTask.isSubtask) {
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      }

      const familyIds = [activeTask.id, ...items.filter(t => t.parentId === activeTask.id).map(t => t.id)];
      const cleanList = items.filter(t => !familyIds.includes(t.id));
      let insertIndex = cleanList.findIndex(t => t.id === over.id);
      if (insertIndex === -1) insertIndex = cleanList.length;

      while (insertIndex < cleanList.length) {
        const prevItem = cleanList[insertIndex - 1];
        if (prevItem && prevItem.isSubtask) break; 
        if (prevItem && prevItem.isParent) {
           const hasChildren = cleanList.some(t => t.parentId === prevItem.id);
           if (hasChildren) {
             insertIndex++;
             continue;
           }
        }
        break;
      }

      const itemsBefore = cleanList.slice(0, insertIndex);
      const itemsAfter = cleanList.slice(insertIndex);
      const movingFamily = [activeTask, ...items.filter(t => t.parentId === activeTask.id)];
      return [...itemsBefore, ...movingFamily, ...itemsAfter];
    });
  };

  // --- FILTERING LOGIC ---
  const doneParentIds = tasks
    .filter(t => t.isParent && t.completed)
    .map(t => t.id);

  // Active: Parents NOT done, or Subtasks whose parent is NOT done
  const activeTasks = tasks.filter(t => {
    if (t.isParent) return !t.completed;
    return !doneParentIds.includes(t.parentId);
  });

  // Completed: Parents WHO ARE done, and their subtasks
  const doneTasks = tasks.filter(t => {
    if (t.isParent) return t.completed;
    return doneParentIds.includes(t.parentId);
  });

  // --- STATS ---
  const totalTasks = tasks.filter(t => t.isParent).length;
  const completedCount = tasks.filter(t => t.isParent && t.completed).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  // --- STYLES ---
  const containerStyle = { 
    padding: '20px', 
    maxWidth: '800px', 
    margin: '0 auto',
    color: isDarkMode ? '#eee' : '#333'
  };

  const progressContainerStyle = { 
    marginBottom: '30px', 
    padding: '25px', 
    background: isDarkMode ? 'linear-gradient(145deg, #2a2a2a, #333)' : 'linear-gradient(145deg, #ffffff, #f0f0f0)', 
    borderRadius: '16px',
    boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.05)',
    border: isDarkMode ? '1px solid #444' : '1px solid #fff'
  };

  const barBackgroundStyle = { 
    height: '14px', 
    background: isDarkMode ? '#444' : '#e0e0e0', 
    borderRadius: '7px', 
    overflow: 'hidden',
    marginTop: '15px'
  };

  const barFillStyle = { 
    width: `${progress}%`, 
    height: '100%', 
    background: progress === 100 
      ? 'linear-gradient(90deg, #4caf50, #81c784)' 
      : 'linear-gradient(90deg, #646cff, #9f7aea)', 
    borderRadius: '7px',
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: '20px' }}>Smart Task Manager</h1>

      <div style={progressContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Project Velocity</h2>
            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {completedCount} of {totalTasks} major tasks completed
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDarkMode ? '#fff' : '#444' }}>
            {progress}%
          </div>
        </div>
        <div style={barBackgroundStyle}>
          <div style={barFillStyle} />
        </div>
      </div>

      {loading && <p style={{color: '#646cff', fontWeight: 'bold', animation: 'pulse 1s infinite'}}>AI is structuring your plan...</p>}
      {error && <p style={{color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: '10px', borderRadius: '8px'}}>{error}</p>}

      <TaskInput onAddTask={addTask} onMagicAdd={handleMagicAdd} isLoading={loading} />

      {/* ACTIVE SECTION */}
      <h3 style={{ borderBottom: isDarkMode ? '1px solid #444' : '2px solid #f0f0f0', paddingBottom: '10px', marginTop: '40px' }}>
        In Progress ({activeTasks.length})
      </h3>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={activeTasks} strategy={verticalListSortingStrategy}>
          <div style={{ minHeight: '50px' }}>
            {activeTasks.length === 0 && (
              <p style={{color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '20px'}}>
                Everything is clear! Time to relax or add more.
              </p>
            )}
            
            {activeTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleTask} 
                onDelete={deleteTask}
                onAddSubtask={addSubtask}
                onEdit={editTask}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* COMPLETED SECTION */}
      {doneTasks.length > 0 && (
        <>
          <h3 style={{ borderBottom: isDarkMode ? '1px solid #444' : '2px solid #f0f0f0', paddingBottom: '10px', marginTop: '40px', color: '#888' }}>
            Completed ({doneTasks.length})
          </h3>
          {/* UPDATED STYLE: ALLOWS CLICKS */}
          <div style={{ 
            opacity: 0.6, 
            filter: 'grayscale(20%)', 
            transition: 'all 0.3s ease'
          }}>
            {doneTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleTask} // This will now work
                onDelete={deleteTask}
                onAddSubtask={addSubtask}
                onEdit={editTask}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}