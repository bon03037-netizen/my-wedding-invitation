"use client";

import { useRef, useState, RefObject } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilmGalleryProps {
  photos: string[];
  preview?: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

// ── Perforations ──────────────────────────────────────────────────────────────

function Perforations({ count = 13 }: { count?: number }) {
  return (
    <div
      style={{
        height: 20,
        background: "#080808",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 6px",
        flexShrink: 0,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 9,
            height: 11,
            background: "#181818",
            border: "0.5px solid #252525",
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ── Light Leak ────────────────────────────────────────────────────────────────

function LightLeak({ index }: { index: number }) {
  // Three warm-tone variants
  const variants = [
    { color: "18, 90%, 58%", delay: 0 },
    { color: "38, 88%, 62%", delay: 1.4 },
    { color: "8, 85%, 52%", delay: 0.7 },
  ];
  const v = variants[index % 3];

  return (
    <div style={{ height: 52, position: "relative", overflow: "hidden", background: "#060606" }}>
      <motion.div
        style={{
          position: "absolute",
          top: "-80%",
          left: 0,
          right: 0,
          height: "260%",
          background: `linear-gradient(90deg,
            transparent 0%,
            hsla(${v.color}, 0.05) 20%,
            hsla(${v.color}, 0.12) 45%,
            hsla(${v.color}, 0.08) 70%,
            transparent 100%)`,
          filter: "blur(10px)",
        }}
        animate={{ x: ["-35%", "35%", "-15%", "25%", "-35%"] }}
        transition={{
          duration: 6 + index * 1.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: v.delay,
        }}
      />
      <motion.div
        style={{ position: "absolute", inset: 0 }}
        animate={{ opacity: [0.3, 1, 0.2, 0.8, 0.3] }}
        transition={{
          duration: 4 + index * 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: v.delay * 0.5,
        }}
      />
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.97)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "zoom-out",
      }}
      onClick={onClose}
    >
      <motion.img
        src={src}
        alt=""
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          maxWidth: "92vw",
          maxHeight: "92svh",
          objectFit: "contain",
          cursor: "default",
          boxShadow: "0 0 80px rgba(0,0,0,0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#777",
          cursor: "pointer",
        }}
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}

// ── Film Card ─────────────────────────────────────────────────────────────────

function FilmCard({
  src,
  index,
  total,
  preview,
  onLightbox,
  scrollContainerRef,
}: {
  src: string | null;
  index: number;
  total: number;
  preview: boolean;
  onLightbox: (src: string) => void;
  scrollContainerRef?: RefObject<HTMLDivElement>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Track this card's position through the viewport (or overlay scroll container)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    ...(scrollContainerRef ? { container: scrollContainerRef } : {}),
    offset: ["start end", "end start"],
  });

  // ── 3D drum transforms ──────────────────────────────────────────
  // 0 = card entering from bottom → lean forward (+rotateX)
  // 0.5 = card centered in viewport → flat (0)
  // 1 = card leaving at top → lean backward (-rotateX)
  const rotateX = useTransform(scrollYProgress, [0, 0.36, 0.64, 1], [38, 0, 0, -38]);
  const scaleVal = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.9, 1, 1, 0.9]);
  const opacity  = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);

  const frameNum = String(index + 1).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");

  // ── Film card markup ────────────────────────────────────────────
  const cardContent = (
    <div
      style={{
        background: "#0a0a0a",
        borderRadius: 2,
        overflow: "hidden",
        width: "100%",
        boxShadow: "0 0 0 0.5px #1c1c1c, 0 12px 50px rgba(0,0,0,0.95)",
      }}
    >
      {/* Top perforations */}
      <Perforations />

      {/* Photo — 3:4 세로형 고정 프레임 */}
      <div
        style={{
          padding: "3px 10px",
          background: "#080808",
          position: "relative",
          cursor: src ? "zoom-in" : "default",
        }}
        onClick={() => src && onLightbox(src)}
      >
        {src ? (
          <div
            style={{
              width: "100%",
              aspectRatio: "3 / 4",
              overflow: "hidden",
              position: "relative",
            }}
          >
          <img
            src={src}
            alt={`photo ${index + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 25%",
              display: "block",
            }}
          />
          </div>
        ) : (
          /* ── Placeholder (unexposed film) ── */
          <div
            style={{
              width: "100%",
              height: 220,
              background: "linear-gradient(145deg, #111 0%, #0d0d0d 50%, #131313 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#282828" strokeWidth="0.8">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </motion.div>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 8,
                letterSpacing: "0.3em",
                color: "#1e1e1e",
                textTransform: "uppercase",
              }}
            >
              Unexposed
            </span>
          </div>
        )}

        {/* Film grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: "3px 10px",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.06'/%3E%3C/svg%3E\")",
            pointerEvents: "none",
            mixBlendMode: "overlay",
            opacity: 0.6,
          }}
        />
      </div>

      {/* Bottom perforations */}
      <Perforations />

      {/* Edge text bar — Kodak style */}
      <div
        style={{
          height: 15,
          background: "#050505",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 7,
            color: "rgba(255,160,0,0.22)",
            letterSpacing: "0.18em",
          }}
        >
          ○ {frameNum}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 7,
            color: "rgba(255,160,0,0.16)",
            letterSpacing: "0.1em",
          }}
        >
          KODAK GOLD 200 ✦ 135-36
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 7,
            color: "rgba(255,160,0,0.22)",
            letterSpacing: "0.18em",
          }}
        >
          {frameNum}/{totalStr} ▷
        </span>
      </div>
    </div>
  );

  // ── Preview mode: flat, no 3D ───────────────────────────────────
  if (preview) {
    return (
      <div ref={cardRef} style={{ padding: "0 14px" }}>
        {cardContent}
      </div>
    );
  }

  // ── Full mode: 3D drum scroll ───────────────────────────────────
  return (
    <div
      ref={cardRef}
      style={{
        padding: "0 28px",
        perspective: "1200px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <motion.div
        style={{
          rotateX,
          scale: scaleVal,
          opacity,
          transformOrigin: "50% 50%",
        }}
      >
        {cardContent}
      </motion.div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function FilmGallery({ photos, preview = false, scrollContainerRef }: FilmGalleryProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Show placeholders when no photos uploaded
  const hasPhotos = photos.length > 0;
  const items: (string | null)[] = hasPhotos ? photos : [null, null, null];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((src, i) => (
          <div key={i}>
            <FilmCard
              src={src}
              index={i}
              total={items.length}
              preview={preview}
              onLightbox={setLightboxSrc}
              scrollContainerRef={scrollContainerRef}
            />
            {/* Light leak between cards (not after last) */}
            {i < items.length - 1 && <LightLeak index={i} />}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
