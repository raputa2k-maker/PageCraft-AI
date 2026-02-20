import html2canvas from 'html2canvas';

/**
 * Download a single base64 image as a PNG file
 * AI 생성 이미지를 개별 다운로드
 */
export function downloadSingleImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export the mobile preview as a high-resolution PNG image
 * 미리보기를 임시 컨테이너에 클론하여 정확한 너비로 캡처
 */
export async function exportPreviewAsPng(): Promise<void> {
  const previewEl = document.querySelector('[data-export-target]');
  if (!previewEl) throw new Error('미리보기 요소를 찾을 수 없습니다.');

  const element = previewEl as HTMLElement;

  // 임시 래퍼를 만들어서 body에 붙이고, 그 안에 클론을 넣음
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '0';
  wrapper.style.top = '0';
  wrapper.style.width = '375px';
  wrapper.style.zIndex = '-9999';
  wrapper.style.opacity = '0';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.overflow = 'visible';

  // 요소 클론
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = '375px';
  clone.style.maxWidth = '375px';
  clone.style.margin = '0';
  clone.style.overflow = 'visible';
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.borderRadius = '0';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';

  // ① 상태바(iPhone Status Bar) 완전 제거 — 내보내기에 불필요
  const statusBar = clone.querySelector('.sticky.top-0.z-50') as HTMLElement;
  if (statusBar) {
    statusBar.remove();
  }

  // ② 홈 인디케이터(Home Indicator) 완전 제거
  const homeIndicator = clone.querySelector('.sticky.bottom-0') as HTMLElement;
  if (homeIndicator) {
    homeIndicator.remove();
  }

  // 남은 sticky 요소가 있으면 해제 (렌더링 문제 방지)
  clone.querySelectorAll('.sticky').forEach((el) => {
    (el as HTMLElement).style.position = 'relative';
  });

  // 섹션 구분선 가로줄 아티팩트 제거 (bg-gray-100 → 흰색 통일)
  clone.querySelectorAll('.bg-gray-100').forEach((el) => {
    (el as HTMLElement).style.backgroundColor = '#ffffff';
  });

  // border 아티팩트 제거
  clone.querySelectorAll('.border-t, .border-b, .border-x').forEach((el) => {
    (el as HTMLElement).style.border = 'none';
  });

  // ③ SVG 별(Star) 아이콘 → html2canvas 호환 처리
  // html2canvas는 fill="currentColor"를 제대로 렌더링 못하므로 실제 색상으로 교체
  clone.querySelectorAll('svg').forEach((svg) => {
    const computedColor = window.getComputedStyle(svg).color;
    svg.querySelectorAll('[fill="currentColor"]').forEach((el) => {
      el.setAttribute('fill', computedColor);
    });
    svg.querySelectorAll('[stroke="currentColor"]').forEach((el) => {
      el.setAttribute('stroke', computedColor);
    });
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 375,
      windowWidth: 375,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `detail-page-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    document.body.removeChild(wrapper);
  }
}
