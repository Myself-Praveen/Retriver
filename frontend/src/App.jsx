import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

// Placeholder Home component for testing layout
const Home = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
    <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#c084fc] bg-[#aa3bff]/10 border border-[#aa3bff]/20 rounded-full">
      <span className="relative flex w-2 h-2">
        <span className="absolute inline-flex w-full h-full bg-[#c084fc] rounded-full opacity-75 animate-ping"></span>
        <span className="relative inline-flex w-2 h-2 bg-[#aa3bff] rounded-full"></span>
      </span>
      System Online
    </div>
    <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl max-w-2xl font-heading">
      The smart way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#aa3bff] to-[#c084fc]">find what you lost</span>.
    </h1>
    <p className="max-w-xl text-lg text-gray-400">
      Upload a photo. Let our Vision AI automatically identify the brand, color, and location. Get your items back instantly.
    </p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            {/* Future routes will go here: /search, /report, /profile */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
