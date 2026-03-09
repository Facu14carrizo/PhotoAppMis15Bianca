
export async function compressImage(
  source: Blob | string,
  maxWidth: number = 2560,
  maxHeight: number = 2560,
  quality: number = 0.92
): Promise<Blob> {
  // 1. Obtener el Blob inicial
  let imgBlob: Blob;
  try {
    imgBlob = typeof source === 'string' ? base64ToBlob(source) : source;
  } catch (e) {
    console.error('Error converting source to blob:', e);
    return typeof source === 'string' ? new Blob() : source;
  }

  // 2. Intentar usar createImageBitmap (más moderno y estable en móviles/iOS)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(imgBlob);
      const canvas = document.createElement('canvas');
      let width = bitmap.width;
      let height = bitmap.height;

      const aspectRatio = width / height;
      if (width > height) {
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
      } else {
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext('2d', { alpha: false });

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        // Liberar recursos del bitmap
        bitmap.close();

        return new Promise((resolve) => {
          canvas.toBlob(
            (b) => {
              canvas.width = 0;
              canvas.height = 0;
              resolve(b || imgBlob);
            },
            'image/jpeg',
            quality
          );
        });
      }
      bitmap.close();
    } catch (e) {
      // Si falla createImageBitmap, el log es puramente informativo
      console.warn('createImageBitmap failed, falling back to legacy Image load:', e);
    }
  }

  // 3. Fallback: Método tradicional con new Image()
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(imgBlob);
    const img = new Image();

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Retornar original sin error ruidoso en consola
      resolve(imgBlob);
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        // Calcular el recorte centrado para 1:1 (Cuadrado)
        if (sourceWidth > sourceHeight) {
          sourceX = (sourceWidth - sourceHeight) / 2;
          sourceWidth = sourceHeight;
        } else if (sourceHeight > sourceWidth) {
          sourceY = (sourceHeight - sourceWidth) / 2;
          sourceHeight = sourceWidth;
        }

        let finalWidth = Math.min(sourceWidth, maxWidth);
        let finalHeight = Math.min(sourceHeight, maxHeight);
        const size = Math.min(finalWidth, finalHeight);
        finalWidth = size;
        finalHeight = size;

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(finalWidth);
        canvas.height = Math.round(finalHeight);
        const ctx = canvas.getContext('2d', { alpha: false });

        if (!ctx) {
          resolve(imgBlob);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        img.src = '';

        canvas.toBlob(
          (b) => {
            canvas.width = 0;
            canvas.height = 0;
            resolve(b || imgBlob);
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        resolve(imgBlob);
      }
    };

    img.src = objectUrl;
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      resolve(reader.result as string);
    };
  });
}

export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mimeType });
}

export function getEstimatedSize(base64: string): number {
  const fileSize = base64.length * 0.75;
  return Math.round(fileSize / 1024);
}
