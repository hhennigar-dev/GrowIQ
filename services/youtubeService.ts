import { Video, PerformanceTier } from '../types';

const API_KEY = 'AIzaSyBZfTg06fuKvIv8nCBFBBCfKVvNjJxVif8';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const getApiQuota = () => {
  const current = localStorage.getItem('youtube_api_quota');
  return current ? parseInt(current) : 0;
};

export const consumeApiQuota = (cost: number) => {
  const current = getApiQuota();
  localStorage.setItem('youtube_api_quota', (current + cost).toString());
};

export const getChannelIdByHandle = async (handle: string): Promise<string | null> => {
  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  consumeApiQuota(100);
  try {
    const response = await fetch(`${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(cleanHandle)}&key=${API_KEY}`);
    const data = await response.json();
    return data.items?.[0]?.id?.channelId || null;
  } catch (error) {
    console.error('Error fetching channel ID:', error);
    return null;
  }
};

export const getChannelStats = async (channelId: string, accessToken?: string) => {
  consumeApiQuota(1);
  try {
    const headers: Record<string, string> = {
        Accept: 'application/json'
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${BASE_URL}/channels?part=statistics,contentDetails,snippet&id=${channelId}&key=${API_KEY}`, {
        headers
    });
    const data = await response.json();
    const channel = data.items?.[0];
    if (!channel) return null;
    
    return {
      uploadsPlaylistId: channel?.contentDetails?.relatedPlaylists?.uploads,
      totalViews: parseInt(channel?.statistics?.viewCount),
      videoCount: parseInt(channel?.statistics?.videoCount),
      subscriberCount: parseInt(channel?.statistics?.subscriberCount),
      title: channel?.snippet?.title,
      thumbnail: channel?.snippet?.thumbnails?.medium?.url,
      customUrl: channel?.snippet?.customUrl,
      id: channel?.id,
      isExact: !!accessToken
    };
  } catch (error) {
    console.error('Error fetching channel stats:', error);
    return null;
  }
};

export const getAllVideos = async (uploadsPlaylistId: string): Promise<Video[]> => {
  let allVideos: any[] = [];
  let nextPageToken = '';
  
  try {
    // 1. Fetch all items from the uploads playlist (handling pagination)
    do {
      consumeApiQuota(1);
      const response = await fetch(
        `${BASE_URL}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.items) {
        allVideos = [...allVideos, ...data.items];
      }
      nextPageToken = data.nextPageToken || '';
    } while (nextPageToken);

    if (allVideos.length === 0) return [];

    // 2. Fetch statistics for all videos (in chunks of 50)
    const videoDetails: any[] = [];
    for (let i = 0; i < allVideos.length; i += 50) {
      consumeApiQuota(1);
      const chunk = allVideos.slice(i, i + 50);
      const ids = chunk.map(v => v.contentDetails.videoId).join(',');
      const statsResponse = await fetch(`${BASE_URL}/videos?part=statistics,snippet,contentDetails&id=${ids}&key=${API_KEY}`);
      const statsData = await statsResponse.json();
      if (statsData.items) {
        videoDetails.push(...statsData.items);
      }
    }

    // 3. Calculate dynamic baseline (Average views across all videos)
    const totalViewsAcrossVideos = videoDetails.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || '0'), 0);
    const averageViews = totalViewsAcrossVideos / videoDetails.length;

    // 4. Map to our Video type with real outlier calculation
    return videoDetails.map((v: any): Video => {
      const views = parseInt(v.statistics.viewCount || '0');
      const outlierScore = parseFloat((views / averageViews).toFixed(2));
      
      let tier: PerformanceTier = 'Average';
      if (outlierScore >= 3) tier = 'Elite';
      else if (outlierScore >= 1.5) tier = 'Strong';
      else if (outlierScore < 0.6) tier = 'Weak';

      return {
        video_id: v.id,
        title: v.snippet.title,
        thumbnail_url: v.snippet.thumbnails.maxres?.url || v.snippet.thumbnails.high?.url,
        published_at: new Date(v.snippet.publishedAt).toLocaleDateString(),
        views: views,
        likes: parseInt(v.statistics.likeCount || '0'),
        comments_count: parseInt(v.statistics.commentCount || '0'),
        ctr: 0, // Not available via public API
        avg_view_duration: v.contentDetails.duration,
        outlier_score: outlierScore,
        performance_tier: tier
      };
    }).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  } catch (error) {
    console.error('Error fetching all videos:', error);
    return [];
  }
};

export const getLatestVideos = async (uploadsPlaylistId: string, limit = 5): Promise<Video[]> => {
  // Keeping this as a thin wrapper or redirecting to getAllVideos for simplicity
  const all = await getAllVideos(uploadsPlaylistId);
  return all.slice(0, limit);
};

export const getVideoDetails = async (url: string) => {
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
  if (!videoId) return null;

  consumeApiQuota(1);
  try {
    const response = await fetch(`${BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
    const data = await response.json();
    const v = data.items?.[0];
    if (!v) return null;

    return {
      title: v.snippet.title,
      thumbnail_url: v.snippet.thumbnails.maxres?.url || v.snippet.thumbnails.high?.url,
      views: parseInt(v.statistics.viewCount || '0'),
      videoId: v.id
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};

export const searchNicheOutliers = async (query: string, maxResults: number = 20): Promise<any[]> => {
  consumeApiQuota(100);
  try {
    const publishedAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const searchResponse = await fetch(
      `${BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&order=viewCount&publishedAfter=${publishedAfter}&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) return [];
    
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    consumeApiQuota(1);
    const statsResponse = await fetch(`${BASE_URL}/videos?part=statistics,snippet,contentDetails&id=${videoIds}&key=${API_KEY}`);
    const statsData = await statsResponse.json();
    
    if (!statsData.items) return [];

    const channelIds = Array.from(new Set(statsData.items.map((v: any) => v.snippet.channelId))).join(',');
    consumeApiQuota(1);
    const channelsResponse = await fetch(`${BASE_URL}/channels?part=snippet&id=${channelIds}&key=${API_KEY}`);
    const channelsData = await channelsResponse.json();
    
    const avatarMap: Record<string, string> = {};
    if (channelsData.items) {
        channelsData.items.forEach((c: any) => {
            avatarMap[c.id] = c.snippet.thumbnails?.default?.url || c.snippet.thumbnails?.medium?.url;
        });
    }

    let totalViews = 0;
    statsData.items.forEach((v: any) => {
        totalViews += parseInt(v.statistics.viewCount || '0');
    });
    const avgViews = totalViews / statsData.items.length || 10000;

    return statsData.items.map((v: any) => {
      const views = parseInt(v.statistics.viewCount || '0');
      const outlierScore = parseFloat((views / avgViews).toFixed(2));
      return {
        video_id: v.id,
        channel_name: v.snippet.channelTitle,
        channel_avatar: avatarMap[v.snippet.channelId] || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.snippet.channelTitle)}&background=random`,
        title: v.snippet.title,
        thumbnail_url: v.snippet.thumbnails.maxres?.url || v.snippet.thumbnails.high?.url,
        published_at: new Date(v.snippet.publishedAt).toLocaleDateString(),
        views: views,
        view_velocity_48h: Math.floor(views * 0.1),
        outlier_score: outlierScore,
        performance_tier: outlierScore >= 2.0 ? 'Elite' : (outlierScore >= 1.2 ? 'Strong' : 'Average'),
        niche: query
      };
    }).sort((a: any, b: any) => b.outlier_score - a.outlier_score);

  } catch (error) {
    console.error('Error fetching niche outliers:', error);
    return [];
  }
};
