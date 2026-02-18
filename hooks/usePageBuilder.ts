import { useState, useCallback, useEffect, useRef } from 'react';
import { SectionData, ProductInfo, SectionType } from '../types';

const STORAGE_KEY = 'detail-page-builder-state';
const MAX_HISTORY = 50;

interface SavedState {
  product: ProductInfo;
  sections: SectionData[];
}

interface HistoryEntry {
  sections: SectionData[];
  product: ProductInfo;
}

// Strip base64 image data for localStorage (prevent exceeding 5MB limit)
function stripBase64ForStorage(sections: SectionData[]): SectionData[] {
  return sections.map(s => ({
    ...s,
    imageUrl: s.imageUrl?.startsWith('data:') ? '' : (s.imageUrl || ''),
    imageUrls: s.imageUrls?.map(url => url?.startsWith('data:') ? '' : (url || '')),
  }));
}

export function usePageBuilder(initialSections: SectionData[]) {
  const [product, setProduct] = useState<ProductInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        if (parsed.product?.name !== undefined) return parsed.product;
      }
    } catch { /* fall through */ }
    return { name: '', description: '', targetAudience: '' };
  });

  const [sections, setSections] = useState<SectionData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        if (parsed.sections?.length > 0) return parsed.sections;
      }
    } catch { /* fall through */ }
    return initialSections;
  });

  // Undo/Redo
  const historyRef = useRef<HistoryEntry[]>([{ sections: initialSections, product: { name: '', description: '', targetAudience: '' } }]);
  const historyIndexRef = useRef(0);
  const [, forceUpdate] = useState(0);

  // Persist to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const toSave: SavedState = {
          product,
          sections: stripBase64ForStorage(sections),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [product, sections]);

  const pushHistory = useCallback((newSections: SectionData[], newProduct: ProductInfo) => {
    const history = historyRef.current;
    const index = historyIndexRef.current;
    // Truncate future states
    historyRef.current = history.slice(0, index + 1);
    historyRef.current.push({ sections: newSections, product: newProduct });
    // Limit history size
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY);
    }
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const entry = historyRef.current[historyIndexRef.current];
      setSections(entry.sections);
      setProduct(entry.product);
      forceUpdate(n => n + 1);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const entry = historyRef.current[historyIndexRef.current];
      setSections(entry.sections);
      setProduct(entry.product);
      forceUpdate(n => n + 1);
    }
  }, []);

  const updateProduct = useCallback((newProduct: ProductInfo) => {
    setProduct(newProduct);
    pushHistory(sections, newProduct);
  }, [sections, pushHistory]);

  const updateSection = useCallback((id: string, data: Partial<SectionData>) => {
    setSections(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...data } : s);
      pushHistory(next, product);
      return next;
    });
  }, [product, pushHistory]);

  const deleteSection = useCallback((id: string) => {
    setSections(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(s => s.id !== id);
      pushHistory(next, product);
      return next;
    });
  }, [product, pushHistory]);

  const moveSection = useCallback((id: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index < 0) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const next = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      pushHistory(next, product);
      return next;
    });
  }, [product, pushHistory]);

  const addSection = useCallback((type: SectionType) => {
    setSections(prev => {
      const newSection: SectionData = {
        id: Date.now().toString(),
        type,
        title: '새로운 섹션',
        content: '',
        items: type === 'solution' || type === 'trust' || type === 'info' ? [{ title: '', desc: '' }] : undefined,
        imageUrls: type === 'gallery' ? ['', '', '', ''] : undefined
      };

      const ctaIndex = prev.findIndex(s => s.type === 'cta');
      const next = [...prev];
      if (ctaIndex !== -1) {
        next.splice(ctaIndex, 0, newSection);
      } else {
        next.push(newSection);
      }
      pushHistory(next, product);
      return next;
    });
  }, [product, pushHistory]);

  const resetToDefault = useCallback((defaultSections: SectionData[]) => {
    setSections(defaultSections);
    setProduct({ name: '', description: '', targetAudience: '' });
    localStorage.removeItem(STORAGE_KEY);
    historyRef.current = [{ sections: defaultSections, product: { name: '', description: '', targetAudience: '' } }];
    historyIndexRef.current = 0;
    forceUpdate(n => n + 1);
  }, []);

  return {
    product,
    setProduct: updateProduct,
    sections,
    updateSection,
    deleteSection,
    moveSection,
    addSection,
    undo,
    redo,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
    resetToDefault,
  };
}
