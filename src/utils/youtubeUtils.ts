/**
 * YouTube Utility Functions
 * Extract thumbnail URLs from YouTube video URLs
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if the URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  const youtubePatterns = [
    /youtube\.com/,
    /youtu\.be/,
  ];

  return youtubePatterns.some(pattern => pattern.test(url));
}

/**
 * Get YouTube thumbnail URL from video ID
 * Quality options: default, mqdefault, hqdefault, sddefault, maxresdefault
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'maxresdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Get YouTube embed URL from video ID or full URL
 */
export function getYouTubeEmbedUrl(videoIdOrUrl: string): string {
  // Check if it's already an embed URL
  if (videoIdOrUrl.includes('youtube.com/embed/')) {
    return videoIdOrUrl;
  }

  // Try to extract video ID
  const videoId = extractYouTubeId(videoIdOrUrl);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // If no video ID found, return as is
  return videoIdOrUrl;
}

/**
 * Automatically get thumbnail from YouTube URL
 * Returns the thumbnail URL if successful, otherwise returns the provided fallback
 */
export function autoGetYouTubeThumbnail(url: string, fallback?: string): string | undefined {
  if (!isYouTubeUrl(url)) {
    return fallback;
  }

  const videoId = extractYouTubeId(url);
  if (videoId) {
    return getYouTubeThumbnail(videoId);
  }

  return fallback;
}

/**
 * Validate YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
  const videoId = extractYouTubeId(url);
  return videoId !== null && videoId.length === 11;
}

