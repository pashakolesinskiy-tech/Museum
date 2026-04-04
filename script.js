// ===== ШАПКА И ПОДВАЛ =====

/**
 * Рисует шапку в <header id="site-header">.
 * Из трёх стандартных ссылок автоматически убирает ту,
 * на странице которой мы находимся.
 */
function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;

  const page = location.pathname.split("/").pop() || "index.html";

  const allLinks = [
    { href: "index.html", text: "Главная" },
    { href: "gallery.html", text: "Коллекция" },
    { href: "video-gallery.html", text: "Видео-галерея" },
  ];

  const navItems = allLinks
    .filter((l) => l.href !== page)
    .map((l) => `<li><a href="${l.href}">${l.text}</a></li>`)
    .join("\n            ");

  el.className = "header";
  el.setAttribute("role", "banner");
  el.innerHTML = `
    <div class="container nav">
      <div class="logo">Музейная экспозиция</div>
      <nav aria-label="Основная навигация">
        <ul class="nav-menu" id="menu" role="list">
            ${navItems}
        </ul>
      </nav>
      <button class="burger" id="burger"
        aria-label="Открыть меню навигации"
        aria-expanded="false" aria-controls="menu">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>
    </div>`;
}

/**
 * Рисует подвал в <footer id="site-footer">.
 * Заголовок зависит от страницы: галерейные → «Музейная экспозиция»,
 * остальные → «Виртуальный музей».
 */
function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;

  const page = location.pathname.split("/").pop() || "index.html";
  const title =
    page === "gallery.html" || page === "video-gallery.html"
      ? "Музейная экспозиция"
      : "Виртуальный музей";

  el.className = "footer";
  el.setAttribute("role", "contentinfo");
  el.innerHTML = `
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <h3>${title}</h3>
          <p>© 2026 Все права защищены</p>
        </div>
        <div class="footer-social">
          <p>Мы в соцсетях:</p>
          <a href="https://vk.ru/club183409209" aria-label="VK">VK</a> |
          <a href="https://t.me/Detskiisad24" aria-label="Telegram">Telegram</a> |
          <a href="https://www.instagram.com/sad_24_polotsk?igsh=MTd6ZWc3cmJobXB2Nw%3D%3D&utm_source=qr" aria-label="Instagram">Instagram</a>
        </div>
      </div>
    </div>`;
}

renderHeader();
renderFooter();

// ===== БУРГЕР-МЕНЮ =====
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");

if (burger && menu) {
  burger.addEventListener("click", () => {
    const isExpanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!isExpanded));
    burger.classList.toggle("active");
    menu.classList.toggle("active");
    document.body.classList.toggle("menu-open");
  });

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
      menu.classList.remove("active");
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  });
}

// ===== СЛАЙДЕР «СВЯЗЬ ВРЕМЁН» =====
const track = document.getElementById("swipe-track");
const slides = document.querySelectorAll(".swipe-slide");
const prevBtn = document.getElementById("prev-slide");
const nextBtn = document.getElementById("next-slide");
const dotsContainer = document.getElementById("swipe-dots");

