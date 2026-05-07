export const RANKS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 300 },
  { name: 'Gold', min: 1000 },
  { name: 'Platinum', min: 2500 },
  { name: 'Diamond', min: 5000 },
  { name: 'Crown', min: 10000 },
  { name: 'Elite Crown', min: 20000 }
];

export function getRank(points: number): string {
  // Sort ranks descending by min points
  const sortedRanks = [...RANKS].sort((a, b) => b.min - a.min);
  
  for (const rank of sortedRanks) {
    if (points >= rank.min) {
      return rank.name;
    }
  }
  
  return 'Bronze';
}

export function getPointsToNextRank(points: number): { nextRank: string | null, pointsNeeded: number, progress: number } {
  const currentRankIndex = RANKS.findIndex(r => r.name === getRank(points));
  const nextRank = RANKS[currentRankIndex + 1];
  
  if (!nextRank) {
    return { nextRank: null, pointsNeeded: 0, progress: 100 };
  }
  
  const currentRankMin = RANKS[currentRankIndex].min;
  const pointsInCurrentTier = points - currentRankMin;
  const totalTierPoints = nextRank.min - currentRankMin;
  const progress = Math.min(100, Math.max(0, (pointsInCurrentTier / totalTierPoints) * 100));
  
  return {
    nextRank: nextRank.name,
    pointsNeeded: nextRank.min - points,
    progress
  };
}
