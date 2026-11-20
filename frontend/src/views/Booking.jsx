import { useEffect, useState } from 'react';
import api from '../api';

function Booking() {
  const [cinemas, setCinemas] = useState([]);
  const [cinemaId, setCinemaId] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/cinemas').then(res => setCinemas(res.data)).catch(() => setError('Could not load cinemas'));
  }, []);

  const getQuote = async () => {
    if (!cinemaId || !groupSize) return;
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/cinemas/${cinemaId}/booking`, {
        params: { groupSize: Number(groupSize) }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not get quote');
    }
  };

  return (
    <div>
      <h2>Booking</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <select value={cinemaId} onChange={e => setCinemaId(e.target.value)}>
          <option value="">Pick a cinema…</option>
          {cinemas.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input
          type="number"
          min="1"
          max="10000"
          placeholder="Group size"
          value={groupSize}
          onChange={e => setGroupSize(e.target.value)}
          style={{ width: '120px' }}
        />
        <button onClick={getQuote}>Get quote</button>
      </div>

      {result && (
        result.possible ? (
          <div>
            <p><strong>{result.totalBundles} bundles</strong></p>
            <table style={{ maxWidth: '360px' }}>
              <thead>
                <tr><th>Bundle size</th><th>How many</th></tr>
              </thead>
              <tbody>
                {result.bundles.map(b => (
                  <tr key={b.size}>
                    <td>{b.size} seats</td>
                    <td>× {b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Not possible — no exact combination for that group size.</p>
        )
      )}

      {cinemas.length === 0 && !error && <p>No cinemas yet. Add one through the API.</p>}
    </div>
  );
}

export default Booking;