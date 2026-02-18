import { useRef, useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    Canva?: {
      DesignButton?: {
        initialize(config: { apiKey: string }): Promise<any>;
      };
    };
  }
}

const CANVA_API_KEY = process.env.CANVA_API_KEY || '';

export function useCanva() {
  const apiRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initCanva = async () => {
      const maxWait = 5000;
      const start = Date.now();

      while (!window.Canva?.DesignButton && Date.now() - start < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (window.Canva?.DesignButton && CANVA_API_KEY) {
        try {
          apiRef.current = await window.Canva.DesignButton.initialize({
            apiKey: CANVA_API_KEY,
          });
          setIsReady(true);
        } catch (e) {
          console.warn('Canva SDK initialization failed:', e);
        }
      }
    };

    initCanva();
  }, []);

  const openInCanva = useCallback((imageDataUrl: string, designType: string = 'SocialMedia') => {
    if (!apiRef.current) {
      window.open('https://www.canva.com/create/', '_blank');
      return;
    }

    try {
      apiRef.current.createDesign({
        design: { type: designType },
        editor: { fileUrl: imageDataUrl },
      });
    } catch (e) {
      console.warn('Canva createDesign failed:', e);
      window.open('https://www.canva.com/create/', '_blank');
    }
  }, []);

  return { isReady, openInCanva };
}
