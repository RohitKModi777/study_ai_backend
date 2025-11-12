export const validateTopic = (topic) => {
  if (!topic) {
    return 'Topic parameter is required';
  }

  if (typeof topic !== 'string') {
    return 'Topic must be a string';
  }

  const trimmedTopic = topic.trim();

  if (trimmedTopic.length === 0) {
    return 'Topic cannot be empty';
  }

  if (trimmedTopic.length > 200) {
    return 'Topic must be 200 characters or less';
  }

  return null;
};

