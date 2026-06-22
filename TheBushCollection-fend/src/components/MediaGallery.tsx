import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { FileData } from './FileUpload';

interface MediaGalleryProps {
  files: FileData[];
  className?: string;
}

export default function MediaGallery({ files, className = '' }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!files || files.length === 0) {
    return null;
  }

  const currentFile = files[currentIndex];
  const images = files.filter(f => f.type === 'image');
  const videos = files.filter(f => f.type === 'video');

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
  };

  const goToMedia = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Media Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-gray-100">
            {currentFile.type === 'image' ? (
              <img
                src={currentFile.url}
                alt={currentFile.name}
                className="w-full h-full object-cover"
              />
            ) : currentFile.type === 'video' ? (
              <video
                src={currentFile.url}
                className="w-full h-full object-cover"
                controls
                muted={isMuted}
                autoPlay={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Unsupported file type</p>
              </div>
            )}

            {/* Navigation Arrows */}
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={prevMedia}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={nextMedia}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Media Type Badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-black/50 text-white">
                {currentFile.type === 'image' ? 'Photo' : 'Video'} {currentIndex + 1} of {files.length}
              </Badge>
            </div>

            {/* Fullscreen Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  {currentFile.type === 'image' ? (
                    <img
                      src={currentFile.url}
                      alt={currentFile.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <video
                      src={currentFile.url}
                      className="max-w-full max-h-full object-contain"
                      controls
                      autoPlay
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Navigation */}
      {files.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {files.map((file, index) => (
            <button
              key={file.id}
              onClick={() => goToMedia(index)}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {file.type === 'image' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-16 h-16 object-cover"
                />
              ) : file.type === 'video' ? (
                <div className="relative w-16 h-16">
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-500">File</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Media Stats */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex space-x-4">
          {images.length > 0 && (
            <span>{images.length} Photo{images.length !== 1 ? 's' : ''}</span>
          )}
          {videos.length > 0 && (
            <span>{videos.length} Video{videos.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <span className="font-medium">{currentFile.name}</span>
      </div>
    </div>
  );
}