if (track && slides.length > 0 && prevBtn && nextBtn && dotsContainer) {
  let currentIndex = 0;
  const slideCount = slides.length;

  function createDots() {
    dotsContainer.innerHTML = "";
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      dot.dataset.index = i;
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Слайд ${i + 1} из ${slideCount}`);
      dot.setAttribute("tabindex", i === 0 ? "0" : "-1");
      dot.addEventListener("click", () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    document.querySelectorAll(".dot").forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
      dot.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function goToSlide(index) {
    if (index < 0) index = slideCount - 1;
    if (index >= slideCount) index = 0;
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  }

  prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));

  // Клавиатурная навигация по слайдеру
  document.addEventListener("keydown", (e) => {
    // Только если фокус находится в области слайдера или нажаты стрелки без фокуса на поле ввода
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    const sliderSection = document.getElementById("times");
    if (!sliderSection) return;
    const rect = sliderSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToSlide(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToSlide(currentIndex + 1);
    }
  });

  createDots();
  goToSlide(0);
}

// ===== УНИВЕРСАЛЬНЫЙ РЕНДЕР ГАЛЕРЕЙ =====

/**
 * Строит HTML блока .gallery-info для страниц наград, архива и книг.
 * Формат: название + опциональная дата + опциональная заметка.
 */
function buildStandardInfo(item) {
  if (item.note)
    return `<span>${item.name}</span><h3>${item.date}<br />${item.note}</h3>`;
  if (item.date) return `<span>${item.name}</span><h3>${item.date}</h3>`;
  return `<span>${item.name}</span>`;
}

/**
 * Строит HTML блока .gallery-info для страницы экспонатов (gallery.html).
 * Дата выводится с подписью «Дата выпуска:».
 */
function buildExhibitInfo(item) {
  const dateHtml = item.note
    ? `Дата выпуска: ${item.date}<br />${item.note}`
    : `Дата выпуска: ${item.date}`;
  return `<span>${item.name}</span><h3>${dateHtml}</h3>`;
}

/**
 * Загружает JSON из <script id="dataId">, рисует карточки в <div id="gridId">.
 * @param {string}   gridId   — id контейнера-сетки
 * @param {string}   dataId   — id <script type="application/json"> с данными
 * @param {Function} buildInfo — функция (item) => строка HTML для .gallery-info
 */
function renderGrid(gridId, dataId, buildInfo) {
  const grid = document.getElementById(gridId);
  const dataEl = document.getElementById(dataId);
  if (!grid || !dataEl) return;

  let items;
  try {
    items = JSON.parse(dataEl.textContent);
  } catch (e) {
    console.error(`Ошибка ${dataId} JSON:`, e);
    return;
  }

  const fragment = document.createDocumentFragment();
  const tmp = document.createElement("div");

  items.forEach((item) => {
    tmp.innerHTML = `
      <div class="gallery-item has-lightbox animate-up" role="listitem" tabindex="0"
           aria-label="${item.alt} — нажмите для увеличения">
        <div class="gallery-card">
          <img src="${item.src}" alt="${item.alt}" loading="lazy" />
          <div class="gallery-info">${buildInfo(item)}</div>
        </div>
      </div>`;
    const el = tmp.firstElementChild;

    function openLb() {
      const lb = document.getElementById("lb-overlay");
      if (!lb) return;
      document.getElementById("lb-img").src = item.src;
      document.getElementById("lb-img").alt = item.alt;
      document.getElementById("lb-caption").textContent = item.name || item.alt || "";
      lb.classList.add("active");
      document.body.classList.add("menu-open");
      requestAnimationFrame(() => document.getElementById("lb-close").focus());
    }

    el.addEventListener("click", openLb);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); }
    });

    fragment.appendChild(el);
  });

  grid.appendChild(fragment);
}

// ── Инициализация универсального лайтбокса ────────────────────
(function initLightbox() {
  const lb = document.getElementById("lb-overlay");
  if (!lb) return;
  const lbClose = document.getElementById("lb-close");

  function closeLb() {
    lb.classList.remove("active");
    document.body.classList.remove("menu-open");
  }

  lbClose.addEventListener("click", closeLb);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("active")) closeLb();
  });
})();

// Страница gallery.html — экспонаты (особый формат даты)
renderGrid("gallery-grid", "gallery-data", buildExhibitInfo);

// Страницы awards / personal-archive / media — единый формат
renderGrid("awards-grid", "awards-data", buildStandardInfo);
renderGrid("archive-grid", "archive-data", buildStandardInfo);
renderGrid("books-grid", "books-data", buildStandardInfo);

// ===== АНИМАЦИЯ ПРИ СКРОЛЛЕ (Intersection Observer) =====
const animatedElements = document.querySelectorAll(".animate-up");

if (animatedElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  animatedElements.forEach((el) => observer.observe(el));
}

// ===== ТРЁХМЕРНАЯ КАРУСЕЛЬ =====
(function () {
  const carousel3d = document.getElementById("carousel-3d");
  const carouselItems = document.querySelectorAll(".carousel-item");
  const carouselPrev = document.getElementById("carousel-prev");
  const carouselNext = document.getElementById("carousel-next");
  const carouselDotsContainer = document.getElementById("carousel-dots");

  if (!carousel3d || carouselItems.length === 0) return;

  let currentIndex = 0;
  const totalItems = carouselItems.length;
  const radius =
    window.innerWidth < 480 ? 200 : window.innerWidth < 768 ? 280 : 350;
  const rotateAngle = 50;
  let isAnimating = false;

  // Предварительный расчёт позиций
  const positions = [];
  for (let i = 0; i < totalItems; i++) {
    let angle, x, y, z, scale, opacity, zIndex;

    if (i === 0) {
      angle = 0;
      x = 0;
      y = 0;
      z = 100;
      scale = 1;
      opacity = 1;
      zIndex = 100;
    } else if (i <= totalItems / 2) {
      angle = -rotateAngle + (i - 1) * ((rotateAngle * 2) / (totalItems - 2));
      x = Math.sin((angle * Math.PI) / 180) * radius;
      z = Math.cos((angle * Math.PI) / 180) * radius - radius;
      y = -i * 15;
      scale = 0.85 - i * 0.08;
      opacity = 0.9 - i * 0.12;
      zIndex = 50 - i * 5;
    } else {
      const rev = totalItems - i;
      angle = rotateAngle - (rev - 1) * ((rotateAngle * 2) / (totalItems - 2));
      x = Math.sin((angle * Math.PI) / 180) * radius;
      z = Math.cos((angle * Math.PI) / 180) * radius - radius;
      y = -rev * 15;
      scale = 0.85 - rev * 0.08;
      opacity = 0.9 - rev * 0.12;
      zIndex = 50 - rev * 5;
    }
    positions.push({ angle, x, y, z, scale, opacity, zIndex });
  }

  // Создание точек навигации
  if (carouselDotsContainer) {
    carouselDotsContainer.innerHTML = "";
    for (let i = 0; i < totalItems; i++) {
      const dot = document.createElement("span");
      dot.className = "carousel-dot";
      dot.dataset.index = i;
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Экспозиция ${i + 1} из ${totalItems}`);
      dot.setAttribute("tabindex", i === 0 ? "0" : "-1");
      carouselDotsContainer.appendChild(dot);
    }
  }

  function updateCarousel() {
    if (isAnimating) return;
    isAnimating = true;

    requestAnimationFrame(() => {
      carouselItems.forEach((item, i) => {
        const offset = (i - currentIndex + totalItems) % totalItems;
        const pos = positions[offset];

        item.style.transform = `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateY(${-pos.angle}deg) scale(${pos.scale})`;
        item.style.opacity = pos.opacity;
        item.style.zIndex = pos.zIndex;
        item.classList.toggle("active", offset === 0);
      });

      if (carouselDotsContainer) {
        carouselDotsContainer
          .querySelectorAll(".carousel-dot")
          .forEach((dot, i) => {
            const isActive = i === currentIndex;
            dot.classList.toggle("active", isActive);
            dot.setAttribute("aria-selected", String(isActive));
            dot.setAttribute("tabindex", isActive ? "0" : "-1");
          });
      }
      isAnimating = false;
    });
  }

  carouselPrev?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1 + totalItems) % totalItems;
    updateCarousel();
  });

  carouselNext?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateCarousel();
  });

  carouselDotsContainer?.addEventListener("click", (e) => {
    if (e.target.classList.contains("carousel-dot")) {
      currentIndex = parseInt(e.target.dataset.index);
      updateCarousel();
    }
  });

  // Клавиатурная навигация по карусели (стрелки)
  carousel3d.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      currentIndex = (currentIndex + 1 + totalItems) % totalItems;
      updateCarousel();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      updateCarousel();
    }
  });

  // Глобальная клавиатурная навигация для карусели
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    const carouselSection = document.getElementById("exhibits");
    if (!carouselSection) return;
    const rect = carouselSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight / 2 && rect.bottom > 0;

    if (inView && document.getElementById("times") === null) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        currentIndex = (currentIndex + 1 + totalItems) % totalItems;
        updateCarousel();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
      }
    }
  });

  // Поддержка свайпов и перетаскивания
  let startX = 0;
  let isDragging = false;
  let didDrag = false;

  function handleSwipe(endX) {
    const diff = startX - endX;
    if (Math.abs(diff) > 5) {
      didDrag = true;
    }
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      } else {
        currentIndex = (currentIndex + 1 + totalItems) % totalItems;
      }
      updateCarousel();
    }
    isDragging = false;
  }

  carousel3d.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      didDrag = false;
    },
    { passive: true },
  );

  carousel3d.addEventListener("touchend", (e) => {
    if (isDragging) handleSwipe(e.changedTouches[0].clientX);
  });

  carousel3d.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    isDragging = true;
    didDrag = false;
  });

  carousel3d.addEventListener("mouseup", (e) => {
    if (isDragging) handleSwipe(e.clientX);
  });

  // Клик по карточке
  carousel3d.addEventListener("click", (e) => {
    if (didDrag) return;

    const cardImage = e.target.closest(".card-image");
    if (!cardImage) return;

    const item = cardImage.closest(".carousel-item");
    const href = item?.dataset.href;

    // Если у карточки флаг warpath-preview — открываем модальное окно
    if (item?.dataset.warpathPreview === "true") {
      const modal = document.getElementById("warPathModal");
      if (modal) {
        modal.classList.add("active");
        document.body.classList.add("menu-open");
        const closeBtn = document.getElementById("warPathModalClose");
        closeBtn?.focus();
      }
      return;
    }

    if (href && href !== "#") {
      window.location.href = href;
    }
  });

  // Начальный рендер
  updateCarousel();
})();

