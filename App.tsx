import React, { useState, useEffect, useCallback } from 'react';
import { SectionData, ProductInfo, SectionType, SECTION_LABELS } from './types';
import SectionEditor from './components/SectionEditor';
import MobilePreview from './components/MobilePreview';
import { usePageBuilder } from './hooks/usePageBuilder';
import { useCanva } from './hooks/useCanva';
import { useToastContext } from './contexts/ToastContext';
import { exportPreviewAsPng, downloadSingleImage } from './utils/exportUtils';
import { Smartphone, Layout, PlusCircle, Download, Undo2, Redo2, RotateCcw, Sparkles, FileDown, ImageDown, X } from 'lucide-react';

const INITIAL_SECTIONS: SectionData[] = [
  {
    id: '1',
    type: 'intro',
    title: '잠 못 드는 밤은 이제 끝!',
    subContent: '하루 5분 사용으로 꿀잠을 선물하는 기적의 베개',
    content: '',
    imageUrl: 'https://picsum.photos/seed/intro/800/800'
  },
  {
    id: '2',
    type: 'problem',
    title: '자고 일어나도 목이 뻐근하신가요?',
    content: '현대인의 80%가 겪는 거북목 증후군, 방치하면 디스크로 이어질 수 있습니다.',
    imageUrl: 'https://picsum.photos/seed/problem/800/600'
  },
  {
    id: '3',
    type: 'solution',
    title: '인체공학 설계로 해결했습니다.',
    content: 'C-커브를 완벽하게 지지하는 특허받은 디자인',
    imageUrl: 'https://picsum.photos/seed/solution/800/800',
    items: [
      { title: 'C-Curve 디자인', desc: '목의 자연스러운 곡선 유지' },
      { title: '고밀도 폼', desc: '꺼지지 않는 탄탄한 지지력' },
      { title: '에어 메쉬', desc: '365일 쾌적한 통기성' }
    ]
  },
  {
    id: 'gallery-1',
    type: 'gallery',
    title: '어디에나 어울리는 디자인',
    subContent: '모던한 침실 인테리어의 완성',
    content: '',
    imageUrls: [
      'https://picsum.photos/seed/g1/400/400',
      'https://picsum.photos/seed/g2/400/400',
      'https://picsum.photos/seed/g3/400/400',
      'https://picsum.photos/seed/g4/400/400',
    ]
  },
  {
    id: '4',
    type: 'detail',
    title: '계란 하나보다 가벼운 150g',
    subContent: '목에 부담을 주지 않는 최적의 무게',
    content: '하루 종일 착용하고 있어도 전혀 불편함이 없습니다. 기존 라텍스 베개보다 3배 더 가볍게 만들었습니다.',
    imageUrl: 'https://picsum.photos/seed/detail/800/600'
  },
  {
    id: '5',
    type: 'trust',
    title: '이미 10만 명이 경험했습니다',
    content: '',
    items: [
      { title: '김**님', desc: '진작 살 걸 그랬어요. 아침이 달라졌습니다.' },
      { title: '이**님', desc: '부모님 선물해드렸는데 너무 좋아하세요.' },
      { title: '박**님', desc: '재구매 의사 200%입니다.' }
    ]
  },
  {
    id: '6',
    type: 'info',
    title: '자주 묻는 질문',
    content: '배송은 주문 후 다음날 바로 출발합니다.',
    items: [
      { title: '세탁은 어떻게 하나요?', desc: '커버만 분리하여 세탁기 사용이 가능합니다.' },
      { title: '교환/반품이 가능한가요?', desc: '수령 후 7일 이내 무상 교환/반품 가능합니다.' }
    ]
  },
  {
    id: '7',
    type: 'cta',
    title: '지금 바로 구매하기',
    subContent: '오늘만 무료배송 + 30% 할인 혜택',
    content: ''
  }
];

