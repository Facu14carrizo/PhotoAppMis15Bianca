import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { X, RotateCcw, Zap, Circle, Grid3X3, Video, Camera as CameraIcon } from 'lucide-react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onCaptureVideo?: (videoBlob: Blob) => void;
  onClose: () => void;
}

export default function Camera({ onCapture, onCaptureVideo, onClose }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);



  const handleDataAvailable = useCallback(
    ({ data }: { data: Blob }) => {
      if (data.size > 0) {
        chunksRef.current.push(data);
      }
    },
    []
  );

  const startRecording = useCallback(() => {
    if (webcamRef.current?.stream) {
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=h264,aac")
        ? "video/mp4;codecs=h264,aac"
        : (MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
            ? "video/webm;codecs=vp8,opus"
            : ""));

      const recorder = new MediaRecorder(webcamRef.current.stream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8Mbps para alta calidad
      });
      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", handleDataAvailable);

      recorder.addEventListener("stop", () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: chunksRef.current[0].type });
          onCaptureVideo?.(blob);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 800);
        }
        chunksRef.current = [];
        setIsRecording(false);
      });

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    }
  }, [webcamRef, handleDataAvailable, onCaptureVideo]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Timer para el límite de 15 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, stopRecording]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (imageSrc) {
      setIsCapturing(true);
      setShowSuccess(true);

      onCapture(imageSrc);

      setTimeout(() => {
        setIsCapturing(false);
      }, 150);

      setTimeout(() => {
        setShowSuccess(false);
      }, 800);
    }
  }, [onCapture]);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  const handleModeChange = (newMode: 'photo' | 'video') => {
    if (newMode === mode || isRecording) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      {/* Header Premium */}
      <div className="glass-effect-dark border-b border-white/5 slide-in-from-top">
        <div className="flex justify-between items-center p-2 pt-4 px-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="text-zinc-400" size={18} />
              <div className="absolute inset-0 blur-lg bg-zinc-500/40 animate-pulse" />
            </div>
            <h2 className="text-white text-base font-bold">Cámara</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white p-2 hover:bg-white/10 rounded-full transition-all duration-200"
            aria-label="Cerrar cámara"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Visor de cámara */}
      <div className={`flex-1 flex items-center justify-center relative overflow-hidden bg-black transition-all duration-500 z-10 ${isTransitioning ? 'scale-[0.98] opacity-40 blur-sm' : 'scale-100 opacity-100 blur-0'
        }`}>
        <Webcam
          key={`${facingMode}-${mode}`}
          ref={webcamRef}
          audio={mode === 'video'}
          muted={true}
          screenshotFormat="image/jpeg"
          screenshotQuality={1}
          forceScreenshotSourceSize={true}
          videoConstraints={{
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }}
          className="w-full h-full object-cover"
          mirrored={facingMode === 'user'}
        />

        {/* Overlay con grid profesional (Regla de tercios) */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none animate-in fade-in duration-500">
            {/* Líneas verticales */}
            <div className="absolute inset-0 flex justify-evenly">
              <div className="w-[0.5px] h-full bg-white/30" />
              <div className="w-[0.5px] h-full bg-white/30" />
            </div>
            {/* Líneas horizontales */}
            <div className="absolute inset-0 flex flex-col justify-evenly">
              <div className="h-[0.5px] w-full bg-white/30" />
              <div className="h-[0.5px] w-full bg-white/30" />
            </div>
          </div>
        )}

        {/* Tiempo de grabación Ultra-Minimalista */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-white text-xs font-bold tracking-[0.2em] tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 15s
            </span>
          </div>
        )}

        {/* Efecto Flash */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white animate-pulse" style={{ animationDuration: '150ms' }} />
        )}

        {/* Success indicator */}
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="glass-effect rounded-full p-6 zoom-in">
                <Circle className="text-green-400" size={48} strokeWidth={3} />
              </div>
              <div className="absolute inset-0 blur-2xl bg-green-500/50 animate-pulse" />
            </div>
          </div>
        )}

      </div>

      {/* Controles Premium Compactos */}
      <div className="glass-effect-dark border-t border-white/5 p-4 pb-6">
        <div className="max-w-md mx-auto flex flex-col items-center gap-5">
          {/* Selector de Modo (Arriba) */}
          <div className="relative flex items-center bg-white/5 p-1 rounded-full backdrop-blur-md border border-white/10 w-[180px] animate-in slide-in-from-top-2 duration-500">
            {/* Sliding Pill Background */}
            <div
              className={`absolute inset-y-1 rounded-full bg-gradient-to-r from-zinc-600 to-zinc-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(161,161,170,0.4)] ${mode === 'photo' ? 'left-1 w-[86px]' : 'left-[91px] w-[86px]'
                }`}
            />

            <button
              onClick={() => handleModeChange('photo')}
              className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors duration-300 ${mode === 'photo' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
            >
              <CameraIcon size={12} />
              FOTO
            </button>
            <button
              onClick={() => handleModeChange('video')}
              className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors duration-300 ${mode === 'video' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
            >
              <Video size={12} />
              VIDEO
            </button>
          </div>

          {/* Fila de Botones (Cámara Flip, Capturar, Grid) */}
          <div className="w-full flex justify-between items-center gap-4">
            {/* Botón cambiar cámara */}
            <button
              onClick={toggleCamera}
              className="btn-secondary text-white p-3.5 rounded-full hover:scale-110 transition-all duration-200 shadow-xl bg-white/5 border border-white/10"
              title="Cambiar cámara"
              aria-label="Cambiar cámara"
            >
              <RotateCcw size={20} />
            </button>

            {/* Botón capturar/grabar - diseño premium */}
            <button
              onClick={mode === 'photo' ? capture : (isRecording ? stopRecording : startRecording)}
              disabled={isCapturing}
              className="relative group disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              aria-label={mode === 'photo' ? "Capturar foto" : (isRecording ? "Detener grabación" : "Grabar video")}
            >
              {/* Anillo exterior */}
              <div className={`absolute inset-0 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse scale-125' : 'bg-gradient-to-br from-zinc-200 to-zinc-500'}`} />

              {/* Botón principal */}
              <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-active:scale-95 transition-all duration-200">
                {mode === 'photo' ? (
                  <div className="w-13 h-13 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-500 shadow-inner" />
                ) : (
                  <div className={`w-13 h-13 rounded-full shadow-inner flex items-center justify-center transition-all ${isRecording ? 'bg-red-500' : 'bg-gradient-to-br from-zinc-200 to-zinc-500'}`}>
                    {isRecording ? (
                      <div className="w-5 h-5 bg-white rounded-sm" />
                    ) : (
                      <div className="w-5 h-5 bg-white rounded-full" />
                    )}
                  </div>
                )}
              </div>

            </button>

            {/* Botón Grid */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`btn-secondary p-3.5 rounded-full hover:scale-110 transition-all duration-200 shadow-xl border border-white/10 ${showGrid ? 'text-zinc-400 bg-white/10 select-none' : 'text-white bg-white/5'
                }`}
              title="Cuadrícula"
              aria-label="Toggle cuadrícula"
            >
              <Grid3X3 size={20} />
            </button>
          </div>
        </div>

        {/* Indicador de modo */}
        <div className="text-center mt-3">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold opacity-60">
            {facingMode === 'user' ? 'Modo Selfie' : 'Cámara Principal'}
          </p>
        </div>
      </div>
    </div>
  );
}
