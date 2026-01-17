import { useState, useEffect } from 'react';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import { useGemini } from '../hooks/useGemini';

// 1. IMPORT DND COMPONENTS
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function Dashboard() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('my-tasks');
        return saved ? JSON.parse(saved) : [];
    });

    const { generateSubtasks, loading, error } = useGemini();

    // 2. SETUP SENSORS (Detects mouse vs touch)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Requires 5px move to start (prevents accidental clicks)
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
            // 1. Create a deep copy so we can edit freely
            let updatedTasks = prevTasks.map(task => ({ ...task }));

            const clickedTask = updatedTasks.find(t => t.id === id);
            if (!clickedTask) return prevTasks;

            // 2. Determine the new status
            const newStatus = !clickedTask.completed;
            clickedTask.completed = newStatus;

            // 3. CASCADE DOWN (If Parent clicked -> Sync Children)
            if (clickedTask.isParent) {
                updatedTasks.forEach(t => {
                    if (t.parentId === clickedTask.id) {
                        t.completed = newStatus;
                    }
                });
            }

            // 4. BUBBLE UP (Check ALL Parents for consistency)
            // We loop through every parent to ensure their status matches their children
            updatedTasks.forEach(parent => {
                if (parent.isParent) {
                    // Find children for this parent
                    const children = updatedTasks.filter(t => t.parentId === parent.id);

                    if (children.length > 0) {
                        // Rule: Parent is complete ONLY if ALL children are complete
                        const allChildrenDone = children.every(c => c.completed);
                        parent.completed = allChildrenDone;
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

    // 3. HANDLE DRAG END (Reorder the array)
    const handleDragEnd = (event) => {
        const { active, over } = event;

        // If dropped outside or on itself, do nothing
        if (!over || active.id === over.id) return;

        setTasks((items) => {
            const activeTask = items.find(t => t.id === active.id);

            // 1. If moving a SUBTASK, just do the standard move (simple)
            if (activeTask.isSubtask) {
                const oldIndex = items.findIndex((t) => t.id === active.id);
                const newIndex = items.findIndex((t) => t.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            }

            // 2. If moving a PARENT, we must move the WHOLE FAMILY (Parent + Children)
            //    AND ensure we don't land inside another family.

            // A. Identify the Family to move
            const familyIds = [activeTask.id, ...items.filter(t => t.parentId === activeTask.id).map(t => t.id)];

            // B. Create a "Clean List" (without the moving family)
            const cleanList = items.filter(t => !familyIds.includes(t.id));

            // C. Find where the user TRIED to drop it.
            // We look for the "over" task in the clean list to find the insertion point.
            let insertIndex = cleanList.findIndex(t => t.id === over.id);

            // If "over" task isn't in clean list (maybe we dragged over our own child?), default to end
            if (insertIndex === -1) insertIndex = cleanList.length;

            // --- THE FIX: SAFETY CHECK ---
            // We look at the neighbor ABOVE our insertion point.
            // If the neighbor is a Subtask, or a Parent with children, we are "interrupting" a group.
            // We must keep bumping our index down until we hit a "safe" spot (Start of a new Parent or End of list).

            while (insertIndex < cleanList.length) {
                const neighborAbove = cleanList[insertIndex]; // The item currently occupying the spot

                // If the spot is taken by a Subtask, we can't start a new Parent here. 
                // We must go after it.
                if (neighborAbove && neighborAbove.isSubtask) {
                    insertIndex++;
                    continue;
                }

                // If the spot is a Parent, but it belongs to the PREVIOUS group (we are splitting parent/child),
                // we normally insert BEFORE. But dnd-kit index logic can be tricky.
                // Let's stick to the "Subtask" check primarily. 
                // If we land on a Subtask, push down.

                // Wait, looking at the neighbor *above* (index-1) is safer logic.
                const prevItem = cleanList[insertIndex - 1];

                if (prevItem && prevItem.isSubtask) {
                    // We are sitting right after a subtask. This is usually SAFE (end of group).
                    // UNLESS... wait, actually sitting after a subtask is the SAFEST place.
                    // The danger is sitting after a PARENT that has children.

                    // Let's reverse the check:
                    // If we are inserting AFTER a Parent, and that Parent has children in the clean list...
                    // We must skip over those children.
                    break; // Actually, if prev is subtask, we are likely fine.
                }

                if (prevItem && prevItem.isParent) {
                    // We are inserting directly under a Parent.
                    // Does this parent have children in the clean list?
                    const hasChildren = cleanList.some(t => t.parentId === prevItem.id);
                    if (hasChildren) {
                        // DANGER: We are splitting Parent from Children.
                        // Push insertIndex down by 1 to let the child stay with parent.
                        insertIndex++;
                        continue;
                    }
                }

                // If we pass checks, we are safe.
                break;
            }

            // D. Reconstruct the list
            const itemsBefore = cleanList.slice(0, insertIndex);
            const itemsAfter = cleanList.slice(insertIndex);

            // Get the actual task objects for the moving family
            const movingFamily = [activeTask, ...items.filter(t => t.parentId === activeTask.id)];

            return [...itemsBefore, ...movingFamily, ...itemsAfter];
        });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Smart Project Manager</h1>

            {loading && <p style={{ color: '#646cff' }}>✨ AI is thinking...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <TaskInput onAddTask={addTask} onMagicAdd={handleMagicAdd} isLoading={loading} />

            {/* 4. WRAP LIST IN DND CONTEXT */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
                    <div>
                        {tasks.map(task => (
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
        </div>
    );
}