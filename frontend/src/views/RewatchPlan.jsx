import { useEffect, useState } from 'react';
import api from '../api';

function RewatchPlan() {
  const [movies, setMovies] = useState([]);
  const [targetId, setTargetId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/movies').then(res => setMovies(res.data)).catch(() => setError('Could not load movies'));
  }, []);

  const buildPlan = async () => {
    if (!targetId) return;
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/movies/${targetId}/rewatch-order`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not build plan');
    }
  };

  const total = result ? result.order.length : 0;
  const percent = total > 0 ? Math.round((result.watchedCount / total) * 100) : 0;

  return (
    <div>
      <h2>Rewatch Plan</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <select value={targetId} onChange={e => setTargetId(e.target.value)}>
          <option value="">Pick a movie…</option>
          {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
        <button onClick={buildPlan}>Build plan</button>
      </div>

      {result && (
        <>
          <p style={{ marginBottom: '0.3rem' }}>
            <strong>{result.watchedCount} of {total} watched</strong>
            {' · '}remaining watch time: <strong>{result.unwatchedRuntime} min</strong>
          </p>

          <div style={{ background: '#e3dfd8', height: '8px', borderRadius: '3px', marginBottom: '1rem' }}>
            <div style={{ background: '#b4482f', height: '100%', width: `${percent}%`, borderRadius: '3px' }} />
          </div>

          {result.order.length === 0 ? (
            <p>Nothing to watch first.</p>
          ) : (
            <ol style={{ paddingLeft: '1.5rem' }}>
              {result.order.map(m => (
                <li key={m.id} style={{ marginBottom: '0.25rem' }}>
                  {m.watched ? <s style={{ color: '#7a756e' }}>{m.title}</s> : m.title}
                  {' '}<span style={{ color: '#7a756e', fontSize: '0.85rem' }}>({m.runtime} min{m.watched ? ', watched' : ''})</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}

export default RewatchPlan;