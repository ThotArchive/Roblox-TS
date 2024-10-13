function escapeHtml() {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };

  return str => {
    return String(str).replace(/[&<>"'\\/]/g, s => {
      return entityMap[s];
    });
  };
}

export default escapeHtml;
