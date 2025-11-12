import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

console.log('Testing Gemini API...');
console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
console.log('Using model:', GEMINI_MODEL);

try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  
  console.log('Sending test request to Gemini...');
  const prompt = 'Say hello in JSON format: {"message": "hello"}';
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  console.log('Success! Response:', text);
} catch (error) {
  console.error('Error:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}




