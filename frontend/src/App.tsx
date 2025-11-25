import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PublishedClaimsPage from './pages/PublishedClaimsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/published" element={<PublishedClaimsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
