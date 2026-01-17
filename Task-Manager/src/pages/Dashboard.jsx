import { useState, useEffect } from 'react';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import { useGemini } from '../hooks/useGemini';

export default function Dashboard() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('my-tasks');
        return saved ? JSON.parse(saved) : [];
    });

    const { generateSubtasks, loading, error } = useGemini();

    useEffect(() => {
        localStorage.setItem('my-tasks', JSON.stringify(tasks));
    }, [tasks]);

    // --- CORE ACTIONS ---

    const addTask = (text) => {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            isParent: true, // New tasks are parents by default
            createdAt: new Date().toISOString()
        };
        setTasks([newTask, ...tasks]);
    };



    // 1. CASCADING DELETE (Delete Parent + Children)
    const deleteTask = (id) => {
        setTasks(prevTasks => prevTasks.filter(task =>
            task.id !== id && task.parentId !== id // Delete the task AND its children
        ));
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    // 2. ADD SUBTASK MANUALLY
    const addSubtask = (parentId) => {
        const newSubtask = {
            id: Date.now(),
            text: "", // <--- Start BLANK
            completed: false,
            isSubtask: true,
            parentId: parentId,
            createdAt: new Date().toISOString()
        };

        setTasks(prev => {
            const parentIndex = prev.findIndex(t => t.id === parentId);
            // Insert immediately after the parent
            const before = prev.slice(0, parentIndex + 1);
            const after = prev.slice(parentIndex + 1);
            return [...before, newSubtask, ...after];
        });
    };

    // 3. EDIT CONTENT
    const editTask = (id, newText) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, text: newText } : task
        ));
    };

    // --- AI MAGIC ---
    const handleMagicAdd = async (mainTaskText) => {
        if (!mainTaskText) return;

        const parentId = Date.now();
        const newParent = {
            id: parentId,
            text: mainTaskText,
            completed: false,
            isParent: true,
            createdAt: new Date().toISOString()
        };

        setTasks(prev => [newParent, ...prev]);

        const subTasks = await generateSubtasks(mainTaskText);

        if (subTasks.length > 0) {
            const newSubTasks = subTasks.map((sub, index) => ({
                id: parentId + index + 1,
                text: sub,
                completed: false,
                isSubtask: true,
                parentId: parentId, // <--- CRITICAL: Link for cascading delete
                createdAt: new Date().toISOString()
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

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Smart Project Manager</h1>

            {loading && <p style={{ color: '#646cff' }}>✨ AI is thinking...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <TaskInput onAddTask={addTask} onMagicAdd={handleMagicAdd} isLoading={loading} />

            <div>
                {tasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onAddSubtask={addSubtask} // Pass down new function
                        onEdit={editTask}         // Pass down new function
                    />
                ))}
            </div>
        </div>
    );
}