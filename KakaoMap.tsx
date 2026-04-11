"use client";

import { useEffect, useRef, useState } from "react";

interface KakaoMapProps {
  address: string;
}

export default function KakaoMap({ address }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("지도 준비 중...");

  useEffect(() => {
    if (!address?.trim()) {
      setStatus("주소가 없습니다.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      // ── 1. 서버 프록시를 통해 좌표 조회 ─────────────────────────────
      // 브라우저에서 카카오 로컬 REST API를 직접 호출하면 CORS 차단이 발생하므로
      // /api/address 프록시를 경유합니다. query는 여기서도 인코딩합니다.
      let x: number, y: number;
      try {
        const res = await fetch(
          `/api/address?query=${encodeURIComponent(address.trim())}`
        );

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          console.error(
            `[KakaoMap] 주소 API 오류 — HTTP ${res.status}`,
            json.error ?? "(응답 없음)"
          );
          if (!cancelled)
            setStatus(`주소를 찾을 수 없습니다. (오류 ${res.status})`);
          return;
        }

        const json = await res.json();
        const doc = json.documents?.[0];
        if (!doc) {
          if (!cancelled)
            setStatus(`주소 검색 결과가 없습니다.\n"${address}"`);
          return;
        }

        // 카카오 로컬 API 응답: 최상위 x(경도) · y(위도) 사용
        x = Number(doc.x);
        y = Number(doc.y);

        if (isNaN(x) || isNaN(y)) {
          if (!cancelled) setStatus("좌표를 가져올 수 없습니다.");
          return;
        }
      } catch (err) {
        console.error("[KakaoMap] fetch 오류:", err);
        if (!cancelled) setStatus("네트워크 오류가 발생했습니다.");
        return;
      }

      if (cancelled) return;

      // ── 2. Kakao Maps SDK로 지도 렌더링 ──────────────────────────────
      // Geocoder는 더 이상 사용하지 않으므로 libraries=services 불필요
      const renderMap = () => {
        if (cancelled || !mapRef.current) return;

        const kakao = (window as any).kakao;
        kakao.maps.load(() => {
          if (cancelled || !mapRef.current) return;

          const latLng = new kakao.maps.LatLng(y, x);
          const map = new kakao.maps.Map(mapRef.current, {
            center: latLng,
            level: 3,
            draggable: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            keyboardShortcuts: false,
          });
          map.setZoomable(false);
          new kakao.maps.Marker({ map, position: latLng });

          const ro = new ResizeObserver(() => {
            map.relayout();
            map.setCenter(latLng);
          });
          ro.observe(mapRef.current!);

          if (!cancelled) setStatus("");
        });
      };

      const scriptId = "kakao-map-sdk";
      const existing = document.getElementById(scriptId);

      // 스크립트 태그는 있는데 kakao 객체가 없으면 유령 태그이므로 제거
      if (existing && !(window as any).kakao?.maps) existing.remove();

      if ((window as any).kakao?.maps) {
        renderMap();
      } else {
        if (!cancelled) setStatus("지도 로드 중...");
        const script = document.createElement("script");
        script.id = scriptId;
        // autoload=false → kakao.maps.load() 콜백에서 안전하게 초기화
        script.src =
          `https://dapi.kakao.com/v2/maps/sdk.js` +
          `?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&autoload=false`;
        script.async = true;
        script.onload = renderMap;
        script.onerror = () => {
          console.error("[KakaoMap] Maps SDK 로드 실패 — NEXT_PUBLIC_KAKAO_MAP_APP_KEY를 확인하세요.");
          if (!cancelled) setStatus("지도 SDK를 불러오지 못했습니다.");
        };
        document.head.appendChild(script);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: "75%",
        borderRadius: "10px",
        border: "1px solid #333",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {status && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#111",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: "20px",
            textAlign: "center",
            fontSize: "13px",
            whiteSpace: "pre-wrap",
          }}
        >
          {status}
        </div>
      )}
      <div ref={mapRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
