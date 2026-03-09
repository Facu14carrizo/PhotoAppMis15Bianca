import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddTitleModalProps {
  imageUrl: string;
  onSave: (title: string) => void;
  onSkip: () => void;
}

export default function AddTitleModal({ imageUrl, onSave, onSkip }: AddTitleModalProps) {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSaving) {
        handleSave();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, isSaving, onSave, onSkip]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave(title.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-800 animate-in scale-in-95 duration-200">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Agregar título</h3>
          <button
            onClick={onSkip}
            disabled={isSaving}
            className="text-gray-400 hover:text-white p-1 transition-colors duration-200 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg mb-4"
          />

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe un título (opcional)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            autoFocus
            maxLength={100}
            disabled={isSaving}
          />
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-3">
          <button
            onClick={onSkip}
            disabled={isSaving}
            className="flex-1 px-4 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Omitir
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
