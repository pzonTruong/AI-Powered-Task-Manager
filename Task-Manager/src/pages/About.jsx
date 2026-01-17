import { useTheme } from '../context/ThemeContext';

export default function About() {
  const { isDarkMode } = useTheme();

  const containerStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: '1.6'
  };

  const codeBlockStyle = {
    background: isDarkMode ? '#333' : '#f4f4f4',
    padding: '15px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    overflowX: 'auto'
  };

  return (
    <div style={containerStyle}>
      <h1>ℹ️ About This Project</h1>
      <p>
        This Smart To-Do App was built to demonstrate advanced React patterns, 
        including <strong>Custom Hooks</strong>, <strong>Context API</strong>, and <strong>AI Integration</strong>.
      </p>

      <h2>Conceptual Comparison (Lessons 12 & 13)</h2>
      <p>
        While this app is built in React, here is how the core "Counter" logic 
        would differ in other modern frameworks:
      </p>

      {/* REACT SECTION */}
      <h3>1. React (Current Approach)</h3>
      <p>React uses <strong>Hooks</strong> (`useState`) to track changes. The UI re-renders when state updates.</p>
      <div style={codeBlockStyle}>
        {`const [count, setCount] = useState(0);
// Update: setCount(count + 1)`}
      </div>

      {/* VUE SECTION */}
      <h3>2. Vue.js Concept</h3>
      <p>
        Vue uses a "Mutable" reactivity model with <strong>Refs</strong>. 
        We can modify values directly, and the UI updates automatically.
      </p>
      <div style={codeBlockStyle}>
        {`import { ref } from 'vue';
const count = ref(0);
// Update: count.value++ (Direct mutation)`}
      </div>

      {/* ANGULAR SECTION */}
      <h3>3. Angular Concept</h3>
      <p>
        Modern Angular uses <strong>Signals</strong> for fine-grained reactivity. 
        Unlike React, it doesn't need to re-render the whole component tree.
      </p>
      <div style={codeBlockStyle}>
        {`count = signal(0);
// Update: count.set(count() + 1)`}
      </div>

      <hr style={{ margin: '30px 0', borderColor: isDarkMode ? '#444' : '#ddd' }} />
      
      <p><em>Built by [Your Name] for the Final React Capstone.</em></p>
    </div>
  );
}