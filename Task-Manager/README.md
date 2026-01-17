# Smart AI Task Manager

A sophisticated task management application built with React, Vite, and Google Gemini AI. This project demonstrates advanced frontend architecture, implementing features such as AI-powered task decomposition, hierarchical state management, and strict type handling in a modern JavaScript environment.

## Project Overview

This application serves as a technical demonstration of integrating Large Language Models (LLMs) into productivity tools. It extends standard CRUD functionality with intelligent task breakdowns, recursive state synchronization, and a complex drag-and-drop interface.

## Technical Stack

### Core Framework & Build Tooling
* **React (v18+):** Functional component architecture utilizing Hooks for state and side-effect management.
* **Vite:** Utilized for optimized development server performance and efficient production bundling.
* **JavaScript (ES6+):** Modern syntax including async/await, restructuring, and modules.

### State Management & Logic
* **Context API:** Implements a global provider pattern for application-wide theme state.
* **Custom Hooks:** Encapsulates API interactions (`useGemini`) and persistence logic to separate concerns from UI components.
* **LocalStorage API:** Manages client-side data persistence with automatic hydration on application load.

### Libraries & Dependencies
* **@dnd-kit/core & @dnd-kit/sortable:** Provides the primitives for the drag-and-drop interface, handling collision detection, sensors, and sorting strategies.
* **@google/generative-ai:** The official SDK for interfacing with the Gemini 2.5 Flash model.
* **React Router DOM (v6):** Handles client-side routing and dynamic URL parameter extraction.

## Key Features

### 1. AI-Powered Task Decomposition
The application leverages the Google Gemini API to programmatically analyze high-level tasks. When triggered, the system asynchronously requests a breakdown of the parent task into actionable subtasks, which are then parsed and injected into the local state graph.
* **Code Reference:** `src/hooks/useGemini.js`

### 2. Hierarchical State Synchronization
The application maintains strict consistency between Parent and Child tasks through recursive logic:
* **Cascading Updates (Parent to Child):** Toggling a parent task triggers an immediate update to all associated child tasks, ensuring they inherit the parent's completion status.
* **Bubbling Consistency (Child to Parent):** The system monitors child tasks; if a single child is unmarked, the parent is automatically marked incomplete. Conversely, if all children are completed, the parent status automatically updates to complete.
* **Cascading Deletes:** Deletion of a parent node results in the immediate removal of all child nodes from the dataset.

### 3. Intelligent Drag-and-Drop
Implements complex reordering logic using `@dnd-kit`.
* **Smart Grouping:** Moving a parent task automatically identifies and relocates all associated subtasks to the new position, maintaining the logical group structure.
* **Collision Handling:** The system includes safety checks to prevent users from dropping a parent task inside the subtask list of another parent, automatically correcting the insertion index to the nearest valid position.

### 4. Inline Interaction
* **Keyboard Navigation:** Supports `Enter` to save and `Escape` to cancel during edit modes.
* **Auto-Edit:** Creating a blank subtask automatically triggers edit mode for immediate input.
* **Blank Task Handling:** The system automatically cleans up (deletes) tasks that are saved with empty content to maintain data integrity.

## Architecture

* **`main.jsx`**: Application entry point; initializes the Theme Provider.
* **`Dashboard.jsx`**: The primary controller. It manages the central `tasks` state array and contains the logic for CRUD operations, recursion, and drag-and-drop event handling.
* **`TaskItem.jsx`**: A presentational component that handles individual node rendering, indentation logic based on task type, and local edit state.
* **`TaskDetail.jsx`**: A dynamic route component that fetches and displays extended metadata (ID, timestamps) for a specific task entity.

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/smart-todo-app.git](https://github.com/your-username/smart-todo-app.git)
    cd smart-todo-app
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the project root to configure the API client:
    ```env
    VITE_GEMINI_API_KEY=your_google_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Deployment

This project is optimized for deployment on static hosting platforms such as Vercel or Netlify. Ensure the `VITE_GEMINI_API_KEY` environment variable is correctly configured in the hosting provider's settings panel.