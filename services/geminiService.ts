import { GoogleGenAI } from "@google/genai";
import { ProductInfo, SectionType } from "../types";

const getSystemInstruction = (type: SectionType) => {
  const base = `당신은 한국 이커머스 제품을 위한 세계적인 카피라이터입니다. 전환율이 높은 상세페이지를 만드는 것이 전문입니다.
  출력 언어: 한국어 (자연스럽고, 설득력 있고, 마케팅에 적합한 톤).
  형식: JSON.

  다음 섹션 유형에 대한 구체적인 규칙을 따르세요:
  `;

  switch (type) {
    case 'intro':
      return base + `
      작업: "인트로" 섹션을 만드세요.
      - 훅(Hook): 사용자의 삶이 어떻게 변화하는지에 집중하세요.
      - 톤: 공감하면서도 기대감을 주는 톤.
      - headline: 2줄 이내의 강렬한 메인 훅 문구.
      - subtext: 반드시 15자 이내! 짧고 임팩트 있는 한 줄 서브 카피. (예: "당신의 하루가 달라집니다", "작은 사치, 큰 행복")
      - JSON 출력 형식: { "headline": "메인 훅 문구", "subtext": "15자 이내 짧은 훅" }
      `;
    case 'problem':
      return base + `
      작업: "문제 제기" 섹션을 만드세요.
      - 문제 강조: "이런 경험 없으신가요?" 스타일.
      - 데이터나 흔한 상황을 사용하여 심각성을 강조하세요.
      - headline: 공감을 이끌어내는 질문형 헤드라인.
      - subtext: 고객이 겪는 구체적인 고통/불편 상황을 2~3문장으로 생생하게 묘사.
      - JSON 출력 형식: { "headline": "문제 질문", "subtext": "고통스러운 상황 설명 (2~3문장)" }
      `;
    case 'solution':
      return base + `
      작업: "해결책" 섹션을 만드세요.
      - 제품을 해결사(Hero)로 제시하세요.
      - 3가지 핵심 USP(Unique Selling Points)를 정의하세요. 짧고 간결하게.
      - JSON 출력 형식: { "headline": "해결책 선언", "items": [{ "title": "USP 1", "desc": "짧은 설명" }, { "title": "USP 2", "desc": "짧은 설명" }, { "title": "USP 3", "desc": "짧은 설명" }] }
      `;
    case 'gallery':
      return base + `
      작업: "갤러리" 섹션의 문구를 만드세요.
      - 제품의 아름다움이나 활용성을 강조하는 짧은 문구.
      - JSON 출력 형식: { "headline": "감성적인 헤드라인", "subtext": "제품의 분위기를 설명하는 짧은 문장" }
      `;
    case 'detail':
      return base + `
      작업: "디테일" 섹션을 만드세요. 기능보다는 혜택(Benefit)에 집중하세요.
      - 기술적 스펙을 사용자 혜택으로 변환하세요 (예: "10000mAh" -> "하루 종일 가는 배터리").
      - JSON 출력 형식: { "headline": "혜택 중심 헤드라인", "subtext": "핵심 포인트를 한 줄로 요약", "body": "이것이 왜 중요한지 자세한 설명." }
      `;
    case 'trust':
      return base + `
      작업: "신뢰(Trust)" 섹션을 만드세요.
      - 3개의 현실적인 베스트 리뷰 또는 신뢰 포인트(인증)를 생성하세요.
      - JSON 출력 형식: { "headline": "검증된 리뷰 / 인증", "items": [{ "title": "리뷰어/인증 이름", "desc": "리뷰 내용 또는 인증 세부 사항" }, ...] }
      `;
    case 'info':
      return base + `
      작업: "FAQ" 콘텐츠를 만드세요.
      - 3가지 흔한 거절 사유(배송, 환불, 사용법)를 다루세요.
      - JSON 출력 형식: { "headline": "자주 묻는 질문", "items": [{ "title": "질문", "desc": "답변" }, ...] }
      `;
    case 'cta':
      return base + `
      작업: "구매 유도(CTA)" 섹션을 만드세요.
      - 긴급성: 한정된 시간, 특별한 제안.
      - JSON 출력 형식: { "headline": "강력한 CTA 헤드라인", "subtext": "구체적인 제안 내용 (예: 오늘만 무료배송)" }
      `;
    default:
      return base;
  }
};

export const generateSectionCopy = async (
  product: ProductInfo,
  sectionType: SectionType
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
  제품명: ${product.name}
  제품 설명: ${product.description}
  타겟 고객: ${product.targetAudience}

  위 정보를 바탕으로 '${sectionType}' 섹션에 들어갈 콘텐츠를 생성해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: getSystemInstruction(sectionType),
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI 응답이 없습니다.");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateSectionImage = async (
  product: ProductInfo,
  sectionType: SectionType,
  currentContent: { title: string, content: string }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
  제품명: ${product.name}
  제품 설명: ${product.description}

  이 제품의 상세페이지 '${sectionType}' 섹션에 들어갈 고화질의 마케팅용 이미지를 생성해주세요.

  섹션 맥락:
  제목: ${currentContent.title}
  내용: ${currentContent.content}

  스타일: 한국 이커머스 감성, 깔끔함, 고화질, 텍스트가 없는 사진.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("이미지 생성에 실패했습니다.");
  } catch (error) {
    console.error("Gemini Image API Error:", error);
    throw error;
  }
};

export const generateGalleryImages = async (
  product: ProductInfo,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const promptVariations = [
    "제품의 클로즈업 샷, 디테일 강조, 고화질",
    "제품을 실제로 사용하고 있는 자연스러운 라이프스타일 컷",
    "제품이 멋진 인테리어 공간에 놓여있는 연출 컷",
    "제품의 특징을 잘 보여주는 깔끔한 스튜디오 컷"
  ];

  let completedCount = 0;

  const generateSingleImage = async (style: string) => {
    const prompt = `
    제품명: ${product.name}
    제품 설명: ${product.description}

    이 제품의 마케팅용 고화질 사진을 생성해주세요.
    스타일: ${style}
    분위기: 한국 감성, 인스타 감성, 깨끗함, 텍스트 없음.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: "1:1" },
      }
    });

    completedCount++;
    onProgress?.(completedCount, promptVariations.length);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  };

  try {
    const results = await Promise.all(promptVariations.map(style => generateSingleImage(style)));
    return results.filter((img): img is string => img !== null);
  } catch (error) {
    console.error("Gemini Gallery Generation Error:", error);
    throw error;
  }
};
