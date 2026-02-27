import dotenv from 'dotenv';

// Load environment variables FIRST before importing anything else
dotenv.config();

// Now dynamically import the app so all env vars are loaded
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`✨ Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/v1/health`);
});
