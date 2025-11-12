import { validateTopic } from '../utils/validation.js';
import { fetchWikipediaData } from '../services/wikiService.js';
import { generateStudyContent } from '../services/aiService.js';

export const getStudyData = async (req, res, next) => {
  try {
    const { topic, mode = 'default' } = req.query;

    // Validate topic
    const validationError = validateTopic(topic);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      });
    }

    // Validate mode
    if (mode !== 'default' && mode !== 'math') {
      return res.status(400).json({
        success: false,
        error: 'Mode must be either "default" or "math"'
      });
    }

    // Fetch Wikipedia data
    let wikiData = '';
    try {
      wikiData = await fetchWikipediaData(topic);
    } catch (error) {
      console.error('Wikipedia fetch error:', error.message);
      // Continue with empty wikiData - AI service will handle it
    }

    // Generate study content using AI service
    const studyContent = await generateStudyContent(topic, wikiData, mode);

    res.json({
      success: true,
      data: studyContent
    });
  } catch (error) {
    next(error);
  }
};

