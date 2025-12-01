
import { GoogleGenAI } from "@google/genai";
import { User, Task } from '../types';

let ai: GoogleGenAI | null = null;

// Initialize strictly with process.env.API_KEY as requested
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

interface AIContext {
  user: User;
  tasks: Task[];
  pageContext?: string;
  selectedEmployee?: User | null;
}

export const generateAIResponse = async (
  prompt: string, 
  context: AIContext
): Promise<string> => {
  if (!ai) {
    return "AI Assistant is currently offline (Missing API Key).";
  }

  try {
    let contextPrompt = `
      You are an intelligent enterprise assistant for 'EmployeeFlow'.
      
      Current User:
      - Name: ${context.user.username}
      - Role: ${context.user.role}
      - Department: ${context.user.department || 'N/A'}
      
      Pending Tasks: ${context.tasks.filter(t => t.status !== 'DONE').map(t => t.title).join(', ')}
    `;

    // Dynamic Context Injection
    if (context.pageContext === 'EMPLOYEE_PROFILE' && context.selectedEmployee) {
       const emp = context.selectedEmployee;
       contextPrompt += `
         
         CURRENTLY VIEWING PROFILE OF:
         - Name: ${emp.username}
         - Role: ${emp.role}
         - Department: ${emp.department}
         - Job Title: ${emp.jobTitle || 'N/A'}
         - Email: ${emp.email}
         - Status: ${emp.isOnline ? 'Online' : 'Offline'}
         - Salary: ${emp.salary ? '$' + emp.salary : 'Confidential'}
         
         If the user asks about this employee, provide insights based on this data.
         You can suggest performance plans, summarize their profile, or predict attendance issues based on general patterns (mock these predictions professionally).
       `;
    } else if (context.pageContext === 'DASHBOARD') {
       contextPrompt += `\nYou are on the Dashboard. Provide high-level summaries and productivity tips.`;
    }

    const systemPrompt = `
      ${contextPrompt}
      
      Provide helpful, professional, and concise advice.
      If asked for a summary, performance plan, or prediction, generate a realistic and professional response based on the provided context.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are a helpful office assistant. Keep responses professional and concise.",
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("AI Error:", error);
    return "I encountered an error processing your request.";
  }
};
