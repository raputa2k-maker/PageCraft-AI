# 상세페이지 메이커 (Detail Page Builder)

AI 기반 고전환율 이커머스 상세페이지 빌더

## Features

- **AI 카피라이팅**: Gemini AI가 섹션별 마케팅 카피를 자동 생성
- **AI 이미지 생성**: 제품 사진을 AI로 자동 생성
- **실시간 미리보기**: iPhone 목업으로 모바일 상세페이지 미리보기
- **PNG 내보내기**: 상세페이지를 고해상도 이미지로 다운로드
- **Undo/Redo**: 작업 되돌리기/다시하기 지원
- **자동 저장**: localStorage에 자동 저장 및 복원
- **Canva 연동**: 이미지를 Canva에서 편집

## 섹션 구조

1. **인트로 (Hook)** - 강렬한 첫인상
2. **문제 제기 (공감)** - 고객의 고통 포인트
3. **해결책 (USP)** - 제품의 핵심 가치
4. **갤러리 (이미지)** - 다양한 제품 이미지
5. **디테일 (혜택)** - 기능을 혜택으로 변환
6. **신뢰 (리뷰/인증)** - 사회적 증거
7. **정보 & FAQ** - 구매 망설임 해소
8. **구매 유도 (CTA)** - 행동 유도

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Set the `API_KEY` in `.env.local` to your Gemini API key:
   ```
   API_KEY=your_gemini_api_key_here
   ```
3. Run the app:
   ```
   npm run dev
   ```

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS (CDN)
- Google Gemini AI (`@google/genai`)
- html2canvas (PNG export)
- Lucide React (icons)
