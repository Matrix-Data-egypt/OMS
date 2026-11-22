import app from './index.js';

const PORT = Number(process.env.PORT) || 5002;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OMS Media Department API running on port ${PORT}`);
  console.log('🌟 Media Section | Developed by MDE – Matrix Data Egypt');
});
