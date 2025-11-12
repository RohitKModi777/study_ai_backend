import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI client only if API key is available
let genAI = null;
let model = null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'; // Default to gemini-2.0-flash if not set

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  console.log(`✅ Gemini AI initialized with model: ${GEMINI_MODEL}`);
}

// Mock data for fallback
const getMockData = (topic, mode) => {
  if (mode === 'math') {
    return {
      mathQuestion: {
        question: `Calculate the derivative of f(x) = x² + 3x + 2 with respect to x.`,
        answer: "f'(x) = 2x + 3",
        explanation: "To find the derivative, apply the power rule: d/dx(x²) = 2x, d/dx(3x) = 3, and d/dx(2) = 0. Therefore, f'(x) = 2x + 3."
      },
      studyTip: "Practice derivative rules regularly. Remember: the derivative of xⁿ is nxⁿ⁻¹, and constants have a derivative of zero.",
      mode: 'math'
    };
  }

  return {
    summary: [
      `${topic} is a fundamental concept that encompasses several key aspects.`,
      `Understanding ${topic} requires knowledge of its core principles and applications.`,
      `Mastery of ${topic} involves both theoretical understanding and practical application.`
    ],
    quiz: [
      {
        question: `What is a key characteristic of ${topic}?`,
        options: [
          'It is complex and multifaceted',
          'It is simple and straightforward',
          'It has no practical applications',
          'It is outdated'
        ],
        correctAnswer: 0
      },
      {
        question: `Which of the following best describes ${topic}?`,
        options: [
          'A theoretical concept',
          'A practical tool',
          'Both theoretical and practical',
          'Neither theoretical nor practical'
        ],
        correctAnswer: 2
      },
      {
        question: `Why is ${topic} important?`,
        options: [
          'It has limited relevance',
          'It is essential for understanding related concepts',
          'It is only important in specific contexts',
          'Its importance is debatable'
        ],
        correctAnswer: 1
      }
    ],
    studyTip: `To master ${topic}, break it down into smaller components, practice regularly, and apply it to real-world scenarios.`,
    mode: 'default'
  };
};

export const generateStudyContent = async (topic, wikiData, mode = 'default') => {
  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️ Gemini API key not found in environment, using mock data');
    return getMockData(topic, mode);
  }

  if (!model) {
    console.log('⚠️ Gemini model not initialized, using mock data');
    return getMockData(topic, mode);
  }

  console.log(`🚀 Generating study content for topic: "${topic}" in ${mode} mode using ${GEMINI_MODEL}`);

  try {
    if (mode === 'math') {
      return await generateMathContent(topic, wikiData);
    } else {
      return await generateDefaultContent(topic, wikiData);
    }
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    console.error('Error details:', error);
    console.log('⚠️ Falling back to mock data');
    return getMockData(topic, mode);
  }
};

const generateDefaultContent = async (topic, wikiData) => {
  const prompt = `You are an AI study assistant. Based on the following information about "${topic}", create a study guide.

${wikiData ? `Wikipedia Summary:\n${wikiData}\n\n` : ''}

Please provide:
1. A summary with exactly 3 bullet points (concise and informative)
2. Exactly 3 multiple-choice questions with 4 options each (label options as A, B, C, D)
3. One study tip (practical and actionable)

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.

Format your response as JSON:
{
  "summary": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "quiz": [
    {
      "question": "question text?",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0
    }
  ],
  "studyTip": "study tip text",
  "mode": "default"
}

Ensure correctAnswer is the index (0-3) of the correct option. Return ONLY the JSON object.`;

  let content = '';
  try {
    console.log('📤 Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    content = response.text();
    
    console.log('✅ Received response from Gemini API');
    console.log('Response length:', content.length, 'characters');
    
    // Extract JSON from response (handle cases where response includes markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }

    // Find JSON object in the response
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    const parsedResult = JSON.parse(jsonContent);
    console.log('✅ Successfully parsed Gemini response');
    return parsedResult;
  } catch (error) {
    console.error('❌ Error parsing Gemini response:', error.message);
    if (content) {
      console.error('Response content (first 500 chars):', content.substring(0, 500));
    }
    throw error;
  }
};

const generateMathContent = async (topic, wikiData) => {
  const prompt = `You are an AI study assistant specializing in mathematics. Based on the topic "${topic}", create a math study question.

${wikiData ? `Wikipedia Summary:\n${wikiData}\n\n` : ''}

Please provide:
1. One quantitative/mathematical question related to ${topic}
2. The answer to the question
3. A step-by-step explanation of how to solve it
4. One study tip specific to math learning

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.

Format your response as JSON:
{
  "mathQuestion": {
    "question": "quantitative question text",
    "answer": "the answer",
    "explanation": "step-by-step explanation"
  },
  "studyTip": "math-specific study tip",
  "mode": "math"
}

Return ONLY the JSON object.`;

  let content = '';
  try {
    console.log('📤 Sending math question request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    content = response.text();
    
    console.log('✅ Received response from Gemini API');
    console.log('Response length:', content.length, 'characters');
    
    // Extract JSON from response
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }

    // Find JSON object in the response
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    const parsedResult = JSON.parse(jsonContent);
    console.log('✅ Successfully parsed Gemini response');
    return parsedResult;
  } catch (error) {
    console.error('❌ Error parsing Gemini response:', error.message);
    if (content) {
      console.error('Response content (first 500 chars):', content.substring(0, 500));
    }
    throw error;
  }
};