// ===== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: ловушка фокуса для модального окна =====
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handler(e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  modal.addEventListener("keydown", handler);
  return () => modal.removeEventListener("keydown", handler);
}

// ===== МОДАЛЬНЫЕ ОКНА И ВИДЕО =====
document.addEventListener("DOMContentLoaded", function () {
  // --- Модальное окно «О музее» ---
  const btnAbout = document.getElementById("btnAboutMuseum");
  const aboutModal = document.getElementById("aboutMuseumModal");
  const aboutClose = document.getElementById("aboutMuseumClose");

  if (btnAbout && aboutModal) {
    let removeTrap = null;

    function openAbout() {
      aboutModal.classList.add("active");
      document.body.classList.add("menu-open");
      btnAbout.setAttribute("aria-expanded", "true");
      // Переводим фокус на кнопку закрытия
      requestAnimationFrame(() => aboutClose?.focus());
      removeTrap = trapFocus(aboutModal);
    }

    function closeAbout() {
      aboutModal.classList.remove("active");
      document.body.classList.remove("menu-open");
      btnAbout.setAttribute("aria-expanded", "false");
      if (removeTrap) {
        removeTrap();
        removeTrap = null;
      }
      // Возвращаем фокус на кнопку открытия
      btnAbout.focus();
    }

    btnAbout.addEventListener("click", openAbout);
    aboutClose?.addEventListener("click", closeAbout);
    aboutModal.addEventListener("click", (e) => {
      if (e.target === aboutModal) closeAbout();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && aboutModal.classList.contains("active"))
        closeAbout();
    });
  }

  // --- Модальное окно для видео (слайдер) ---
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  const closeBtn = modal?.querySelector(".close");

  if (modal && modalVideo && closeBtn) {
    let removeTrap = null;
    let triggerEl = null;

    const videoImages = document.querySelectorAll(
      ".swipe-slide img[data-video-src]",
    );

    videoImages.forEach((img) => {
      img.addEventListener("click", function (e) {
        e.stopPropagation();
        const videoSrc = this.dataset.videoSrc;
        if (videoSrc) {
          triggerEl = this;
          modalVideo.querySelector("source").src = videoSrc;
          modalVideo.load();
          modal.style.display = "block";
          modal.setAttribute("aria-hidden", "false");
          requestAnimationFrame(() => closeBtn.focus());
          removeTrap = trapFocus(modal);
          modalVideo.play().catch((error) => {
            console.log("Автовоспроизведение не удалось:", error);
          });
        }
      });
    });

    function closeVideoModal() {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
      modalVideo.pause();
      modalVideo.querySelector("source").src = "";
      modalVideo.load();
      if (removeTrap) {
        removeTrap();
        removeTrap = null;
      }
      if (triggerEl) {
        triggerEl.focus();
        triggerEl = null;
      }
    }

    closeBtn.addEventListener("click", closeVideoModal);
    window.addEventListener("click", (event) => {
      if (event.target === modal) closeVideoModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "block")
        closeVideoModal();
    });
  }

  // --- Видео-галерея: загрузка данных из встроенного <script id="gallery-data"> ---
  const galleryContainer = document.getElementById("video-gallery-container");

  if (galleryContainer) {
    // ── Строители HTML-карточек ────────────────────────────────────────────

    function buildVideoCard(item) {
      const ariaLabel = `${item.caption} — нажмите для просмотра`;
      return `
        <div class="video-vertical-item animate-up" role="listitem">
          <div class="video-media-block">
            <div class="video-container" role="button" tabindex="0" aria-label="${ariaLabel}">
              <img
                src="${item.poster}"
                alt="${item.alt}"
                class="video-poster"
                loading="lazy"
              />
              <video class="video-player" muted playsinline preload="metadata">
                <source src="${item.video}" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            </div>
            <div class="video-caption">${item.caption}</div>
          </div>
        </div>`;
    }

    function buildColorCard(item) {
      const ariaLabel = `${item.caption} — нажмите для перехода к цветной версии`;
      return `
        <div class="video-vertical-item animate-up" role="listitem">
          <div class="video-media-block">
            <div class="video-container" role="button" tabindex="0" aria-label="${ariaLabel}">
              <img
                src="${item.poster}"
                data-color-src="${item.colorSrc}"
                alt="${item.alt}"
                class="video-poster"
                loading="lazy"
              />
              <img src="" alt="${item.altColor || "Цветная версия"}" class="video-player color-reveal" />
            </div>
            <div class="video-caption">${item.caption}</div>
          </div>
        </div>`;
    }

    function buildImageCard(item) {
      return `
        <div class="video-vertical-item animate-up" role="listitem">
          <div class="video-media-block">
            <div class="video-caption-only">
              <img src="${item.src}" alt="${item.alt}" loading="lazy" />
              <div class="video-caption">${item.caption}</div>
            </div>
          </div>
        </div>`;
    }

    // ── Инициализация интерактивности для одного контейнера ───────────────

    function initVideoContainer(container) {
      const poster = container.querySelector(".video-poster");
      const colorImg = container.querySelector(".color-reveal");
      const video = container.querySelector("video.video-player");

      if (!poster) return;

      if (colorImg && poster.dataset.colorSrc) {
        colorImg.src = poster.dataset.colorSrc;
        function toggle() {
          container.classList.toggle("playing");
        }
        container.addEventListener("click", toggle);
        container.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        });
      } else if (video) {
        function playVideo() {
          container.classList.add("playing");
          video.play().catch((e) => console.log("Ошибка воспроизведения:", e));
        }
        container.addEventListener("click", playVideo);
        container.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            playVideo();
          }
        });
        video.addEventListener("ended", () => {
          container.classList.remove("playing");
          video.currentTime = 0;
        });
      }
    }

    // ── Наблюдатель прокрутки для animate-up ──────────────────────────────

    function observeNewItems(items) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
      );
      items.forEach((el) => observer.observe(el));
    }

    // ── Рендер галереи из встроенного <script id="gallery-data"> ──────────

    function loadGallery() {
      const dataEl = document.getElementById("gallery-data");
      if (!dataEl) {
        console.error("Элемент #gallery-data не найден.");
        return;
      }

      let items;
      try {
        items = JSON.parse(dataEl.textContent);
      } catch (err) {
        console.error("Ошибка разбора gallery-data JSON:", err);
        return;
      }

      if (!Array.isArray(items) || items.length === 0) return;

      const fragment = document.createDocumentFragment();
      const wrapper = document.createElement("div");

      for (const item of items) {
        switch (item.type) {
          case "video":
            wrapper.innerHTML = buildVideoCard(item);
            break;
          case "color":
            wrapper.innerHTML = buildColorCard(item);
            break;
          case "image":
            wrapper.innerHTML = buildImageCard(item);
            break;
          default:
            continue;
        }
        fragment.appendChild(wrapper.firstElementChild);
      }

      galleryContainer.innerHTML = "";
      galleryContainer.appendChild(fragment);

      galleryContainer
        .querySelectorAll(".video-container")
        .forEach(initVideoContainer);
      observeNewItems(galleryContainer.querySelectorAll(".animate-up"));
    }

    loadGallery();
  }

  // --- Форма обратной связи ---
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const submitBtn = document.getElementById("submitBtn");
    const formStatus = document.getElementById("formStatus");

    function showError(inputId, errorId, message) {
      const input = document.getElementById(inputId);
      const errorEl = document.getElementById(errorId);
      if (input && errorEl) {
        input.setAttribute("aria-invalid", "true");
        errorEl.textContent = message;
      }
    }

    function clearError(inputId, errorId) {
      const input = document.getElementById(inputId);
      const errorEl = document.getElementById(errorId);
      if (input && errorEl) {
        input.removeAttribute("aria-invalid");
        errorEl.textContent = "";
      }
    }

    function validateForm() {
      let valid = true;

      const name = document.getElementById("contactName")?.value.trim();
      const email = document.getElementById("contactEmail")?.value.trim();
      const message = document.getElementById("contactMessage")?.value.trim();
      const consent = document.getElementById("contactConsent")?.checked;

      clearError("contactName", "nameError");
      clearError("contactEmail", "emailError");
      clearError("contactMessage", "messageError");
      clearError("contactConsent", "consentError");

      if (!name) {
        showError("contactName", "nameError", "Пожалуйста, укажите ваше имя.");
        valid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        showError("contactEmail", "emailError", "Пожалуйста, укажите email.");
        valid = false;
      } else if (!emailRegex.test(email)) {
        showError(
          "contactEmail",
          "emailError",
          "Введите корректный email-адрес.",
        );
        valid = false;
      }

      if (!message) {
        showError(
          "contactMessage",
          "messageError",
          "Пожалуйста, напишите сообщение.",
        );
        valid = false;
      }

      if (!consent) {
        showError(
          "contactConsent",
          "consentError",
          "Необходимо согласие на обработку данных.",
        );
        valid = false;
      }

      return valid;
    }

    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!validateForm()) {
        // Ставим фокус на первое поле с ошибкой
        const firstInvalid = contactForm.querySelector("[aria-invalid='true']");
        firstInvalid?.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Отправка...";
      formStatus.className = "form-status";
      formStatus.textContent = "";

      try {
        // Имитация отправки (в реальном проекте — fetch к серверу или Formspree)
        await new Promise((resolve) => setTimeout(resolve, 1200));

        formStatus.className = "form-status success";
        formStatus.textContent =
          "Сообщение успешно отправлено! Мы ответим вам в ближайшее время.";
        contactForm.reset();
      } catch (err) {
        formStatus.className = "form-status error";
        formStatus.textContent =
          "Ошибка отправки. Пожалуйста, попробуйте ещё раз или напишите нам на email.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить сообщение";
        formStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    // Снятие ошибки при вводе
    ["contactName", "contactEmail", "contactMessage"].forEach((id) => {
      const input = document.getElementById(id);
      const errorId = id.replace("contact", "").toLowerCase() + "Error";
      input?.addEventListener("input", () => clearError(id, errorId));
    });
  }
});

