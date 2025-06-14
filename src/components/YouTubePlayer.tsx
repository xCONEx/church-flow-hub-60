
interface YouTubePlayerProps {
  url: string;
  width?: string;
  height?: string;
}

export const YouTubePlayer = ({ url, width = "100%", height = "315" }: YouTubePlayerProps) => {
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <div className="relative overflow-hidden rounded-lg">
      <iframe
        width={width}
        height={height}
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full rounded-lg"
      />
    </div>
  );
};
