export const getCategoryStyle = (category) => {
  const styles = {
    Health: { backgroundColor: '#dcfce7', color: '#059669' },
    Career: { backgroundColor: '#fef9c3', color: '#ca8a04' },
    Education: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
    Personal: { backgroundColor: '#fce7f3', color: '#db2777' },
    Finance: { backgroundColor: '#dbeafe', color: '#2563eb' },
    Hobby: { backgroundColor: '#f3e8ff', color: '#9333ea' },
    Relationships: { backgroundColor: '#ffedd5', color: '#ea580c' },
  };
  return styles[category] || { backgroundColor: '#dbeafe', color: '#3b82f6' };
};

export const getStatusStyle = (status) => {
  const styles = {
    done: { backgroundColor: '#dcfce7', color: '#15803d' },
    progress: { backgroundColor: '#dbeafe', color: '#2563eb' },
    pending: { backgroundColor: '#f3f4f6', color: '#6b7280' },
    failed: { backgroundColor: '#fee2e2', color: '#dc2626' },
  };
  return styles[status] || { backgroundColor: '#f3f4f6', color: '#6b7280' };
};

export const getStatusText = (status) => {
  const texts = {
    done: 'Completed',
    progress: 'In Progress',
    pending: 'Pending',
    failed: 'Failed',
  };
  return texts[status] || status;
}; 