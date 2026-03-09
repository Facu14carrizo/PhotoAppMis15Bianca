import { useState } from 'react';
import { Trash2, Download, Share2, Image as ImageIcon, Heart, Play, Moon, Star } from 'lucide-react';
import type { Photo } from '../types/Photo';
import { toggleLike as toggleLikeService } from '../lib/photoService';

interface PhotoFeedProps {
  photos: Photo[];
  onDelete: (id: string) => void;
  onUpdatePhoto?: (updatedPhoto: Photo) => void;
  currentUser: string;
  viewMode: 'feed' | 'grid';
  onModalStateChange?: (isOpen: boolean) => void;
}

const PlaceholderImage = () => (
  <div className="w-full h-96 glass-effect flex items-center justify-center">
    <div className="text-center">
      <ImageIcon className="mx-auto text-gray-500 mb-3 float" size={56} />
      <p className="text-gray-400 text-sm font-medium">Imagen no disponible</p>
    </div>
  </div>
);

export default function PhotoFeed({ photos, onDelete, onUpdatePhoto, currentUser, viewMode, onModalStateChange }: PhotoFeedProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const photoDate = new Date(date);
    const diffMs = now.getTime() - photoDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins}m`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
    }

    return photoDate.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageError = (photoId: string) => {
    setImageErrors((prev) => new Set(prev).add(photoId));
  };

  const toggleLike = async (photoId: string) => {
    console.log(`[PhotoFeed] toggleLike called for photo: ${photoId}`);
    if (!currentUser) {
      console.warn('[PhotoFeed] No user found');
      return;
    }

    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    // Optimistic Update
    const isLiked = photo.likedBy?.includes(currentUser);
    const newLikedBy = isLiked
      ? (photo.likedBy || []).filter(u => u !== currentUser)
      : [...(photo.likedBy || []), currentUser];
    const newLikesCount = isLiked
      ? Math.max(0, (photo.likesCount || 0) - 1)
      : (photo.likesCount || 0) + 1;

    if (onUpdatePhoto) {
      onUpdatePhoto({
        ...photo,
        likesCount: newLikesCount,
        likedBy: newLikedBy
      });
    }

    try {
      const success = await toggleLikeService(photoId, currentUser);
      if (!success) {
        console.error('[PhotoFeed] toggleLikeService returned false');
        // Revert optimistic update if needed (will be handled by real-time sync eventually, 
        // but for now it helps pinpoint errors)
      }
    } catch (error) {
      console.error('[PhotoFeed] Error in toggleLikeService:', error);
    }
  };

  const downloadPhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();

      let extension = 'jpg';
      if (photo.imageUrl.toLowerCase().endsWith('.webm')) extension = 'webm';
      else if (photo.imageUrl.toLowerCase().endsWith('.mp4')) extension = 'mp4';
      else if (photo.imageUrl.toLowerCase().endsWith('.mov')) extension = 'mov';
      else if (blob.type.includes('video')) extension = blob.type.split('/')[1] || 'mp4';

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photoparty-${photo.id}-${photo.createdAt.getTime()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading media:', err);
      const extension = photo.imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const link = document.createElement('a');
      link.href = photo.imageUrl;
      link.target = '_blank';
      link.download = `photoparty-${photo.id}.${extension}`;
      link.click();
    }
  };

  const sharePhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();

      let extension = 'jpg';
      if (photo.imageUrl.toLowerCase().endsWith('.webm')) extension = 'webm';
      else if (photo.imageUrl.toLowerCase().endsWith('.mp4')) extension = 'mp4';
      else if (photo.imageUrl.toLowerCase().endsWith('.mov')) extension = 'mov';
      else if (blob.type.includes('video')) extension = blob.type.split('/')[1] || 'mp4';

      const file = new File([blob], `photoparty-${photo.id}.${extension}`, { type: blob.type || (extension === 'mp4' ? 'video/mp4' : 'video/webm') });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: photo.title || 'Contenido de Mis 15 Bianca',
          text: photo.title || '¡Mira mi recuerdo de Mis 15 Bianca!',
        });
      } else {
        downloadPhoto(photo);
      }
    } catch (err) {
      downloadPhoto(photo);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <ImageIcon className="text-gray-600 float" size={80} />
            <div className="absolute inset-0 blur-2xl bg-purple-500/20 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Tu galería está vacía
          </h2>
          <p className="text-gray-400 text-base">
            Captura tu primera foto y comienza a crear recuerdos increíbles
          </p>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPhoto(null);
      setIsClosing(false);
      setIsFirstOpen(true);
      setTouchStartX(null);
      setTouchCurrentX(0);
      onModalStateChange?.(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchCurrentX(e.targetTouches[0].clientX);
    setIsFirstOpen(false);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      setTouchCurrentX(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || !selectedPhoto) return;

    const deltaX = touchCurrentX - touchStartX;
    const threshold = window.innerWidth * 0.2; // 20% del ancho para cambiar

    if (Math.abs(deltaX) > threshold) {
      const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
      if (deltaX > 0 && currentIndex > 0) {
        setSelectedPhoto(photos[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < photos.length - 1) {
        setSelectedPhoto(photos[currentIndex + 1]);
      }
    }

    setTouchStartX(null);
    setTouchCurrentX(0);
    setIsDragging(false);
  };

  const swipeOffset = touchStartX !== null ? touchCurrentX - touchStartX : 0;
  const currentPhotoIndex = selectedPhoto ? photos.findIndex(p => p.id === selectedPhoto.id) : -1;

  return (
    <div className="w-full">
      {viewMode === 'feed' ? (
        /* Feed estilo Instagram Premium */
        <div className="max-w-2xl mx-auto w-full pt-6 pb-6 px-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="mb-4 md:mb-6 animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Card con glassmorphism */}
              <div className="glass-effect rounded-2xl overflow-hidden border border-white/10 shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:border-white/20 transition-all duration-500">
                {/* Header de la foto */}
                <div
                  className="px-4 py-4 md:px-5 md:py-5 flex items-center justify-between border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all duration-300 relative overflow-hidden group"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    onModalStateChange?.(true);
                  }}
                >
                  {/* Fondo decorativo de estrellas "Notorio" */}
                  <div className="absolute inset-0 z-0 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity">
                    <Star className="absolute top-2 left-10 text-white animate-twinkle" size={12} style={{ animationDelay: '0s' }} />
                    <Star className="absolute bottom-3 right-32 text-white animate-twinkle" size={8} style={{ animationDelay: '1s' }} />
                    <Star className="absolute top-6 right-20 text-white animate-twinkle" size={6} style={{ animationDelay: '2s' }} />
                    <Star className="absolute top-2 left-1/2 text-white animate-twinkle" size={10} style={{ animationDelay: '0.5s' }} />

                    {/* Constelación más visible */}
                    <svg className="absolute right-10 top-2 w-32 h-12 text-white/20" viewBox="0 0 100 40">
                      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="30" cy="25" r="1" fill="currentColor" />
                      <circle cx="50" cy="15" r="2" fill="currentColor" className="animate-pulse" />
                      <circle cx="70" cy="30" r="1" fill="currentColor" />
                      <circle cx="90" cy="10" r="1.5" fill="currentColor" />
                      <path d="M10 10 L30 25 L50 15 L70 30 L90 10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative group/moon">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black flex items-center justify-center border border-white/20 group-hover:border-white/50 transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <Moon size={22} className="text-white group-hover:rotate-12 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                      </div>
                      <Star className="absolute -top-1 -right-1 text-white animate-spin-slow" size={10} />
                    </div>
                    <div>
                      <p className="text-white font-black text-base tracking-wider drop-shadow-sm group-hover:text-silver-100 transition-colors">
                        {photo.userName || 'Mis 15 Bianca'}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-silver-400 animate-pulse" />
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.25em]">{formatDateTime(photo.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 px-3 py-1 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm group-hover:border-white/30 transition-all">
                    <p className="text-[9px] font-black text-white/60 tracking-[0.3em] uppercase">
                      Recuerdito
                    </p>
                  </div>
                </div>

                {/* Imagen */}
                <div
                  className="relative w-full aspect-square bg-black/50 cursor-pointer overflow-hidden"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    onModalStateChange?.(true);
                  }}
                >
                  {imageErrors.has(photo.id) ? (
                    <PlaceholderImage />
                  ) : (
                    photo.imageUrl.toLowerCase().endsWith('.webm') ||
                      photo.imageUrl.toLowerCase().endsWith('.mp4') ||
                      photo.imageUrl.toLowerCase().endsWith('.mov') ||
                      photo.imageUrl.includes('video') ? (
                      <div
                        className="relative w-full h-full cursor-pointer group"
                        onClick={() => {
                          setIsFirstOpen(true);
                          setSelectedPhoto(photo);
                        }}
                      >
                        <video
                          src={photo.imageUrl}
                          className="w-full h-full object-cover image-render-sharp"
                          playsInline
                          loop
                          muted
                          onPlay={(e) => {
                            const overlay = e.currentTarget.nextElementSibling;
                            if (overlay) overlay.classList.add('opacity-0', 'scale-0');
                          }}
                          onPause={(e) => {
                            const overlay = e.currentTarget.nextElementSibling;
                            if (overlay) overlay.classList.remove('opacity-0', 'scale-0');
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const video = e.currentTarget.parentElement?.querySelector('video');
                            if (video) {
                              if (video.paused) {
                                document.querySelectorAll('video').forEach(v => {
                                  if (v !== video) v.pause();
                                });
                                video.play();
                              } else {
                                video.pause();
                              }
                            }
                          }}
                          className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/90 border border-white/10 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-10"
                        >
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </button>
                      </div>
                    ) : (
                      <img
                        src={photo.imageUrl}
                        alt={photo.title || 'Foto'}
                        className="w-full h-full object-cover cursor-zoom-in image-render-sharp"
                        loading="lazy"
                        onClick={() => {
                          setIsFirstOpen(true);
                          setSelectedPhoto(photo);
                        }}
                        onError={() => handleImageError(photo.id)}
                      />
                    )
                  )}
                </div>

                {/* Controles */}
                <div className="px-3 py-2 md:px-4 md:py-3">
                  {/* Botones de acción principales */}
                  <div className="flex items-center gap-4 mb-3">
                    <button
                      onClick={() => toggleLike(photo.id)}
                      className={`flex items-center gap-1.5 transition-all duration-200 ${photo.likedBy?.includes(currentUser)
                        ? 'text-red-500 scale-110'
                        : 'text-gray-400 hover:text-red-400 hover:scale-110'
                        }`}
                      aria-label="Me gusta"
                    >
                      <Heart
                        size={24}
                        fill={photo.likedBy?.includes(currentUser) ? 'currentColor' : 'none'}
                        className="transition-all"
                      />
                      {photo.likesCount !== undefined && photo.likesCount > 0 && (
                        <span className="text-sm font-bold">{photo.likesCount}</span>
                      )}
                    </button>

                    <button
                      onClick={() => sharePhoto(photo)}
                      className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:scale-110"
                      title="Compartir"
                      aria-label="Compartir foto"
                    >
                      <Share2 size={24} />
                    </button>

                    <button
                      onClick={() => downloadPhoto(photo)}
                      className="text-gray-400 hover:text-green-400 transition-all duration-200 hover:scale-110"
                      title="Descargar"
                      aria-label="Descargar foto"
                    >
                      <Download size={24} />
                    </button>

                    <div className="flex-1" />

                    {photo.userName === currentUser && (
                      <button
                        onClick={() => onDelete(photo.id)}
                        className="text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-110"
                        title="Eliminar"
                        aria-label="Eliminar foto"
                      >
                        <Trash2 size={22} />
                      </button>
                    )}
                  </div>

                  {/* Título si existe */}
                  {photo.title && (
                    <p className="text-white text-sm font-medium mb-2 break-words">
                      <span className="font-bold">{photo.userName || 'Mis 15 Bianca'}</span> {photo.title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Album estilo Cuadrícula (Celular) */
        <div className="max-w-4xl mx-auto w-full pt-4 pb-12 px-1">
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-square animate-in zoom-in duration-300 overflow-hidden group cursor-pointer border border-white/5"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => {
                  setSelectedPhoto(photo);
                  onModalStateChange?.(true);
                }}
              >
                {imageErrors.has(photo.id) ? (
                  <div className="w-full h-full glass-effect flex items-center justify-center">
                    <ImageIcon className="text-gray-600" size={24} />
                  </div>
                ) : (
                  photo.imageUrl.toLowerCase().endsWith('.webm') ||
                    photo.imageUrl.toLowerCase().endsWith('.mp4') ||
                    photo.imageUrl.toLowerCase().endsWith('.mov') ||
                    photo.imageUrl.includes('video') ? (
                    <>
                      <video
                        src={photo.imageUrl}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer image-render-sharp"
                        onClick={() => {
                          setIsFirstOpen(true);
                          setSelectedPhoto(photo);
                        }}
                        muted
                        playsInline
                        loop
                      />
                      <div className="absolute top-2 left-2 p-1 bg-black/40 backdrop-blur-md rounded-full text-white pointer-events-none">
                        <Play size={10} fill="currentColor" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={photo.imageUrl}
                      alt={photo.title || 'Foto'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer image-render-sharp"
                      loading="lazy"
                      onClick={() => {
                        setIsFirstOpen(true);
                        setSelectedPhoto(photo);
                      }}
                      onError={() => handleImageError(photo.id)}
                    />
                  )
                )}

                {/* Overlay de likes simple en grid */}
                {(photo.likesCount || 0) > 0 && (
                  <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[10px] text-white">
                    <Heart size={10} fill="red" className="text-red-500" />
                    <span>{photo.likesCount}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black/95 transition-all duration-300 ${isClosing ? 'fade-out' : 'animate-in fade-in duration-500'
            }`}
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >


          {/* Contenedor del Carrusel (Slider) */}
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out z-[105]"
            style={{
              transform: `translateX(calc(-${currentPhotoIndex * 100}% + ${swipeOffset}px))`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {photos.map((photo, idx) => {
              // Optimizacion: Solo renderizamos el actual y los vecinos para mejor performance
              const isVisible = Math.abs(idx - currentPhotoIndex) <= 1;
              if (!isVisible) return <div key={photo.id} className="min-w-full h-full" />;

              return (
                <div
                  key={photo.id}
                  className="min-w-full h-full flex items-center justify-center p-0 touch-none relative overflow-hidden"
                  onClick={handleClose}
                >


                  {/* Contenido principal con object-contain (sin zoom/recorte) */}
                  <div
                    className="relative z-10 w-full h-full flex items-center justify-center"
                    onClick={(e) => {
                      // Solo cerramos si se hace click en el contenedor (fuera de la imagen/video)
                      if (e.target === e.currentTarget) handleClose();
                    }}
                  >
                    {photo.imageUrl.toLowerCase().endsWith('.webm') ||
                      photo.imageUrl.toLowerCase().endsWith('.mp4') ||
                      photo.imageUrl.toLowerCase().endsWith('.mov') ||
                      photo.imageUrl.includes('video') ? (
                      <video
                        src={photo.imageUrl}
                        className={`w-full h-full object-cover transition-all duration-300 ${isClosing ? 'fade-out' : (isFirstOpen && idx === currentPhotoIndex) ? 'animate-in fade-in duration-500' : ''
                          }`}
                        autoPlay
                        playsInline
                        loop
                        onClick={handleClose}
                      />
                    ) : (
                      <img
                        src={photo.imageUrl}
                        alt={photo.title || 'Foto'}
                        className={`w-full h-full object-cover transition-all duration-300 ${isClosing ? 'fade-out' : (isFirstOpen && idx === currentPhotoIndex) ? 'animate-in fade-in duration-500' : ''
                          }`}
                        onClick={handleClose}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>


        </div>
      )}
    </div>
  );
}
