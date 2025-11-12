import axios from 'axios';

export const fetchWikipediaData = async (topic) => {
  try {
    const encodedTopic = encodeURIComponent(topic);
    const url = `https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_?=${encodedTopic}`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AI Study Assistant/1.0'
      }
    });

    if (response.data.extract) {
      return response.data.extract;
    }

    throw new Error('No content found for this topic');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Topic "${topic}" not found on Wikipedia`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Wikipedia API request timed out');
    }
    throw new Error(`Failed to fetch Wikipedia data: ${error.message}`);
  }
};