function App() {
  const {
    product,
    setProduct,
    sections,
    updateSection,
    deleteSection,
    moveSection,
    addSection,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToDefault,
  } = usePageBuilder(INITIAL_SECTIONS);

  const { isReady: canvaReady, openInCanva } = useCanva();
  const { addToast } = useToastContext();

  const [viewMode, setViewMode] = useState<'both' | 'edit' | 'preview'>(
    window.innerWidth < 1024 ? 'edit' : 'both'
  );
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isExporting, setIsExporting] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  // Track the viewMode before mobile forced it to change
  const [prevDesktopMode, setPrevDesktopMode] = useState<'both' | 'edit' | 'preview'>('both');

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      const wasMobile = isMobile;
      setIsMobile(mobile);

      // Desktop → Mobile: save current mode and force single panel
      if (mobile && !wasMobile) {
        setPrevDesktopMode(viewMode);
        if (viewMode === 'both') {
          setViewMode('edit');
        }
      }

      // Mobile → Desktop: restore previous desktop mode
      if (!mobile && wasMobile) {
        setViewMode(prevDesktopMode);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, isMobile, prevDesktopMode]);

  // IntersectionObserver for scroll-linked highlighting
  useEffect(() => {
    const previewContainer = document.querySelector('[data-export-target]');
    if (!previewContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('preview-', '');
            setActiveSectionId(id);
          }
        }
      },
      { root: previewContainer, threshold: 0.3 }
    );

    sections.forEach(s => {
      const el = document.getElementById(`preview-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Filter sections that have AI-generated images
  const sectionsWithImages = sections.filter(s =>
    (s.imageUrl && s.imageUrl.startsWith('data:')) ||
    (s.imageUrls && s.imageUrls.some(url => url && url.startsWith('data:')))
  );

  const handleDownloadSingleImage = (dataUrl: string, sectionType: string, index?: number) => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = index !== undefined
      ? `${sectionType}-${index + 1}-${date}.png`
      : `${sectionType}-image-${date}.png`;
    downloadSingleImage(dataUrl, filename);
    addToast('이미지가 다운로드되었습니다!', 'success');
  };

  const handleExportPng = useCallback(async () => {
    setIsExporting(true);
    addToast('이미지 생성 중...', 'info', 2000);
    try {
      const prevMode = viewMode;
      if (viewMode === 'edit') {
        setViewMode('preview');
        await new Promise(r => setTimeout(r, 500));
      }
      await exportPreviewAsPng();
      addToast('이미지가 다운로드되었습니다!', 'success');
      if (prevMode === 'edit') setViewMode(prevMode);
    } catch (err) {
      addToast('이미지 내보내기에 실패했습니다.', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [viewMode, addToast]);

  const handleReset = () => {
    if (confirm('모든 내용을 초기 상태로 되돌리시겠습니까?')) {
      resetToDefault(INITIAL_SECTIONS);
      addToast('초기 상태로 되돌렸습니다.', 'info');
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-100 overflow-hidden">

      {/* ============ EDITOR PANEL ============ */}
      <div className={`flex-1 flex flex-col h-full min-w-0 overflow-x-hidden bg-white border-r border-gray-200 transition-all duration-300 ${viewMode === 'preview' ? 'hidden' : 'block'}`}>

        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-gray-100 bg-white z-10 flex-shrink-0">
          <div className="flex justify-between items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="truncate">상세페이지 메이커</span>
            </h1>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-25 transition-all"
                title="되돌리기 (Ctrl+Z)"
              >
                <Undo2 size={15} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-25 transition-all"
                title="다시 실행 (Ctrl+Y)"
              >
                <Redo2 size={15} />
              </button>

              <div className="w-px h-5 bg-gray-200 mx-0.5 sm:mx-1" />

              <button
                onClick={handleReset}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                title="초기화"
              >
                <RotateCcw size={15} />
              </button>

              {!isMobile && (
                <button
                  onClick={() => setShowSaveMenu(true)}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 shadow-sm hover:shadow-md ml-1"
                >
                  <Download size={15} />
                  이미지 저장
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Section List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 custom-scrollbar scroll-smooth">
          {/* Product Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 rounded-xl border border-indigo-100/50 space-y-2.5 mb-3 max-w-2xl mx-auto">
            <h2 className="text-[10px] font-bold uppercase text-indigo-500 tracking-widest">제품 정보 (AI 생성용)</h2>
            <input
              type="text"
              placeholder="제품명 (예: 꿀잠 베개)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white text-gray-900 placeholder-gray-400 transition-all"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="타겟 고객 (예: 직장인)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white text-gray-900 placeholder-gray-400 transition-all"
                value={product.targetAudience}
                onChange={(e) => setProduct({ ...product, targetAudience: e.target.value })}
              />
              <input
                type="text"
                placeholder="핵심 특징 (예: 메모리폼)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white text-gray-900 placeholder-gray-400 transition-all"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            {sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                product={product}
                onUpdate={updateSection}
                onDelete={deleteSection}
                onMoveUp={(id) => moveSection(id, 'up')}
                onMoveDown={(id) => moveSection(id, 'down')}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
                isActive={section.id === activeSectionId}
                canvaReady={canvaReady}
                onOpenCanva={openInCanva}
              />
            ))}

            {/* Add Section */}
            <div className="pt-4 pb-24">
              <div className="text-center">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-gray-300 rounded-2xl text-sm text-gray-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                >
                  <PlusCircle size={18} />
                  섹션 추가
                </button>
              </div>

              {showAddMenu && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 animate-fade-in-up">
                  {(['intro', 'problem', 'solution', 'gallery', 'detail', 'trust', 'info', 'cta'] as SectionType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        addSection(type);
                        setShowAddMenu(false);
                        addToast(`${SECTION_LABELS[type]} 섹션이 추가되었습니다.`, 'success');
                      }}
                      className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-600 font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                      {SECTION_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ PREVIEW PANEL ============ */}
      <div className={`relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transition-all duration-300 ${viewMode === 'edit' ? 'hidden' : 'flex-1'}`}>

        <div className={`h-full w-full flex items-center justify-center ${isMobile ? 'p-2 pb-20' : 'p-4'}`}>
          <MobilePreview sections={sections} />
        </div>
      </div>

      {/* ============ MOBILE TAB BAR ============ */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <button
            onClick={() => setViewMode('edit')}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              viewMode === 'edit' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <Layout size={20} />
            <span className="text-[10px] font-semibold">편집</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              viewMode === 'preview' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <Smartphone size={20} />
            <span className="text-[10px] font-semibold">미리보기</span>
          </button>
          <button
            onClick={() => setShowSaveMenu(true)}
            disabled={isExporting}
            className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400 disabled:opacity-50"
          >
            <Download size={20} />
            <span className="text-[10px] font-semibold">저장</span>
          </button>
        </div>
      )}

      {/* ============ SAVE MENU (BOTTOM SHEET) ============ */}
      {showSaveMenu && (
        <div className="fixed inset-0 z-[60] bg-black/40 animate-fade-in-up" onClick={() => setShowSaveMenu(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-base font-bold text-gray-900">이미지 저장</h3>
              <button
                onClick={() => setShowSaveMenu(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Full page export */}
              <button
                onClick={() => {
                  setShowSaveMenu(false);
                  handleExportPng();
                }}
                disabled={isExporting}
                className="w-full flex items-center gap-3 p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileDown size={20} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">전체 상세페이지 저장</div>
                  <div className="text-xs text-gray-400">모든 섹션을 하나의 이미지로 내보내기</div>
                </div>
              </button>

              {/* Individual images section */}
              {sectionsWithImages.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">개별 이미지 저장</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div className="space-y-2">
                    {sectionsWithImages.map(section => {
                      if (section.type === 'gallery' && section.imageUrls) {
                        // Gallery: show each image individually
                        return section.imageUrls.map((url, idx) => {
                          if (!url || !url.startsWith('data:')) return null;
                          return (
                            <button
                              key={`${section.id}-${idx}`}
                              onClick={() => handleDownloadSingleImage(url, section.type, idx)}
                              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all group"
                            >
                              <img
                                src={url}
                                alt={`갤러리 ${idx + 1}`}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                              />
                              <div className="text-left flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 truncate">
                                  {SECTION_LABELS[section.type]} - {idx + 1}번
                                </div>
                              </div>
                              <ImageDown size={18} className="text-gray-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                            </button>
                          );
                        });
                      }

                      // Single image sections
                      if (!section.imageUrl || !section.imageUrl.startsWith('data:')) return null;
                      return (
                        <button
                          key={section.id}
                          onClick={() => handleDownloadSingleImage(section.imageUrl!, section.type)}
                          className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all group"
                        >
                          <img
                            src={section.imageUrl}
                            alt={SECTION_LABELS[section.type]}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                          />
                          <div className="text-left flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">
                              {SECTION_LABELS[section.type]}
                            </div>
                          </div>
                          <ImageDown size={18} className="text-gray-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* No images message */}
              {sectionsWithImages.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <ImageDown size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">AI로 생성된 이미지가 없습니다.</p>
                  <p className="text-xs mt-1">섹션 편집에서 이미지를 생성해 주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
