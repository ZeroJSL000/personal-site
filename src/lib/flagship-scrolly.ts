import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initFlagshipScrolly() {
  const root = document.querySelector<HTMLElement>("[data-scrolly]");
  if (!root) return;

  const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
  const visuals = Array.from(root.querySelectorAll<HTMLElement>("[data-visual]"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const activate = (id: string) => {
    steps.forEach((step) => {
      step.classList.toggle("is-active", step.dataset.step === id);
    });
    visuals.forEach((visual) => {
      visual.classList.toggle("is-active", visual.dataset.visual === id);
    });
  };

  const firstId = steps[0]?.dataset.step ?? "problem";
  activate(firstId);

  if (reduced || steps.length === 0) {
    return;
  }

  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: "top 62%",
      end: "bottom 38%",
      onEnter: () => activate(step.dataset.step ?? ""),
      onEnterBack: () => activate(step.dataset.step ?? ""),
    });
  });
}
