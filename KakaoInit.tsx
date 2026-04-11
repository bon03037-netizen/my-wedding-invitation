"use client";

import Script from "next/script";

/**
 * 전역 Kakao SDK 로드 및 단일 초기화 컴포넌트.
 * layout.tsx(Server Component)는 onLoad 콜백을 직접 가질 수 없으므로
 * 이 Client Component를 layout에 삽입합니다.
 */
export default function KakaoInit() {
  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
      integrity="sha384-TiCmbVXZbxeUKRNDg-Nmg22zePe10Fwt//Dkpsg1fE2uIeL1QZdBjIfXkE8O2P8n"
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        // isInitialized() 체크로 중복 초기화 완전 방지
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "");
        }
      }}
    />
  );
}
