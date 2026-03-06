import { useState, useMemo, useEffect } from "react";
import { Search, Play, X, Filter, Music, Calendar, Clock, ChevronDown } from "lucide-react";

// Import our generated stock images
import concert1 from "@/assets/images/concert_1.jpg";
import concert2 from "@/assets/images/concert_2.jpg";
import concert3 from "@/assets/images/concert_3.jpg";
import concert4 from "@/assets/images/concert_4.jpg";

// Mock data representing YouTube search results
const MOCK_VIDEOS = [
  { 
    id: '1', 
    videoId: 'QY4mh10I9zA', // Working official video
    title: 'Phish - You Enjoy Myself (12/31/95)', 
    year: '1995', 
    song: 'You Enjoy Myself', 
    lengthCategory: '10-20 min', 
    duration: '15:45', 
    views: '1.2M',
    thumbnail: concert1 
  },
  { 
    id: '2', 
    videoId: '4_-nsS0h8ok', // Working official video
    title: 'Phish - Tweezer (12/14/95)', 
    year: '1995', 
    song: 'Tweezer', 
    lengthCategory: '20+ min', 
    duration: '22:12', 
    views: '850K',
    thumbnail: concert2 
  },
  { 
    id: '3', 
    videoId: 'QY4mh10I9zA', 
    title: 'Phish - Harry Hood (Clifford Ball)', 
    year: '1996', 
    song: 'Harry Hood', 
    lengthCategory: '10-20 min', 
    duration: '16:30', 
    views: '2.1M',
    thumbnail: concert3 
  },
  { 
    id: '4', 
    videoId: '4_-nsS0h8ok', 
    title: 'Phish - Ghost (Denver 1997)', 
    year: '1997', 
    song: 'Ghost', 
    lengthCategory: '20+ min', 
    duration: '21:05', 
    views: '3.4M',
    thumbnail: concert4 
  },
  { 
    id: '5', 
    videoId: 'QY4mh10I9zA', 
    title: 'Phish - Fluffhead (12/31/99)', 
    year: '1999', 
    song: 'Fluffhead', 
    lengthCategory: '20+ min', 
    duration: '32:45', 
    views: '4.2M',
    thumbnail: concert1 
  },
  { 
    id: '6', 
    videoId: '4_-nsS0h8ok', 
    title: 'Phish - Chalk Dust Torture (7/10/99)', 
    year: '1999', 
    song: 'Chalk Dust Torture', 
    lengthCategory: '5-10 min', 
    duration: '8:12', 
    views: '920K',
    thumbnail: concert2 
  },
  { 
    id: '7', 
    videoId: 'QY4mh10I9zA', 
    title: 'Phish - Bouncing Around The Room (A Live One)', 
    year: '1995', 
    song: 'Bouncing Around The Room', 
    lengthCategory: 'Under 5 min', 
    duration: '3:58', 
    views: '1.5M',
    thumbnail: concert3 
  },
  { 
    id: '8', 
    videoId: '4_-nsS0h8ok', 
    title: 'Phish - Reba (Halloween 1994)', 
    year: '1994', 
    song: 'Reba', 
    lengthCategory: '10-20 min', 
    duration: '14:20', 
    views: '750K',
    thumbnail: concert4 
  },
  { 
    id: '9', 
    videoId: 'QY4mh10I9zA', 
    title: 'Phish - Bathtub Gin (Went 1997)', 
    year: '1997', 
    song: 'Bathtub Gin', 
    lengthCategory: '10-20 min', 
    duration: '18:15', 
    views: '1.1M',
    thumbnail: concert1 
  }
];

const currentYear = new Date().getFullYear();
const YEARS = [
  "All Years", 
  ...Array.from({ length: currentYear - 1985 + 1 }, (_, i) => (currentYear - i).toString())
];

const SONGS = [
  "All Songs", 
  "Bathtub Gin",
  "Bouncing Around The Room",
  "Chalk Dust Torture",
  "Fluffhead",
  "Ghost", 
  "Harry Hood", 
  "Reba",
  "Tweezer", 
  "You Enjoy Myself"
];

const LENGTHS = ["All Lengths", "Under 5 min", "5-10 min", "10-20 min", "20+ min"];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [songFilter, setSongFilter] = useState("All Songs");
  const [lengthFilter, setLengthFilter] = useState("All Lengths");
  const [playingVideo, setPlayingVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null);
  const [displayCount, setDisplayCount] = useState(5);

  const filteredVideos = useMemo(() => {
    return MOCK_VIDEOS.filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = yearFilter === "All Years" || video.year === yearFilter;
      const matchesSong = songFilter === "All Songs" || video.song === songFilter;
      const matchesLength = lengthFilter === "All Lengths" || video.lengthCategory === lengthFilter;
      
      return matchesSearch && matchesYear && matchesSong && matchesLength;
    });
  }, [searchQuery, yearFilter, songFilter, lengthFilter]);

  const displayedVideos = filteredVideos.slice(0, displayCount);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(5);
  }, [searchQuery, yearFilter, songFilter, lengthFilter]);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-12 bg-background overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      {/* Header & Search */}
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
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
            <input 
              type="text"
              placeholder="Search concerts, venues, or dates..."
              className="w-full bg-input/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>

          {/* Filters */}
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
              <select 
                className="w-full bg-input/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={songFilter}
                onChange={(e) => setSongFilter(e.target.value)}
                data-testid="select-song"
              >
                {SONGS.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
              </select>
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

      {/* Results Grid */}
      <main className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'Tape' : 'Tapes'} Found
          </h2>
        </div>

        {displayedVideos.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVideos.map((video) => (
                <div 
                  key={video.id} 
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
                        {video.year}
                      </span>
                      <span className="text-xs font-medium bg-secondary/20 text-secondary px-2.5 py-1 rounded-full border border-secondary/30">
                        {video.song}
                      </span>
                      <span className="text-xs font-medium bg-white/10 text-white/80 px-2.5 py-1 rounded-full border border-white/10">
                        {video.lengthCategory}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {displayCount < filteredVideos.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 px-6 py-3 bg-card border border-white/10 hover:border-primary/50 text-white font-medium rounded-full transition-all hover:neon-glow hover:text-primary"
                  data-testid="button-load-more"
                >
                  Load More <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <Filter className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No tapes found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to find the perfect jam.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setYearFilter("All Years");
                setSongFilter("All Songs");
                setLengthFilter("All Lengths");
              }}
              className="mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Video Player Modal */}
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
                  <Calendar className="w-4 h-4" /> {playingVideo.year}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="flex items-center gap-1.5 text-secondary">
                  <Music className="w-4 h-4" /> {playingVideo.song}
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
