export const RANKS = [
  { name: 'Bronze', min: 0, color: 'text-orange-600 bg-orange-600/10 border-orange-600/20' },
  { name: 'Silver', min: 300, color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
  { name: 'Gold', min: 1000, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  { name: 'Platinum', min: 2500, color: 'text-cyan bg-cyan/10 border-cyan/20' },
  { name: 'Diamond', min: 5000, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { name: 'Crown', min: 10000, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { name: 'Elite Crown', min: 20000, color: 'text-red bg-red/10 border-red/20' }
];

export function getRank(points: number): { name: string, color: string } {
  // Sort ranks descending by min points
  const sortedRanks = [...RANKS].sort((a, b) => b.min - a.min);
  
  for (const rank of sortedRanks) {
    if (points >= rank.min) {
      return rank;
    }
  }
  
  return RANKS[0];
}

export function getPointsToNextRank(points: number): { nextRank: string | null, pointsNeeded: number, progress: number } {
  const currentRankName = getRank(points).name;
  const currentRankIndex = RANKS.findIndex(r => r.name === currentRankName);
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
