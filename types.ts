export type SectionType =
  | 'intro'
  | 'problem'
  | 'solution'
  | 'gallery'
  | 'detail'
  | 'trust'
  | 'info'
  | 'cta';

export interface SectionData {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  subContent?: string;
  imageUrl?: string;
  imageUrls?: string[];
  items?: { title: string; desc: string }[];
}

export interface ProductInfo {
  name: string;
  description: string;
  targetAudience: string;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  intro: '인트로 (Hook)',
  problem: '문제 제기 (공감)',
  solution: '해결책 (USP)',
  gallery: '갤러리 (이미지)',
  detail: '디테일 (혜택)',
  trust: '신뢰 (리뷰/인증)',
  info: '정보 & FAQ',
  cta: '구매 유도 (CTA)',
};

export const SECTION_GUIDES: Record<SectionType, string> = {
  intro: "후킹 & 공감: '이 제품을 쓰면 내 삶이 어떻게 변하는가?'에 집중하세요.",
  problem: "문제 제기: '혹시 이런 경험 없으신가요?' 불편한 상황을 재현하세요.",
  solution: "해결책: 제품을 해결사로 등장시키고 핵심 USP 3가지를 요약하세요.",
  gallery: "제품 갤러리: 다양한 연출컷과 디테일컷을 콜라쥬로 보여주세요.",
  detail: "디테일 & 혜택: 기능(Feature)을 혜택(Benefit)으로 바꿔서 설명하세요.",
  trust: "신뢰 구축: 리뷰, 인증, 비포/애프터 등 객관적 증거를 보여주세요.",
  info: "정보 & FAQ: 필수 정보와 구매 망설임을 없애는 Q&A를 작성하세요.",
  cta: "구매 유도: '오늘만 무료배송', '한정수량' 등 강력한 혜택을 제시하세요."
};
