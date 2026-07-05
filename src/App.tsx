import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { seedData } from '@/services/mockData';
import LandingPage from '@/pages/LandingPage';
import UserApp from '@/pages/UserApp';
import AdminApp from '@/pages/admin/AdminApp';

function App() {
  useEffect(() => {
    try {
      seedData();
    } catch (e) {
      console.error('Error seeding data:', e);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/*" element={<UserApp />} />
        {/* Independent Admin Portal - completely isolated */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </div>
  );
}

export default App;
