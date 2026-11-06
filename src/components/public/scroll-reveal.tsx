
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: "up" | "left" | "right";
  delay?: number;
  className?: string;
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const hiddenPosition = {
    up: "translate-y-10",
    left: "-translate-x-10",
    right: "translate-x-10",
  }[direction];

  return (
    <div
      ref={elementRef}
      className={`transform-gpu transition-[opacity,transform] duration-1000 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `opacity-0 ${hiddenPosition}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
