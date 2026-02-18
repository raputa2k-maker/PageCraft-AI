import html2canvas from 'html2canvas';

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

  // 상태바 둥근 모서리 제거
  const statusBar = clone.querySelector('.rounded-t-\\[2rem\\]') as HTMLElement;
  if (statusBar) {
    statusBar.style.borderRadius = '0';
  }

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
