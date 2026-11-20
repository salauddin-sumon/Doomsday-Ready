async function wouldCreateCycle(movieId, prerequisiteIds, Movie) {
  if (!movieId) return false;

  const allMovies = await Movie.find({}).select('prerequisites');
  const byId = new Map(allMovies.map(m => [m._id.toString(), m]));
  const target = movieId.toString();

  for (const startId of prerequisiteIds) {
    const stack = [startId.toString()];
    const seen = new Set();

    while (stack.length > 0) {
      const current = stack.pop();

      if (current === target) return true;
      if (seen.has(current)) continue;
      seen.add(current);

      const movie = byId.get(current);
      if (movie) {
        for (const p of movie.prerequisites) {
          stack.push(p.toString());
        }
      }
    }
  }

  return false;
}

async function getRewatchOrder(targetId, Movie) {
  const allMovies = await Movie.find({});
  const byId = new Map(allMovies.map(m => [m._id.toString(), m]));

  const target = byId.get(targetId.toString());
  if (!target) return null;

  const visited = new Set();
  const result = [];

  function dfs(id) {
    const key = id.toString();
    if (visited.has(key)) return;
    visited.add(key);
    if (key === targetId.toString()) return;

    const movie = byId.get(key);
    if (!movie) return;

    for (const p of movie.prerequisites) {
      dfs(p);
    }
    result.push(movie);
  }

  for (const p of target.prerequisites) {
    dfs(p);
  }

  const watchedCount = result.filter(m => m.watched).length;
  const unwatchedRuntime = result
    .filter(m => !m.watched)
    .reduce((sum, m) => sum + m.runtime, 0);

  return {
    order: result.map(m => ({
      id: m._id,
      title: m.title,
      releaseYear: m.releaseYear,
      runtime: m.runtime,
      watched: m.watched
    })),
    watchedCount,
    unwatchedRuntime
  };
}

module.exports = { wouldCreateCycle, getRewatchOrder };