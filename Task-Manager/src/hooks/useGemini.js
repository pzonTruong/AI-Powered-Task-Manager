import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSubtasks = async (taskTitle) => {
    setLoading(true);
    setError(null);
    
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      // 2026 Standard Model
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        // If 2.5 fails, swap this string to "gemini-1.5-flash"
      });

      const prompt = `Act as a productivity assistant. 
      Task: "${taskTitle}". 
      Break this down into 3 simple, actionable sub-tasks. 
      Return ONLY the sub-tasks as a list. No intro.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const subtasks = text.split('\n')
        .map(line => line.replace(/^[\*\-]\s*/, '').trim())
        .filter(line => line.length > 0);

      return subtasks;

    } catch (err) {
      console.error("Gemini Error:", err);
      // Friendly error message for the UI
      setError("Model not found. Try swapping 'gemini-2.5-flash' to 'gemini-1.5-flash' in useGemini.js"); 
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { generateSubtasks, loading, error };
}