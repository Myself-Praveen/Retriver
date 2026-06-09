import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Feed />} />
            {/* Future routes will go here: /report, /profile */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