// ===== ФОНОВАЯ МУЗЫКА С КНОПКОЙ-НОТОЙ =====
(function () {
  const music = document.getElementById("bg-music");
  const btn = document.getElementById("music-toggle");
  if (!music) return;

  music.volume = 0.3;
  let started = false;

  function setPlaying(on) {
    if (!btn) return;
    btn.classList.toggle("is-playing", on);
    btn.setAttribute("aria-label", on ? "Выключить музыку" : "Включить музыку");
    btn.setAttribute("aria-pressed", String(on));
  }

  // Музыка запускается только по нажатию на кнопку-ноту
  if (btn) {
    btn.addEventListener("click", () => {
      if (!started) {
        started = true;
        music
          .play()
          .then(() => setPlaying(true))
          .catch(() => {
            started = false;
          });
      } else if (music.paused) {
        music
          .play()
          .then(() => setPlaying(true))
          .catch(() => {});
      } else {
        music.pause();
        setPlaying(false);
      }
    });
  }

  music.addEventListener("pause", () => setPlaying(false));
  music.addEventListener("play", () => setPlaying(true));
})();

// ===== РЕГИСТРАЦИЯ SERVICE WORKER (PWA) =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Service Worker зарегистрирован:", reg.scope))
      .catch((err) => console.log("Ошибка регистрации SW:", err));
  });
}