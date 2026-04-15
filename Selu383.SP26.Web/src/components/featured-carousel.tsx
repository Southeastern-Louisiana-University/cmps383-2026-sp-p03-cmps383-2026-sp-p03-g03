import React, { useState, useEffect, useRef } from "react";
import type { MenuItem } from "../api/dto-interfaces";
import { Tokens } from "../styles/tokens.ts";
import { ImageWithFallback } from "./image-with-fallback.tsx";
import "./featured-carousel.css";

const bgColors = ["#4A3B32", "#2A3C24", "#6B4423", "#382E29"];

export default function FeaturedCarousel({
  data = [] as MenuItem[],
  activeSlide = 0,
}: {
  data?: MenuItem[];
  activeSlide?: number;
}) {
  const [current, setCurrent] = useState(activeSlide);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const len = data.length;
  const next = () => setCurrent((current + 1) % len);
  const prev = () => setCurrent((current - 1 + len) % len);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || len === 0) return;

    const timer = setInterval(() => {
      next();
    }, 5000);

    return () => clearInterval(timer);
  }, [current, isPaused, len]);

  if (!data || data.length === 0) return null;

  const getStyles = (index: number): React.CSSProperties => {
    const spread = Math.max(140, width * 0.4);
    let diff = index - current;

    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;

    if (diff === 0)
      return {
        opacity: 1,
        transform: "translateX(0px) translateZ(0px) rotateY(0deg)",
        zIndex: 10,
      };
    else if (diff === -1)
      return {
        opacity: 1,
        transform: `translateX(-${spread}px) translateZ(-300px) rotateY(35deg)`,
        zIndex: 9,
      };
    else if (diff === 1)
      return {
        opacity: 1,
        transform: `translateX(${spread}px) translateZ(-300px) rotateY(-35deg)`,
        zIndex: 9,
      };
    else if (diff === -2)
      return {
        opacity: 1,
        transform: `translateX(-${spread * 1.7}px) translateZ(-500px) rotateY(35deg)`,
        zIndex: 8,
      };
    else if (diff === 2)
      return {
        opacity: 1,
        transform: `translateX(${spread * 1.7}px) translateZ(-500px) rotateY(-35deg)`,
        zIndex: 8,
      };
    else
      return {
        opacity: 0,
        transform: "translateX(0px) translateZ(-500px) rotateY(0deg)",
        zIndex: 7,
        pointerEvents: "none",
      };
  };

  return (
    <div
      className="carousel-container"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="slideC">
        {data.map((item, i) => {
          const bgColor = bgColors[i % bgColors.length];
          return (
            <React.Fragment key={item.id || i}>
              <div
                className="slide"
                style={{
                  background: bgColor,
                  boxShadow: `0 5px 20px ${bgColor}80`,
                  ...getStyles(i),
                }}
              >
                <SliderContent item={item} />
              </div>
              <div
                className="reflection"
                style={{
                  background: `linear-gradient(to bottom, ${bgColor}40, transparent)`,
                  ...getStyles(i),
                }}
              />
            </React.Fragment>
          );
        })}
      </div>

      <div className="btns">
        <button className="btn" onClick={prev}>
          &larr;
        </button>
        <button className="btn" onClick={next}>
          &rarr;
        </button>
      </div>
    </div>
  );
}

const SliderContent = ({ item }: { item: MenuItem }) => {
  let imgSrc = Tokens.cafeImg;
  const cat = item.category?.toLowerCase() || "";
  if (cat.includes("drink")) imgSrc = Tokens.icedImg;
  if (cat.includes("crepe")) imgSrc = Tokens.crepeImg;

  return (
    <div className="sliderContent">
      <div className="slide-media">
        <ImageWithFallback
          src={imgSrc}
          alt={item.name}
          className="slide-image"
        />
      </div>
      <div className="slide-text">
        <span className="slide-kicker">{item.category}</span>
        <h2 className="slide-title">{item.name}</h2>
        <p className="slide-desc">{item.desc}</p>
        <div className="slide-footer">
          <span className="slide-price">${item.price?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
