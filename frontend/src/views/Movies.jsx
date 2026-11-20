import { Fragment, useEffect, useState } from 'react';
import api from '../api';

function createsCycle(candidateId, targetId, movies) {
  const byId = new Map(movies.map(m => [m._id, m]));
  const stack = [candidateId];
  const seen = new Set();

  while (stack.length > 0) {
    const id = stack.pop();
    if (id === targetId) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    const movie = byId.get(id);
    if (movie) {
      for (const p of movie.prerequisites || []) {
        stack.push(typeof p === 'string' ? p : p._id);
      }
    }
  }

  return false;
}

function Movies() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ title: '', releaseYear: '', runtime: '', prerequisites: [] });
  const [editingId, setEditingId] = useState(null);
  const [editPrereqs, setEditPrereqs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/movies');
      setMovies(res.data);
    } catch {
      setError('Could not load movies');
    }
  };

  useEffect(() => {
    let active = true;
    api.get('/movies')
      .then(res => { if (active) setMovies(res.data); })
      .catch(() => { if (active) setError('Could not load movies'); });
    return () => { active = false; };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/movies', {
        title: form.title,
        releaseYear: Number(form.releaseYear),
        runtime: Number(form.runtime),
        prerequisites: form.prerequisites
      });
      setForm({ title: '', releaseYear: '', runtime: '', prerequisites: [] });
      setSuccess('Movie added');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add movie');
    }
  };

  const toggleWatched = async (movie) => {
    setError('');
    try {
      await api.patch(`/movies/${movie._id}`, { watched: !movie.watched });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update movie');
    }
  };

  const startEdit = (movie) => {
    setEditingId(movie._id);
    setEditPrereqs((movie.prerequisites || []).map(p => typeof p === 'string' ? p : p._id));
    setError('');
    setSuccess('');
  };

  const togglePrereq = (id) => {
    setEditPrereqs(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleFormPrereq = (id) => {
    setForm(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.includes(id)
        ? prev.prerequisites.filter(x => x !== id)
        : [...prev.prerequisites, id]
    }));
  };

  const savePrereqs = async () => {
    try {
      await api.patch(`/movies/${editingId}`, { prerequisites: editPrereqs });
      setEditingId(null);
      setSuccess('Prerequisites updated');
      load();
    } catch (err) {
      const code = err.response?.data?.error;
      setError(code === 'CIRCULAR_DEPENDENCY'
        ? 'That would create a loop: this movie is already in that movie’s watch chain. Greyed-out options are blocked for this reason.'
        : code || 'Could not update prerequisites');
    }
  };

  return (
    <div>
      <h2>Movies</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleAdd} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
        <h3>Add a movie</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input placeholder="Title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input type="number" placeholder="Release year" value={form.releaseYear}
            onChange={e => setForm({ ...form, releaseYear: e.target.value })} required />
          <input type="number" placeholder="Runtime (min)" min="1" max="300" value={form.runtime}
            onChange={e => setForm({ ...form, runtime: e.target.value })} required />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <strong>Watch these first:</strong>
          {movies.map(m => (
            <label key={m._id} style={{ display: 'block' }}>
              <input type="checkbox"
                checked={form.prerequisites.includes(m._id)}
                onChange={() => toggleFormPrereq(m._id)} />
              {m.title}
            </label>
          ))}
        </div>
        <button type="submit" style={{ marginTop: '0.5rem' }}>Add movie</button>
      </form>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Title</th>
            <th>Year</th>
            <th>Runtime</th>
            <th style={{ textAlign: 'left' }}>Prerequisites</th>
            <th>Watched</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {movies.map(m => (
            <Fragment key={m._id}>
              <tr>
                <td>{m.title}</td>
                <td>{m.releaseYear}</td>
                <td>{m.runtime} min</td>
                <td>{(m.prerequisites || []).map(p => typeof p === 'string' ? p : p.title).join(', ') || '—'}</td>
                <td>
                  <input type="checkbox" checked={m.watched}
                    onChange={() => toggleWatched(m)} />
                </td>
                <td>
                  <button onClick={() => startEdit(m)}>Edit prerequisites</button>
                </td>
              </tr>
              {editingId === m._id && (
                <tr>
                  <td colSpan="6" style={{ background: '#faf4fb', padding: '0.8rem' }}>
                    <strong>Watch these first:</strong>
                    <p style={{ margin: '0.3rem 0 0.5rem', fontSize: '0.85rem', color: '#6b2d3a' }}>
                      Greyed-out movies already depend on “{m.title}”, so picking them would make a loop.
                    </p>
                    {movies.filter(other => other._id !== m._id).map(other => {
                      const blocked = createsCycle(other._id, m._id, movies);
                      return (
                        <label key={other._id} style={{ display: 'block', color: blocked ? '#999' : 'inherit' }}>
                          <input type="checkbox" disabled={blocked}
                            checked={editPrereqs.includes(other._id)}
                            onChange={() => togglePrereq(other._id)} />
                          {other.title}{blocked && ' — would create a loop'}
                        </label>
                      );
                    })}
                    <div style={{ marginTop: '0.5rem' }}>
                      <button onClick={savePrereqs}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Movies;