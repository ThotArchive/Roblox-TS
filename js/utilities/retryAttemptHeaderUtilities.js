const getMetaData = () => {
  const metaTag = document.querySelector('meta[name="page-retry-header-enabled"]');

  return {
    retryAttemptHeaderEnabled: metaTag?.dataset?.retryAttemptHeaderEnabled === 'True'
  };
};

const metaData = getMetaData();

// Determines whether the request should allow addition of retry attempt header
const addRetryAttemptHeader = () => {
  return metaData.retryAttemptHeaderEnabled;
};

export default {
  addRetryAttemptHeader
};
