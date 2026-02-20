import React, { useState } from 'react';
import { SectionData, SECTION_GUIDES, SECTION_LABELS, ProductInfo, SectionType } from '../types';
import { Sparkles, Trash2, ChevronDown, ChevronUp, GripVertical, Image as ImageIcon, Loader2, Link } from 'lucide-react';
import { generateSectionCopy, generateSectionImage, generateGalleryImages } from '../services/geminiService';
import { useToastContext } from '../contexts/ToastContext';
import SkeletonLoader from './SkeletonLoader';

interface SectionEditorProps {
  section: SectionData;
  product: ProductInfo;
  onUpdate: (id: string, data: Partial<SectionData>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
  canvaReady: boolean;
  onOpenCanva: (imageUrl: string) => void;
}

const TYPE_COLORS: Record<SectionType, string> = {
  intro: 'bg-violet-100 text-violet-700 border-violet-200',
  problem: 'bg-rose-100 text-rose-700 border-rose-200',
  solution: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  gallery: 'bg-purple-100 text-purple-700 border-purple-200',
  detail: 'bg-sky-100 text-sky-700 border-sky-200',
  trust: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-teal-100 text-teal-700 border-teal-200',
  cta: 'bg-red-100 text-red-700 border-red-200',
};

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  product,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isActive,
  canvaReady,
  onOpenCanva,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState({ completed: 0, total: 4 });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const { addToast } = useToastContext();

