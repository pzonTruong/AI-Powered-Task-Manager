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

        // 1. Create the Parent Task ID upfront
        const parentId = Date.now();

        const newParent = {
            id: parentId,
            text: mainTaskText,
            completed: false,
            createdAt: new Date().toISOString(),
            isParent: true // Tag it as a parent
        };

        // 2. Add Parent to the list immediately
        setTasks(prev => [newParent, ...prev]);

        // 3. Call AI (Wait for it...)
        const subTasks = await generateSubtasks(mainTaskText);

        if (subTasks.length > 0) {
            const newSubTasks = subTasks.map((sub, index) => ({
                id: parentId + index + 1, // Unique ID based on parent
                text: sub,
                completed: false,
                isSubtask: true, // Tag as subtask
                createdAt: new Date().toISOString()
            }));

            // 4. INSERT CORRECTLY: Parent -> Subtasks -> Rest of list
            setTasks(prev => {
                // Find where the parent is (it should be at index 0, but let's be safe)
                const parentIndex = prev.findIndex(t => t.id === parentId);

                if (parentIndex === -1) return [...newSubTasks, ...prev]; // Fallback

                // Slice the array to insert in the middle
                const tasksBeforeAndParent = prev.slice(0, parentIndex + 1); // [Parent]
                const tasksAfter = prev.slice(parentIndex + 1);              // [Old Tasks...]

                return [...tasksBeforeAndParent, ...newSubTasks, ...tasksAfter];
            });
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