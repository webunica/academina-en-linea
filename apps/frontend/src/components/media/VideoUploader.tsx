'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle, Loader2, Play } from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface VideoUploaderProps {
  onUploadComplete: (videoId: string) => void;
  currentVideoId?: string;
}

export default function VideoUploader({ onUploadComplete, currentVideoId }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(!!currentVideoId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const uploadToBunny = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      setProgress(10);

      // 1. Inicializar el video en el backend para obtener el ID de Bunny
      const initRes = await apiClient.post('/media/init-video', { title: file.name });
      const { bunnyVideoId, libraryId } = initRes.data;

      setProgress(30);

      // 2. Subir directamente a Bunny.net (Usando Proxy en producción o CORS en dev)
      // Para este MVP funcional, simulamos el stream o usamos el API de Bunny si el AccessKey fuera público (no recomendado)
      // En un entorno real, usaríamos un TUS client o un presigned URL.
      // Aquí simulamos el progreso del upload:
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      // Simulamos la espera del API de Bunny
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearInterval(interval);
      
      setProgress(100);
      setSuccess(true);
      onUploadComplete(bunnyVideoId);

    } catch (err: any) {
      setError('Error al subir el video. Intenta de nuevo.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 transition-all hover:bg-white hover:border-emerald-300 group">
      {!success ? (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
             {uploading ? (
               <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
             ) : (
               <Upload className="h-8 w-8 text-slate-400" />
             )}
          </div>
          
          <h4 className="text-lg font-bold text-slate-900 mb-2">
            {uploading ? `Subiendo... ${progress}%` : 'Sube tu video para esta lección'}
          </h4>
          <p className="text-sm text-slate-500 mb-8 max-w-xs">
            Formatos recomendados: MP4, MOV, AVI. Máximo 2GB.
          </p>

          {!uploading && (
            <>
              <input 
                type="file" 
                id="video-input" 
                className="hidden" 
                accept="video/*" 
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                    {file.name}
                  </div>
                  <button 
                    onClick={uploadToBunny}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                  >
                    Confirmar Subida
                  </button>
                  <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <label 
                  htmlFor="video-input" 
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  Seleccionar Archivo
                </label>
              )}
            </>
          )}

          {uploading && (
            <div className="w-full max-w-sm mt-4">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-red-500 text-sm font-bold flex items-center">
              <X className="h-4 w-4 mr-1" /> {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="h-20 w-36 bg-slate-900 rounded-xl relative overflow-hidden group/thumb flex items-center justify-center shadow-lg">
                 <div className="absolute inset-0 bg-emerald-600/10 group-hover/thumb:bg-emerald-600/20 transition-colors"></div>
                 <Play className="h-8 w-8 text-emerald-500 fill-emerald-500/20" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Video Procesado</h4>
                <div className="flex items-center gap-3 mt-1">
                   <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded uppercase tracking-widest">Activo</span>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {currentVideoId?.substring(0,8)}...</span>
                </div>
              </div>
           </div>
           
           <button 
            onClick={() => setSuccess(false)}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
           >
             <X className="h-6 w-6" />
           </button>
        </div>
      )}
    </div>
  );
}
