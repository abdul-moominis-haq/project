// Simple test script to verify profile update API
const testProfileUpdate = async () => {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Farmer',
        location: 'Accra, Ghana',
        bio: 'Testing profile update functionality',
        farm_name: 'Test Farm',
        specialization: 'Mixed Farming'
      }),
    });

    const result = await response.json();
    console.log('Profile update result:', result);
    return result;
  } catch (error) {
    console.error('Profile update test failed:', error);
  }
};

// Run test when page loads
if (typeof window !== 'undefined') {
  window.testProfileUpdate = testProfileUpdate;
  console.log('Profile update test function available as window.testProfileUpdate()');
}
