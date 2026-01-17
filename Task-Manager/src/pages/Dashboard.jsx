import { useState, useEffect } from 'react';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
// 1. Import the Hook
import { useGemini } from '../hooks/useGemini';

export default function Dashboard() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('my-tasks');
        return saved ? JSON.parse(saved) : [];
    });

    // 2. Use the Hook
    const { generateSubtasks, loading, error } = useGemini();

    useEffect(() => {
        localStorage.setItem('my-tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (text) => {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        setTasks(prev => [newTask, ...prev]);
    };

    // --- 3. NEW: The AI Function ---
    const handleMagicAdd = async (mainTaskText) => {
        if (!mainTaskText) return;

        // A. Add the main task first
        addTask(mainTaskText);

        // B. Call AI to get subtasks
        const subTasks = await generateSubtasks(mainTaskText);

        // C. Add the subtasks automatically
        if (subTasks.length > 0) {
            const newSubTasks = subTasks.map((sub, index) => ({
                id: Date.now() + index + 1, // Ensure unique ID
                text: `↳ ${sub}`, // Add an arrow to show it's a subtask
                completed: false,
                createdAt: new Date().toISOString()
            }));

            setTasks(prev => [...newSubTasks, ...prev]);
        }
    };
    // ------------------------------

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>My Smart To-Do List</h1>

            {/* 4. Display Loading State or Error */}
            {loading && <p style={{ color: 'blue' }}>AI is thinking...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* 5. Update Input to support the Magic Button */}
            {/* We need to slightly modify TaskInput to support this, see below */}
            <TaskInput onAddTask={addTask} onMagicAdd={handleMagicAdd} isLoading={loading} />

            <div>
                {tasks.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
            </div>
        </div>
    );
}