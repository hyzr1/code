import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function startMotion(root: HTMLElement) {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".hero-content > *",
      { y: 32, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.15,
        stagger: 0.13,
        ease: "power3.out",
        clearProps: "transform,opacity",
      },
    );
    gsap.fromTo(
      ".front-nav > *",
      { y: -12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        clearProps: "transform,opacity",
      },
    );
    gsap.to(".atmosphere-beam", {
      xPercent: 22,
      rotation: 12,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 3,
      scrollTrigger: {
        trigger: ".hero",
        start: "top bottom",
        end: "bottom top",
        toggleActions: "play pause resume pause",
      },
    });
    gsap.to(".atmosphere-grain", {
      backgroundPosition: "80px 100px",
      duration: 25,
      scrollTrigger: {
        trigger: ".hero",
        start: "top bottom",
        end: "bottom top",
        toggleActions: "play pause resume pause",
      },
      repeat: -1,
      ease: "none",
    });
    gsap.to(".hero-atmosphere", {
      y: 130,
      opacity: 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 42, opacity: 0.1 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 94%",
            toggleActions: "play none none none",
          },
          clearProps: "transform,opacity",
        },
      );
    });
    gsap.fromTo(
      ".discipline-strip > div",
      { x: 70 },
      {
        x: -35,
        ease: "none",
        scrollTrigger: {
          trigger: ".discipline-strip",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      },
    );
    gsap.utils.toArray<HTMLElement>(".path-art").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 35, scale: 0.8 },
        {
          y: -15,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest(".path-row"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        },
      );
    });
    gsap.fromTo(
      ".footer-wordmark",
      { yPercent: 25, opacity: 0.25 },
      {
        yPercent: 0,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".front-footer",
          start: "top 90%",
          end: "bottom bottom",
          scrub: 1,
        },
      },
    );
    gsap.utils.toArray<HTMLElement>(".footer-column").forEach((el, i) =>
      gsap.fromTo(
        el,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.1,
          scrollTrigger: { trigger: el, start: "top 95%" },
          clearProps: "transform,opacity",
        },
      ),
    );
  }, root);
  root.classList.add("gsap-ready");
  const refresh = () => ScrollTrigger.refresh();
  document.fonts.ready.then(() => {
    if (root.classList.contains("gsap-ready")) refresh();
  });
  return () => {
    ctx.revert();
    root.classList.remove("gsap-ready");
  };
}
export function animateChapter(root: HTMLElement) {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".story-copy h2, .story-copy > p, .demo-body",
      { opacity: 0.35, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }, root);
  return () => ctx.revert();
}
