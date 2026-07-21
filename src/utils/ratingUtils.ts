export const calculateSeriesRating = (totalViews: number, totalLikes: number): number => {
  if (!totalViews || totalViews < 20) return 0.0; // Require at least 20 views to have a rating
  
  const baseRatio = (totalLikes / totalViews) * 100;
  const popularityBonus = Math.log10(totalLikes + 1) * 0.2; 
  
  let rating = (baseRatio * 0.35) + popularityBonus; 
  
  if (rating > 5) rating = 5.0;
  if (rating < 1) rating = 1.0;
  
  return parseFloat(rating.toFixed(1));
};

export const calculateMangakaLevel = (totalViews: number, totalLikes: number, totalSeries: number): number => {
  const totalExp = (totalSeries * 500) + totalViews + (totalLikes * 10);
  let level = Math.floor(Math.sqrt(totalExp / 200)) + 1;
  
  if (level > 99) level = 99; // Max level
  
  return level;
};

export const calculateMangakaAverageRating = (seriesList: any[]): number => {
  if (!seriesList || seriesList.length === 0) return 0.0;
  
  let totalRating = 0;
  let ratedCount = 0;
  
  seriesList.forEach(series => {
    const views = series.viewCount || series.view_count || series.totalViews || 0;
    const likes = series.likeCount || series.total_likes || series.totalLikes || series.likes || 0;
    const rating = calculateSeriesRating(views, likes);
    
    if (rating > 0) {
      totalRating += rating;
      ratedCount++;
    }
  });
  
  if (ratedCount === 0) return 0.0;
  return parseFloat((totalRating / ratedCount).toFixed(1));
};
