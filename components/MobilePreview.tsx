import React from 'react';
import { SectionData } from '../types';
import { Star, CheckCircle, Shield } from 'lucide-react';

interface MobilePreviewProps {
  sections: SectionData[];
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ sections }) => {
  const renderSectionContent = (section: SectionData) => {
    switch (section.type) {
      case 'intro':
        return (
          <div className="relative">
            {section.imageUrl ? (
              <div className="relative">
                <img src={section.imageUrl} alt="Intro" className="w-full h-96 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2
                    className="text-2xl font-black leading-tight mb-2 text-white break-keep drop-shadow-lg"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {section.title}
                  </h2>
                  <p className="text-sm text-white/85 font-medium break-keep" style={{ lineHeight: '1.7' }}>
                    {section.subContent}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white text-center">
                <h2 className="text-2xl font-black leading-tight mb-3 break-keep" style={{ letterSpacing: '-0.02em' }}>
                  {section.title}
                </h2>
                <p className="text-sm text-white/80 font-medium break-keep" style={{ lineHeight: '1.7' }}>
                  {section.subContent}
                </p>
              </div>
            )}
          </div>
        );

      case 'problem':
        return (
          <div className="bg-gradient-to-b from-rose-50 to-white px-6 py-10">
            <div className="text-center mb-6">
              <h3
                className="text-xl font-bold text-gray-900 mb-2 break-keep leading-snug"
                style={{ letterSpacing: '-0.01em' }}
              >
                {section.title}
              </h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100">
              {section.imageUrl && (
                <img src={section.imageUrl} className="w-full rounded-xl mb-4" alt="Problem" />
              )}
              <p className="text-gray-600 text-sm leading-7 break-keep">{section.subContent || section.content}</p>
            </div>
          </div>
        );

      case 'solution':
        return (
          <div className="bg-white px-6 py-10">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
                SOLUTION
              </span>
              <h3
                className="text-2xl font-bold text-gray-900 leading-tight break-keep"
                style={{ letterSpacing: '-0.02em' }}
              >
                {section.title}
              </h3>
            </div>
            {section.imageUrl && (
              <img src={section.imageUrl} className="w-full rounded-2xl mb-6 shadow-md" alt="Product" />
            )}
            <div className="space-y-3">
              {section.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-l-4 border-indigo-500 shadow-sm"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="bg-gray-50 py-10 px-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1 break-keep">{section.title}</h3>
              <p className="text-sm text-gray-500">{section.subContent}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {section.imageUrls?.map((url, i) =>
                url ? (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden shadow-sm aspect-square"
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      alt={`Gallery ${i}`}
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        );

      case 'detail':
        return (
          <div className="py-10 px-6 bg-white">
            <div className="mb-5">
              <h3
                className="text-xl font-bold text-gray-900 mb-2 leading-tight break-keep"
                style={{ letterSpacing: '-0.01em' }}
              >
                {section.title}
              </h3>
              {section.subContent && (
                <p className="text-sm text-indigo-600 font-semibold">{section.subContent}</p>
              )}
            </div>
            {section.imageUrl && (
              <img src={section.imageUrl} className="w-full rounded-2xl mb-5 shadow-sm" alt="Detail" />
            )}
            <p className="text-gray-700 text-sm leading-7 break-keep">{section.content}</p>
            {/* Decorative divider */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
        );

      case 'trust':
        return (
          <div className="bg-gradient-to-b from-gray-50 to-white py-10 px-6">
            <h3 className="text-center text-xl font-bold mb-3 break-keep">{section.title}</h3>

            {/* Aggregate Rating */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-700">4.9</span>
                <span className="text-xs text-gray-400">({section.items?.length || 0}건)</span>
              </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-3">
              {section.items?.map((review, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {review.title.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{review.title}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Shield size={11} />
                      <span className="text-[10px] font-semibold">구매 인증</span>
                    </div>
                  </div>
                  <div className="flex text-amber-400 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed break-keep">"{review.desc}"</p>
                </div>
              ))}
            </div>


            {section.imageUrl && (
              <div className="mt-6 text-center">
                <img
                  src={section.imageUrl}
                  className="inline-block max-h-20 grayscale opacity-60"
                  alt="Certifications"
                />
              </div>
            )}
          </div>
        );

      case 'info':
        return (
          <div className="bg-white py-10 px-6">
            <h3 className="text-lg font-bold mb-6 text-gray-900">{section.title}</h3>
            <div className="space-y-3">
              {section.items?.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <span className="text-indigo-600 font-bold text-sm flex-shrink-0 mt-0.5">Q.</span>
                    <span className="font-medium text-sm text-gray-800">{faq.title}</span>
                  </div>
                  <div className="pl-6">
                    <div className="flex gap-2 items-start">
                      <span className="font-bold text-emerald-600 text-sm flex-shrink-0 mt-0.5">A.</span>
                      <p className="text-xs text-gray-500 leading-relaxed">{faq.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="bg-white border-t border-gray-100 p-5">
            {section.imageUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden shadow-sm">
                <img src={section.imageUrl} alt="Product" className="w-full object-cover" />
              </div>
            )}
            <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl text-base shadow-lg text-center break-keep leading-snug" style={{ letterSpacing: '-0.01em' }}>
              {section.title}
            </div>
            {section.subContent && (
              <p className="text-center text-xs text-gray-400 mt-3">{section.subContent}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      data-export-target
      className="mx-auto w-full max-w-[375px] bg-white h-full overflow-y-auto no-scrollbar shadow-2xl border-x border-gray-200 relative rounded-[2rem]"
    >
      {/* iPhone Status Bar - iOS 17 Style */}
      <div className="bg-black sticky top-0 z-50 rounded-t-[2rem]">
        {/* Top safe area + status icons */}
        <div className="relative px-6 pt-3 pb-3 flex items-center justify-between">
          {/* Left: Time */}
          <span className="text-white text-[15px] font-semibold tracking-tight" style={{ fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif', fontFeatureSettings: '"tnum"' }}>
            9:41
          </span>

          {/* Center: Dynamic Island */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2">
            <div className="w-[120px] h-[32px] bg-black rounded-full flex items-center justify-center relative">
              {/* Camera lens */}
              <div className="absolute right-[22px] w-[10px] h-[10px] rounded-full bg-[#1a1a2e] ring-1 ring-[#2a2a3e]">
                <div className="absolute inset-[2.5px] rounded-full bg-[#0d0d1a] ring-1 ring-[#1e1e35]/50" />
              </div>
            </div>
          </div>

          {/* Right: Signal + WiFi + Battery */}
          <div className="flex items-center gap-[6px]">
            {/* Cellular Signal Bars */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="9" width="3" height="3" rx="0.75" fill="white" />
              <rect x="4.5" y="6" width="3" height="6" rx="0.75" fill="white" />
              <rect x="9" y="3" width="3" height="9" rx="0.75" fill="white" />
              <rect x="13.5" y="0" width="3" height="12" rx="0.75" fill="white" />
            </svg>

            {/* WiFi Icon */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 10.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" fill="white" />
              <path d="M4.94 8.44a4.34 4.34 0 0 1 6.12 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M2.52 5.87a7.68 7.68 0 0 1 10.96 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M0.26 3.3a11.02 11.02 0 0 1 15.48 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            </svg>

            {/* Battery */}
            <div className="flex items-center">
              <div className="w-[25px] h-[12px] border-[1.5px] border-white/90 rounded-[3.5px] relative overflow-hidden">
                <div
                  className="absolute top-[1.5px] left-[1.5px] bottom-[1.5px] bg-white rounded-[1.5px]"
                  style={{ width: 'calc(80% - 3px)' }}
                />
              </div>
              <div className="w-[1.5px] h-[5px] bg-white/90 rounded-r-full ml-[1px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="pb-0">
        {sections.map((section, idx) => (
          <React.Fragment key={section.id}>
            {idx > 0 && section.type !== 'cta' && (
              <div className="h-2 bg-gray-100" />
            )}
            <div id={`preview-${section.id}`}>
              {renderSectionContent(section)}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* iPhone Home Indicator */}
      <div className="sticky bottom-0 bg-white pt-2 pb-3 flex justify-center">
        <div className="w-[134px] h-[5px] bg-gray-900/20 rounded-full" />
      </div>
    </div>
  );
};

export default MobilePreview;
