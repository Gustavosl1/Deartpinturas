(() => {
  const card = document.querySelector(".card-404");
  const media = document.querySelector(".card-404__media img");

  if (!card || !media) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) return;

  const handleMove = (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateX = y * -6;
    const rotateY = x * 6;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    media.style.transform = `translateY(-8px) translateX(${x * 6}px)`;
  };

  const reset = () => {
    card.style.transform = "";
    media.style.transform = "";
  };

  card.addEventListener("mousemove", handleMove);
  card.addEventListener("mouseleave", reset);
})();
