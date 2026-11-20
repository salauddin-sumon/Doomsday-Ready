import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Movies from './views/Movies';
import RewatchPlan from './views/RewatchPlan';
import Booking from './views/Booking';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <div className="brand">Doomsday Ready</div>
        <nav className="nav">
          <NavLink to="/" end>Movies</NavLink>
          <NavLink to="/rewatch">Rewatch Plan</NavLink>
          <NavLink to="/booking">Booking</NavLink>
        </nav>
      </header>

      <main className="page">
      <p style={{ color: '#6b2d3a', marginTop: 0 }}>
         Catch up before Avengers: Doomsday — plan the rewatch, then grab opening-night seats.
      </p>
        <Routes>
          <Route path="/" element={<Movies />} />
          <Route path="/rewatch" element={<RewatchPlan />} />
          <Route path="/booking" element={<Booking />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;