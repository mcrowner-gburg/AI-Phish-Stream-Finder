import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

interface YouTubeSearchResult {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
}

function parseDuration(iso: string): { formatted: string; seconds: number } {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { formatted: "0:00", seconds: 0 };
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  const totalSeconds = h * 3600 + m * 60 + s;
  if (h > 0) {
    return { formatted: `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`, seconds: totalSeconds };
  }
  return { formatted: `${m}:${String(s).padStart(2, "0")}`, seconds: totalSeconds };
}

function formatViewCount(count: string): string {
  const n = parseInt(count);
  if (isNaN(n)) return count;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return count;
}

function buildDurationFilter(lengthFilter: string): string | undefined {
  switch (lengthFilter) {
    case "Under 5 min":
      return "short";
    case "5-10 min":
      return "medium";
    case "10-20 min":
      return "medium";
    case "20+ min":
      return "long";
    default:
      return undefined;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/search", async (req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "YouTube API key not configured" });
      }

      const query = (req.query.q as string) || "";
      const year = req.query.year as string;
      const song = req.query.song as string;
      const lengthFilter = req.query.length as string;
      const pageToken = req.query.pageToken as string;
      const maxResults = parseInt(req.query.maxResults as string) || 5;

      let searchTerms = "phish live";
      if (query) searchTerms += ` ${query}`;
      if (song && song !== "All Songs") searchTerms += ` "${song}"`;

      let publishedAfter: string | undefined;
      let publishedBefore: string | undefined;
      if (year && year !== "All Years") {
        publishedAfter = `${year}-01-01T00:00:00Z`;
        publishedBefore = `${year}-12-31T23:59:59Z`;
      }

      const videoDuration = buildDurationFilter(lengthFilter);

      const searchParams = new URLSearchParams({
        part: "snippet",
        q: searchTerms,
        type: "video",
        maxResults: String(maxResults),
        key: apiKey,
        order: "relevance",
      });

      if (publishedAfter) searchParams.set("publishedAfter", publishedAfter);
      if (publishedBefore) searchParams.set("publishedBefore", publishedBefore);
      if (videoDuration) searchParams.set("videoDuration", videoDuration);
      if (pageToken) searchParams.set("pageToken", pageToken);

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (!searchRes.ok) {
        console.error("YouTube API error:", searchData);
        return res.status(searchRes.status).json({ message: searchData.error?.message || "YouTube API error" });
      }

      const videoIds = (searchData.items || [])
        .map((item: any) => item.id?.videoId)
        .filter(Boolean)
        .join(",");

      if (!videoIds) {
        return res.json({ videos: [], nextPageToken: null, totalResults: 0 });
      }

      const detailsParams = new URLSearchParams({
        part: "contentDetails,statistics",
        id: videoIds,
        key: apiKey,
      });

      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      const detailsMap = new Map<string, any>();
      for (const item of detailsData.items || []) {
        detailsMap.set(item.id, item);
      }

      let videos: YouTubeSearchResult[] = (searchData.items || [])
        .filter((item: any) => item.id?.videoId)
        .map((item: any) => {
          const details = detailsMap.get(item.id.videoId);
          const { formatted, seconds } = parseDuration(details?.contentDetails?.duration || "PT0S");
          return {
            id: item.id.videoId,
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            duration: formatted,
            durationSeconds: seconds,
            viewCount: formatViewCount(details?.statistics?.viewCount || "0"),
          };
        });

      if (lengthFilter === "Under 5 min") {
        videos = videos.filter((v: any) => v.durationSeconds > 0 && v.durationSeconds < 300);
      } else if (lengthFilter === "5-10 min") {
        videos = videos.filter((v: any) => v.durationSeconds >= 300 && v.durationSeconds <= 600);
      } else if (lengthFilter === "10-20 min") {
        videos = videos.filter((v: any) => v.durationSeconds >= 600 && v.durationSeconds <= 1200);
      } else if (lengthFilter === "20+ min") {
        videos = videos.filter((v: any) => v.durationSeconds >= 1200);
      }

      return res.json({
        videos,
        nextPageToken: searchData.nextPageToken || null,
        totalResults: searchData.pageInfo?.totalResults || 0,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      return res.status(500).json({ message: "Failed to search YouTube" });
    }
  });

  return httpServer;
}
