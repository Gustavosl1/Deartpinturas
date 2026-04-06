document.addEventListener("DOMContentLoaded", () => {
  const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.setProperty("--scrollbar-gap", `${scrollbarGap}px`);
  document.body.classList.add("is-loading");
  const header = document.querySelector(".header-inner");
  const topBtn = document.querySelector(".btn-top");
  const logo = document.getElementById("brand-logo");
  const popup = document.getElementById("welcome-popup");
  const closeWelcome = document.getElementById("close-welcome");
  const lightbox = document.getElementById("lightbox-overlay");
  const lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  const lightboxCaption = lightbox ? lightbox.querySelector(".caption") : null;
  const closeLightbox = lightbox
    ? lightbox.querySelector(".close-lightbox")
    : null;

  const parseColor = (color) => {
    if (!color) return null;
    const match = color.match(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/,
    );
    if (!match) return null;
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: match[4] === undefined ? 1 : Number(match[4]),
    };
  };

  const isLightColor = (color) => {
    const parsed = parseColor(color);
    if (!parsed) return false;
    if (parsed.a === 0) return false;
    const luminance =
      (0.2126 * parsed.r + 0.7152 * parsed.g + 0.0722 * parsed.b) / 255;
    return luminance > 0.68;
  };

  const getUnderlyingElement = (x, y) => {
    const stack = document.elementsFromPoint(x, y);
    if (!stack.length) return null;
    if (!topBtn) return stack[0];
    return (
      stack.find((el) => el !== topBtn && !topBtn.contains(el)) || stack[0]
    );
  };

  const getEffectiveBackground = (element) => {
    let current = element;
    while (current && current !== document.documentElement) {
      const bg = window.getComputedStyle(current).backgroundColor;
      const parsed = parseColor(bg);
      if (parsed && parsed.a !== 0) {
        return bg;
      }
      current = current.parentElement;
    }
    return window.getComputedStyle(document.body).backgroundColor;
  };

  const updateTopBtnTheme = () => {
    if (!topBtn || !topBtn.classList.contains("show")) return;
    const rect = topBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const target = getUnderlyingElement(x, y);
    const bg = getEffectiveBackground(target || document.body);
    topBtn.classList.toggle("on-light", isLightColor(bg));
  };

  if (window.AOS) {
    AOS.init({ once: true, duration: 900, easing: "ease-out-cubic" });
  }

  const onScroll = () => {
    if (header) {
      header.classList.toggle("navbar-scroll", window.scrollY > 40);
    }
    if (topBtn) {
      topBtn.classList.toggle("show", window.scrollY > 360);
    }
    updateTopBtnTheme();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateTopBtnTheme, { passive: true });
  onScroll();

  if (topBtn) {
    topBtn.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (logo) {
    logo.addEventListener("mouseenter", () => {
      logo.style.transform = "rotate(8deg) scale(1.06)";
    });
    logo.addEventListener("mouseleave", () => {
      logo.style.transform = "rotate(0deg) scale(1)";
    });
  }

  const hideWelcome = () => {
    if (!popup) return;
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  if (popup) {
    const seen = localStorage.getItem("deart-welcome-seen");
    if (!seen) {
      popup.classList.add("show");
      popup.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      localStorage.setItem("deart-welcome-seen", "1");
    }

    if (closeWelcome) {
      closeWelcome.addEventListener("click", hideWelcome);
    }

    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        hideWelcome();
      }
    });
  }

  document.querySelectorAll(".galeria-inner").forEach((item) => {
    item.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      const img = item.querySelector("img");
      if (!img) return;

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      if (lightboxCaption) {
        lightboxCaption.textContent = item.dataset.caption || img.alt || "";
      }
      lightbox.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  const closeLB = () => {
    if (!lightbox) return;
    lightbox.style.display = "none";
    document.body.style.overflow = "";
  };

  if (closeLightbox) {
    closeLightbox.addEventListener("click", closeLB);
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLB();
      }
    });
  }

  const revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    hideWelcome();
    if (lightbox && lightbox.style.display === "flex") {
      closeLB();
    }
  });
});

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  loader.classList.add("fade-out");
  setTimeout(() => {
    loader.style.display = "none";
    document.body.classList.remove("is-loading");
  }, 320);
});
