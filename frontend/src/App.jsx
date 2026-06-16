import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { ReportItem } from './pages/ReportItem';
import { Profile } from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Feed />} />
            <Route path="report" element={<ReportItem />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer 
        position="bottom-right" 
        theme="dark" 
        toastClassName="!bg-[#120e18] !border !border-white/10 !text-white !rounded-xl !shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      />
    </AuthProvider>
  );
}

export default App;
