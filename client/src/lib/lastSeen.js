export default function getLastSeen(user) {
    if (user.isOnline) {
        return "Online";
    }
    
    const lastSeenDate = new Date(user.lastSeen);
    const diffSeconds = (Date.now() - lastSeenDate.getTime()) / 1000;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    let timeString = '';
    
    // Calculate relative time based on the difference in seconds
    if (diffSeconds < 60) {
        timeString = 'just now';
    } else if (diffSeconds < 3600) { // less than 1 hour
        const minutes = Math.round(diffSeconds / 60);
        timeString = rtf.format(-minutes, 'minute');
    } else if (diffSeconds < 86400) { // less than 1 day
        const hours = Math.round(diffSeconds / 3600);
        timeString = rtf.format(-hours, 'hour');
    } else if (diffSeconds < 604800) { // less than 7 days
        const days = Math.round(diffSeconds / 86400);
        timeString = rtf.format(-days, 'day');
    } else if (diffSeconds < 2628000) { // less than ~1 month
        const weeks = Math.round(diffSeconds / 604800);
        timeString = rtf.format(-weeks, 'week');
    } else if (diffSeconds < 31536000) { // less than ~1 year
        const months = Math.round(diffSeconds / 2628000);
        timeString = rtf.format(-months, 'month');
    } else {
        const years = Math.round(diffSeconds / 31536000);
        timeString = rtf.format(-years, 'year');
    }
    
    return `Last seen: ${timeString}`;
}