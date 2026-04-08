export function getTimeAgo(date: string | Date | undefined | null) {
  if (!date) return 'N/A';
  
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  if (diffInMins < 1) return 'JUST NOW';
  if (diffInMins < 60) return `${diffInMins}M AGO`;
  
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}H AGO`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}D AGO`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}MO AGO`;
}
