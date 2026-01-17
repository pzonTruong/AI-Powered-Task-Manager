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
        // Project chỉ cần 2.5-flash là ngon luôn
      });

      // prompt cho Gemini
      const prompt = `Act as a productivity assistant. 
      Task: "${taskTitle}". 
      Break this down into multiple simple, actionable sub-tasks (around 3 to 5 subtasks) with clear instruction between 30 words. 
      Return ONLY the sub-tasks as a list. No intro.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Xử lý chuỗi và biến thành sub task.
      const subtasks = text.split('\n')
        .map(line => line.replace(/^[\*\-]\s*/, '').trim())
        .filter(line => line.length > 0);

      return subtasks;

    } catch (err) {
      console.error("Gemini Error:", err);
      // Bắt lỗi
      setError("Sum Ting Wong"); 
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { generateSubtasks, loading, error };
}