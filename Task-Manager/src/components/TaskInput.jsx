import { useState } from 'react';

export default function TaskInput({ onAddTask, onMagicAdd, isLoading }) {
    const [text, setText] = useState('');

    const handleNormalSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAddTask(text);
        setText('');
    };

    const handleMagicClick = (e) => {
        e.preventDefault(); // Prevent form submit
        if (!text.trim()) return;
        onMagicAdd(text); // Call the AI function
        setText('');
    };

    return (
        <form style={{ marginBottom: '20px', display: 'flex', gap: '5px' }}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a task..."
                disabled={isLoading}
                style={{ padding: '10px', flexGrow: 1 }}
            />

            {/* Normal Add */}
            <button onClick={handleNormalSubmit} disabled={isLoading} style={{ padding: '10px' }}>
                Add
            </button>

            {/* Magic AI Add */}
            <button
                onClick={handleMagicClick}
                disabled={isLoading}
                style={{ padding: '10px', background: '#646cff', color: 'white', border: 'none' }}
            >
                {isLoading ? '...' : '✨ Magic'}
            </button>
        </form>
    );
}