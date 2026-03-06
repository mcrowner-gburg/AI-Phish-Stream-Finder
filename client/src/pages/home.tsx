import { useState } from "react";
import { Search, Play, X, Filter, Music, Calendar, Clock, ChevronDown, Loader2 } from "lucide-react";

interface Video {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
}

interface SearchResponse {
  videos: Video[];
  nextPageToken: string | null;
  totalResults: number;
}

const currentYear = new Date().getFullYear();
const YEARS = [
  "All Years",
  ...Array.from({ length: currentYear - 1985 + 1 }, (_, i) => (currentYear - i).toString())
];

const LENGTHS = ["All Lengths", "Under 5 min", "5-10 min", "10-20 min", "20+ min"];

function buildSearchParams(params: {
  query: string;
  year: string;
  song: string;
  length: string;
  pageToken?: string;
}): string {
  const p = new URLSearchParams();
  if (params.query) p.set("q", params.query);
  if (params.year !== "All Years") p.set("year", params.year);
  if (params.song) p.set("song", params.song);
  if (params.length !== "All Lengths") p.set("length", params.length);
  if (params.pageToken) p.set("pageToken", params.pageToken);
  p.set("maxResults", "5");
  return p.toString();
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [songFilter, setSongFilter] = useState("");
  const [lengthFilter, setLengthFilter] = useState("All Lengths");
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    setAllVideos([]);
    setNextPageToken(null);
    try {
      const qs = buildSearchParams({ query: searchQuery, year: yearFilter, song: songFilter, length: lengthFilter });
      const res = await fetch(`/api/search?${qs}`);
      const data: SearchResponse = await res.json();
      if (!res.ok) throw new Error((data as any).message || "Search failed");
      setAllVideos(data.videos);
      setNextPageToken(data.nextPageToken);
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const qs = buildSearchParams({ query: searchQuery, year: yearFilter, song: songFilter, length: lengthFilter, pageToken: nextPageToken });
      const res = await fetch(`/api/search?${qs}`);
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setAllVideos(prev => [...prev, ...data.videos]);
        setNextPageToken(data.nextPageToken);
      }
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-12 bg-background overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <header className="relative z-10 pt-12 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
            PhishStream
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-light">
            Dive into the archives. Find that perfect jam.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-4 md:p-6 flex flex-col gap-4 neon-glow max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
            <input
              type="text"
              placeholder="Search concerts, venues, or dates..."
              className="w-full bg-input/50 border border-white/10 rounded-2xl py-4 pl-12 pr-28 text-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              data-testid="input-search"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              data-testid="button-search"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
              <select
                className="w-full bg-input/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                data-testid="select-year"
              >
                {YEARS.map(y => <option key={y} value={y} className="bg-background">{y}</option>)}
              </select>
            </div>

            <div className="relative">
              <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Filter by song name..."
                className="w-full bg-input/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={songFilter}
                onChange={(e) => setSongFilter(e.target.value)}
                onKeyDown={handleKeyDown}
                data-testid="input-song"
              />
            </div>

            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-accent w-5 h-5" />
              <select
                className="w-full bg-input/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={lengthFilter}
                onChange={(e) => setLengthFilter(e.target.value)}
                data-testid="select-length"
              >
                {LENGTHS.map(l => <option key={l} value={l} className="bg-background">{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto">
        {!hasSearched ? (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
            <Search className="w-16 h-16 text-primary mb-4 opacity-60" />
            <h3 className="text-2xl font-bold mb-2">Search for live Phish</h3>
            <p className="text-muted-foreground">Use the search bar and filters above, then hit Search to find concerts and clips on YouTube.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-lg">Searching YouTube...</p>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
            <X className="w-16 h-16 text-destructive mb-4 opacity-60" />
            <h3 className="text-2xl font-bold mb-2">Search Error</h3>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={handleSearch}
              className="mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : allVideos.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold font-display" data-testid="text-result-count">
                {allVideos.length} {allVideos.length === 1 ? 'Result' : 'Results'} Shown
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allVideos.map((video, index) => (
                <div
                  key={`${video.id}-${index}`}
                  className="group glass-panel rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:neon-glow flex flex-col"
                  onClick={() => setPlayingVideo(video)}
                  data-testid={`card-video-${video.id}`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-primary/90 text-white rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-8 h-8 fill-current ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded-md">
                      {video.duration}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 text-white group-hover:text-primary transition-colors flex-1">
                      {video.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs font-medium bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/30">
                        {new Date(video.publishedAt).getFullYear()}
                      </span>
                      <span className="text-xs font-medium bg-secondary/20 text-secondary px-2.5 py-1 rounded-full border border-secondary/30">
                        {video.channelTitle}
                      </span>
                      <span className="text-xs font-medium bg-white/10 text-white/80 px-2.5 py-1 rounded-full border border-white/10">
                        {video.viewCount} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {nextPageToken && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-6 py-3 bg-card border border-white/10 hover:border-primary/50 text-white font-medium rounded-full transition-all hover:neon-glow hover:text-primary disabled:opacity-50"
                  data-testid="button-load-more"
                >
                  {isLoadingMore ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                  ) : (
                    <>Load More <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <Filter className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters to find the perfect jam.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setYearFilter("All Years");
                setSongFilter("");
                setLengthFilter("All Lengths");
                setHasSearched(false);
                setError(null);
              }}
              className="mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={() => setPlayingVideo(null)}
          />

          <div className="relative w-full max-w-5xl glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-full">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-primary text-white p-2 rounded-full backdrop-blur-md transition-colors"
              data-testid="button-close-player"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="aspect-video w-full bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1`}
                title={playingVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            <div className="p-6 md:p-8 bg-card/80">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                {playingVideo.title}
              </h2>
              <div className="flex flex-wrap gap-3 items-center text-sm md:text-base text-muted-foreground">
                <span className="flex items-center gap-1.5 text-primary">
                  <Calendar className="w-4 h-4" /> {new Date(playingVideo.publishedAt).getFullYear()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="flex items-center gap-1.5 text-secondary">
                  <Music className="w-4 h-4" /> {playingVideo.channelTitle}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="flex items-center gap-1.5 text-white/70">
                  <Clock className="w-4 h-4" /> {playingVideo.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