  const handleGenerateAI = async () => {
    if (!product.name || !product.description) {
      addToast("상단의 제품 정보를 먼저 입력해주세요!", "warning");
      return;
    }

    setIsGeneratingText(true);
    try {
      const generated = await generateSectionCopy(product, section.type);
      const updateData: Partial<SectionData> = {};

      // title 매핑: headline 또는 title
      if (generated.headline || generated.title) {
        updateData.title = generated.headline || generated.title;
      }
      // subContent 매핑: subtext, subtitle, sub_text 등
      if (generated.subtext || generated.subtitle || generated.sub_text || generated.subTitle) {
        updateData.subContent = generated.subtext || generated.subtitle || generated.sub_text || generated.subTitle;
      }
      // content 매핑: body, content, description, text 등
      if (generated.body || generated.content || generated.description || generated.text) {
        updateData.content = generated.body || generated.content || generated.description || generated.text;
      }
      // items 매핑
      if (generated.items) updateData.items = generated.items;

      onUpdate(section.id, updateData);
      addToast("AI 카피라이팅이 완료되었습니다!", "success");
    } catch (error) {
      addToast("콘텐츠 생성 실패. API 키를 확인하거나 다시 시도해주세요.", "error");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!product.name || !product.description) {
      addToast("상단의 제품 정보를 먼저 입력해주세요!", "warning");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const base64Image = await generateSectionImage(product, section.type, {
        title: section.title,
        content: section.content || section.subContent || ''
      });
      onUpdate(section.id, { imageUrl: base64Image });
      addToast("이미지가 생성되었습니다!", "success");
    } catch (error) {
      addToast("이미지 생성 실패. API 키를 확인하거나 다시 시도해주세요.", "error");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateGallery = async () => {
    if (!product.name || !product.description) {
      addToast("상단의 제품 정보를 먼저 입력해주세요!", "warning");
      return;
    }

    setIsGeneratingImage(true);
    setGalleryProgress({ completed: 0, total: 4 });
    try {
      const images = await generateGalleryImages(product, (completed, total) => {
        setGalleryProgress({ completed, total });
      });
      onUpdate(section.id, { imageUrls: images });
      addToast("갤러리 이미지 4장이 생성되었습니다!", "success");
    } catch (error) {
      addToast("갤러리 이미지 생성 실패. 잠시 후 다시 시도해주세요.", "error");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInputValue.trim()) {
      if (section.type === 'gallery') {
        const newUrls = [...(section.imageUrls || ['', '', '', ''])];
        const emptyIdx = newUrls.findIndex(u => !u);
        if (emptyIdx !== -1) {
          newUrls[emptyIdx] = urlInputValue.trim();
          onUpdate(section.id, { imageUrls: newUrls });
        }
      } else {
        onUpdate(section.id, { imageUrl: urlInputValue.trim() });
      }
      setUrlInputValue('');
      setShowUrlInput(false);
      addToast("이미지 URL이 적용되었습니다.", "info");
    }
  };

  return (
    <div
      className={`bg-white border rounded-xl shadow-sm overflow-hidden min-w-0 transition-all duration-300 animate-fade-in-up ${
        isActive
          ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md animate-pulse-glow'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Section Header */}
      <div
        className="px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex-shrink-0 ${TYPE_COLORS[section.type]}`}>
            {SECTION_LABELS[section.type]}
          </span>
          <span className="text-sm font-medium text-gray-600 truncate">
            {section.title || "제목 없음"}
          </span>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(section.id); }}
            disabled={isFirst}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-20 transition-all"
            title="위로 이동"
          >
            <ChevronUp size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(section.id); }}
            disabled={isLast}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-20 transition-all"
            title="아래로 이동"
          >
            <ChevronDown size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg ml-1 transition-all"
            title="삭제"
          >
            <Trash2 size={15} />
          </button>
          <div className={`ml-1 p-1.5 text-gray-400 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`}>
            <ChevronDown size={15} />
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-3 sm:p-5 space-y-4">
          {/* Coaching Guide */}
          <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-xs text-indigo-700 break-keep leading-relaxed flex items-start gap-2">
            <span className="text-base flex-shrink-0">💡</span>
            <span>{SECTION_GUIDES[section.type]}</span>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">제목 (헤드라인)</label>
            {isGeneratingText ? (
              <div className="border border-gray-200 rounded-xl px-4 py-2.5">
                <div className="h-5 animate-shimmer rounded-lg w-3/4" />
              </div>
            ) : (
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white text-gray-900 placeholder-gray-400 transition-all"
                placeholder="섹션 제목을 입력하세요"
              />
            )}
          </div>

          {/* Sub Content */}
          {(section.type === 'intro' || section.type === 'cta' || section.type === 'detail' || section.type === 'gallery' || section.type === 'problem') && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">부제 / 서브 텍스트</label>
              {isGeneratingText ? (
                <div className="border border-gray-200 rounded-xl px-4 py-2.5">
                  <div className="h-5 animate-shimmer rounded-lg w-5/6" />
                </div>
              ) : (
                <input
                  type="text"
                  value={section.subContent || ''}
                  onChange={(e) => onUpdate(section.id, { subContent: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="보조 설명을 입력하세요"
                />
              )}
            </div>
          )}

          {/* Body Content */}
          {section.type !== 'intro' && section.type !== 'cta' && section.type !== 'gallery' && section.type !== 'problem' && section.type !== 'trust' && section.type !== 'info' && section.type !== 'solution' && (
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">본문 내용</label>
              {isGeneratingText ? (
                <div className="border border-gray-200 rounded-xl px-4 py-3">
                  <SkeletonLoader type="text" />
                </div>
              ) : (
                <textarea
                  value={section.content}
                  onChange={(e) => onUpdate(section.id, { content: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm h-28 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none bg-white text-gray-900 placeholder-gray-400 transition-all leading-relaxed"
                  placeholder="상세 내용을 작성하세요..."
                />
              )}
            </div>
          )}

          {/* Gallery Image Grid Editor */}
          {section.type === 'gallery' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">갤러리 이미지 (4장)</label>
              {isGeneratingImage ? (
                <div>
                  <SkeletonLoader type="gallery" />
                  <div className="mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${(galleryProgress.completed / galleryProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2 font-medium">
                      {galleryProgress.completed}/{galleryProgress.total} 이미지 생성 완료
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden group transition-all hover:border-gray-300">
                      {section.imageUrls?.[idx] ? (
                        <>
                          <img src={section.imageUrls[idx]} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canvaReady && (
                                <button
                                  onClick={() => onOpenCanva(section.imageUrls![idx])}
                                  className="bg-[#00C4CC] text-white text-[9px] px-2 py-1 rounded-lg font-bold shadow-lg hover:bg-[#00B0B8] transition-colors"
                                >
                                  Canva
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const newUrls = [...(section.imageUrls || [])];
                                  newUrls[idx] = '';
                                  onUpdate(section.id, { imageUrls: newUrls });
                                }}
                                className="bg-red-500 text-white p-1 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <ImageIcon className="text-gray-300" size={24} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleGenerateGallery}
                disabled={isGeneratingImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGeneratingImage ? '갤러리 이미지 생성 중...' : 'AI 갤러리 이미지 일괄 생성'}
              </button>

              {/* URL Input for gallery */}
              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 mt-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-50 transition-all"
              >
                <Link size={12} />
                URL로 이미지 추가
              </button>
              {showUrlInput && (
                <div className="flex gap-2 mt-2 animate-fade-in-up">
                  <input
                    type="url"
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <button onClick={handleUrlSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                    적용
                  </button>
                </div>
              )}
            </div>
          ) : (section.type !== 'trust' && section.type !== 'info') && (
            /* Single Image Editor */
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">섹션 이미지</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
                {isGeneratingImage ? (
                  <SkeletonLoader type="image" />
                ) : section.imageUrl ? (
                  <div className="relative group w-full h-32 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden">
                    <img src={section.imageUrl} alt="Section" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canvaReady && (
                          <button
                            onClick={() => onOpenCanva(section.imageUrl!)}
                            className="bg-[#00C4CC] text-white text-[9px] px-2 py-1 rounded-lg font-bold shadow-lg"
                          >
                            Canva
                          </button>
                        )}
                        <button
                          onClick={() => onUpdate(section.id, { imageUrl: '' })}
                          className="bg-red-500 text-white p-1 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 sm:w-24 sm:h-24 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0">
                    <ImageIcon size={24} />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                  >
                    {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    {isGeneratingImage ? '이미지 생성 중...' : 'AI 이미지 생성'}
                  </button>
                  <button
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-50 transition-all"
                  >
                    <Link size={12} />
                    URL 직접 입력
                  </button>
                </div>
              </div>

              {showUrlInput && (
                <div className="flex gap-2 mt-3 animate-fade-in-up">
                  <input
                    type="url"
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <button onClick={handleUrlSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                    적용
                  </button>
                </div>
              )}
            </div>
          )}

          {/* List Items Editor */}
          {(section.type === 'solution' || section.type === 'info' || section.type === 'trust') && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.type === 'info' ? '질문 & 답변 (Q&A)' : section.type === 'trust' ? '리뷰 목록' : '핵심 포인트'}
              </label>
              {isGeneratingText ? (
                <div className="space-y-3 py-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex gap-2">
                      <div className="h-9 animate-shimmer rounded-lg flex-1" />
                      <div className="h-9 animate-shimmer rounded-lg flex-[2]" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {section.items?.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 sm:items-center group relative">
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-gray-400 font-mono w-4 text-center flex-shrink-0">{idx + 1}</span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...(section.items || [])];
                              newItems[idx] = { ...newItems[idx], title: e.target.value };
                              onUpdate(section.id, { items: newItems });
                            }}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                            placeholder="제목/질문"
                          />
                          <button
                            onClick={() => {
                              const newItems = (section.items || []).filter((_, i) => i !== idx);
                              onUpdate(section.id, { items: newItems.length > 0 ? newItems : [{ title: '', desc: '' }] });
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => {
                            const newItems = [...(section.items || [])];
                            newItems[idx] = { ...newItems[idx], desc: e.target.value };
                            onUpdate(section.id, { items: newItems });
                          }}
                          className="w-full sm:flex-[2] border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all ml-6 sm:ml-0"
                          style={{ width: 'calc(100% - 1.5rem)' }}
                          placeholder="설명/답변"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const newItems = [...(section.items || []), { title: "", desc: "" }];
                      onUpdate(section.id, { items: newItems });
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors mt-1"
                  >
                    + 항목 추가
                  </button>
                </>
              )}
            </div>
          )}

          {/* AI Text Generation Button */}
          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingText}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {isGeneratingText ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isGeneratingText ? 'AI 작성 중...' : 'AI 텍스트 자동 완성'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionEditor;
