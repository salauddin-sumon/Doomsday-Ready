function getBookingQuote(bundleSizes, groupSize) {
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 10000) {
    return null;
  }

  const sizes = [...new Set(bundleSizes)].sort((a, b) => a - b);

  const dp = new Array(groupSize + 1).fill(Infinity);
  dp[0] = 0;

  for (let seats = 1; seats <= groupSize; seats++) {
    for (const size of sizes) {
      if (seats >= size && dp[seats - size] !== Infinity) {
        dp[seats] = Math.min(dp[seats], dp[seats - size] + 1);
      }
    }
  }

  if (dp[groupSize] === Infinity) {
    return null;
  }

  const counts = new Map(sizes.map(s => [s, 0]));
  let remaining = groupSize;

  while (remaining > 0) {
    const chosen = sizes.find(size =>
      remaining >= size &&
      dp[remaining] === dp[remaining - size] + 1
    );
    counts.set(chosen, counts.get(chosen) + 1);
    remaining -= chosen;
  }

  const bundles = sizes
    .filter(size => counts.get(size) > 0)
    .map(size => ({ size, count: counts.get(size) }));

  return {
    totalBundles: dp[groupSize],
    bundles
  };
}

module.exports = { getBookingQuote };