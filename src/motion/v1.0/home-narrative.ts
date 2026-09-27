/**
 * Home motion v1.0 — frozen 2026-09-16.
 * Canonical copy: this file. Do not change unless a new version is requested.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSignalField } from "./signal-field";

gsap.registerPlugin(ScrollTrigger);

export function initHomeNarrative() {
  const stage = document.querySelector<HTMLElement>("[data-home-stage]");
  const canvas = document.querySelector<HTMLCanvasElement>("#signal-canvas");
  if (!stage || !canvas) return;

  const field = initSignalField(canvas);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const beats = Array.from(document.querySelectorAll<HTMLElement>("[data-beat]"));
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-featured-card]"));

  if (reduced) {
    field.setProgress(1);
    beats.forEach((el) => el.classList.add("is-on"));
    cards.forEach((el) => el.classList.add("is-in"));
    return () => field.destroy();
  }

  gsap.set(beats, { autoAlpha: 0, y: 16 });
  const firstBeat = beats[0];
  const secondBeat = beats[1];
  const thirdBeat = beats[2];
  if (firstBeat) gsap.set(firstBeat, { autoAlpha: 1, y: 0 });
  gsap.set(cards, { autoAlpha: 0, y: 28 });

  // CSS sticky owns the hold. ScrollTrigger only maps native scroll progress
  // to the narrative, which avoids the extra spacer and pin jitter.
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.35,
      invalidateOnRefresh: true,
      onUpdate(self) {
        field.setProgress(self.progress);
      },
    },
  });

  // Timeline positions mirror the canvas phases: noise, formation, decision.
  if (firstBeat && secondBeat && thirdBeat) {
    tl.to({}, { duration: 0.14 }, 0)
      .to(firstBeat, { autoAlpha: 0, y: -10, duration: 0.1 }, 0.2)
      .fromTo(
        secondBeat,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.12 },
        0.25,
      )
      .to(secondBeat, { autoAlpha: 0, y: -10, duration: 0.1 }, 0.52)
      .fromTo(
        thirdBeat,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.12 },
        0.58,
      )
      .to({}, { duration: 0.3 }, 0.7);
  }

  const featuredTrigger = ScrollTrigger.create({
    trigger: "[data-featured]",
    start: "top 85%",
    once: true,
    onEnter() {
      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "power2.out",
      });
    },
  });

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    featuredTrigger.kill();
    field.destroy();
  };
}
