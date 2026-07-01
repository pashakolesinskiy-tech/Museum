function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ===== ШАПКА И ПОДВАЛ =====

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;

  const page = location.pathname.split("/").pop() || "index.html";
  const isIndex = page === "index.html" || page === "";

  const links = [
    { href: isIndex ? "#hero" : "index.html", text: "Главная", current: isIndex },
    { href: isIndex ? "#exhibits" : "index.html#exhibits", text: "Экспозиции" },
    { href: isIndex ? "#times" : "index.html#times", text: "Связь времён" },
    { href: isIndex ? "#about" : "index.html#about", text: "Играй и познавай" },
  ];

  const navItems = links
    .map((l) => {
      const attr = l.current ? ' aria-current="page"' : "";
      return `<li><a href="${l.href}"${attr}>${l.text}</a></li>`;
    })
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

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;

  el.className = "footer";
  el.setAttribute("role", "contentinfo");
  el.innerHTML = `
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <h3>Музейная экспозиция</h3>
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

// ===== РЕНДЕР АУДИО-КОМПОНЕНТА =====
function renderAudioWidget() {
  if (document.getElementById("bg-music")) return;
  var audioSrc = document.body.dataset.audioSrc;
  if (!audioSrc) return;

  var audio = document.createElement("audio");
  audio.id = "bg-music";
  audio.loop = true;
  audio.innerHTML = '<source src="' + escapeHtml(audioSrc) + '" type="audio/mpeg" />';
  document.body.appendChild(audio);

  var btn = document.createElement("button");
  btn.id = "music-toggle";
  btn.className = "music-toggle";
  btn.setAttribute("aria-label", "Включить музыку");
  btn.setAttribute("aria-pressed", "false");
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path class="note-icon" d="M9 18V5l12-2v13" />' +
      '<circle class="note-icon" cx="6" cy="18" r="3" />' +
      '<circle class="note-icon" cx="18" cy="16" r="3" />' +
    '</svg>' +
    '<svg class="pause-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<rect x="6" y="4" width="4" height="16" rx="1" />' +
      '<rect x="14" y="4" width="4" height="16" rx="1" />' +
    '</svg>';
  document.body.appendChild(btn);
}

// ===== РЕНДЕР ЛАЙТБОКСА =====
function renderLightbox() {
  if (document.getElementById("lb-overlay")) return;
  if (!document.querySelector(".gallery-grid, .war-gallery-grid")) return;

  var overlay = document.createElement("div");
  overlay.id = "lb-overlay";
  overlay.className = "lb-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Просмотр фотографии");
  overlay.innerHTML =
    '<div class="lb-inner">' +
      '<button class="lb-close" id="lb-close" aria-label="Закрыть">&times;</button>' +
      '<img class="lb-img" id="lb-img" src="" alt="" />' +
      '<p class="lb-caption" id="lb-caption"></p>' +
    '</div>';
  document.body.appendChild(overlay);
}

renderAudioWidget();
renderLightbox();

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

  track._sliderGoToSlide = goToSlide;
  track._sliderGetCurrent = () => currentIndex;
  track._sliderGetCount = () => slideCount;

  createDots();
  goToSlide(0);
}

// ===== УНИВЕРСАЛЬНЫЙ НАБЛЮДАТЕЛЬ АНИМАЦИЙ =====
function initAnimateObserver(root) {
  const rootEl = root || document;
  const elements = rootEl.querySelectorAll(".animate-up:not(.visible)");
  if (elements.length === 0) return;

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

  elements.forEach((el) => observer.observe(el));
}

// ===== УНИВЕРСАЛЬНЫЙ РЕНДЕР ГАЛЕРЕЙ =====

function buildStandardInfo(item) {
  const name = escapeHtml(item.name || "");
  const date = escapeHtml(item.date || "");
  const note = escapeHtml(item.note || "");
  if (note) return `<span>${name}</span><h3>${date}<br />${note}</h3>`;
  if (date) return `<span>${name}</span><h3>${date}</h3>`;
  return `<span>${name}</span>`;
}

function buildExhibitInfo(item) {
  const name = escapeHtml(item.name || "");
  const date = escapeHtml(item.date || "");
  const note = escapeHtml(item.note || "");
  const dateHtml = note
    ? `Дата выпуска: ${date}<br />${note}`
    : `Дата выпуска: ${date}`;
  return `<span>${name}</span><h3>${dateHtml}</h3>`;
}

function loadGalleryManifest(gridId, manifestPath, basePath, buildInfo) {
  var grid = document.getElementById(gridId);
  if (!grid) return;

  fetch(manifestPath)
    .then(function (res) { return res.json(); })
    .then(function (manifest) {
      var describedFiles = new Set();
      var fragment = document.createDocumentFragment();
      var tmp = document.createElement("div");

      manifest.forEach(function (item) {
        describedFiles.add(item.file);
        var src = basePath + item.file;
        var alt = escapeHtml(item.alt || item.name || item.caption || "");
        var info = buildInfo ? buildInfo(item) : "";
        var hasInfo = item.name || item.date || item.caption;

        tmp.innerHTML =
          '<div class="gallery-item' + (hasInfo ? '' : ' no-info') + ' has-lightbox animate-up" role="listitem" tabindex="0"' +
            ' aria-label="' + alt + ' — нажмите для увеличения">' +
            '<div class="gallery-card">' +
              '<img src="' + escapeHtml(src) + '" alt="' + alt + '" width="300" height="200" loading="lazy" onerror="this.src=\'assets/placeholder.svg\'" />' +
              (hasInfo ? '<div class="gallery-info">' + info + '</div>' : '') +
            '</div>' +
          '</div>';
        var el = tmp.firstElementChild;

        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            el.click();
          }
        });

        fragment.appendChild(el);
      });

      grid.appendChild(fragment);
      initAnimateObserver(grid);
      scanForNewFiles(grid, describedFiles, basePath, manifestPath);
    })
    .catch(function () {});
}

function scanForNewFiles(grid, describedFiles, basePath, manifestPath) {
  var dirPath = basePath;
  var prefix = "";
  var firstFile = describedFiles.values().next().value;
  if (firstFile) {
    var m = firstFile.match(/^(.+)-\d+\.\w+$/);
    if (m) prefix = m[1];
  }
  if (!prefix) {
    var dirParts = basePath.replace(/\/$/, "").split("/");
    prefix = dirParts[dirParts.length - 1];
  }
  var fileRegex = new RegExp("^" + prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-(\\d+)\\.\\w+$");

  var maxNum = 0;
  describedFiles.forEach(function (f) {
    var m = f.match(fileRegex);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });

  var misses = 0;
  var i = maxNum + 1;

  function probeNext() {
    if (misses >= 4) {
      var indicator = document.getElementById("scan-indicator");
      if (indicator) indicator.classList.add("hidden");
      return;
    }

    var padded = String(i).padStart(2, "0");
    var possibleFiles = [prefix + "-" + padded + ".webp", prefix + "-" + padded + ".png"];
    var found = false;
    i++;

    function tryFile(fi) {
      if (fi >= possibleFiles.length) {
        if (!found) { misses++; probeNext(); }
        return;
      }

      var fileName = possibleFiles[fi];
      var src = dirPath + fileName;

      if (describedFiles.has(fileName)) {
        misses = 0;
        probeNext();
        return;
      }

      var img = new Image();
      var done = false;

      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        tryFile(fi + 1);
      }, 8000);

      img.onload = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        misses = 0;
        found = true;

        var tmp = document.createElement("div");
        tmp.innerHTML =
          '<div class="gallery-item no-info has-lightbox animate-up" role="listitem" tabindex="0" aria-label="Экспонат — нажмите для увеличения">' +
            '<div class="gallery-card">' +
              '<img src="' + escapeHtml(src) + '" alt="" width="300" height="200" loading="lazy" />' +
            '</div>' +
          '</div>';
        var el = tmp.firstElementChild;

        (function (imgSrc) {
          function openLb() {
            var lb = document.getElementById("lb-overlay");
            if (!lb) return;
            document.getElementById("lb-img").src = imgSrc;
            document.getElementById("lb-img").alt = "";
            document.getElementById("lb-caption").textContent = "";
            lb.classList.add("active");
            document.body.classList.add("menu-open");
            requestAnimationFrame(function () { document.getElementById("lb-close").focus(); });
          }

          el.addEventListener("click", openLb);
          el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); }
          });
        })(src);

        grid.appendChild(el);
        initAnimateObserver(grid);
        probeNext();
      };

      img.onerror = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        tryFile(fi + 1);
      };

      img.src = src;
    }

    tryFile(0);
  }

  probeNext();
}

function loadExhibitManifest() {
  loadGalleryManifest("gallery-grid", "assets/exhibits/manifest.json", "assets/exhibits/", buildExhibitInfo);
}

function loadWarManifest(photos, gridId) {
  var grid = document.getElementById(gridId);
  if (!grid) return;

  var fragment = document.createDocumentFragment();

  photos.forEach(function (photo) {
    var src = "assets/war-path/" + photo.file;
    var alt = escapeHtml(photo.alt || photo.caption || "");

    var card = document.createElement("div");
    card.className = "war-photo-card animate-up";
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", (photo.caption || photo.alt) + " — нажмите для увеличения");

    card.innerHTML =
      '<div class="war-photo-card__img-wrap">' +
      '<img src="' + escapeHtml(src) + '" alt="' + alt + '" width="300" height="200" loading="lazy" onerror="this.src=\'assets/placeholder.svg\'" />' +
      '<div class="war-photo-card__overlay">' +
      '<span class="war-photo-card__zoom">Увеличить</span>' +
      '</div>' +
      '</div>' +
      (photo.caption ? '<div class="war-photo-card__caption">' + escapeHtml(photo.caption) + '</div>' : '');

    (function (imgSrc, imgAlt, imgCaption) {
      function openLb() {
        var lb = document.getElementById("lb-overlay");
        if (!lb) return;
        document.getElementById("lb-img").src = imgSrc;
        document.getElementById("lb-img").alt = imgAlt;
        document.getElementById("lb-caption").textContent = imgCaption;
        lb.classList.add("active");
        document.body.classList.add("menu-open");
        requestAnimationFrame(function () { document.getElementById("lb-close").focus(); });
      }

      card.addEventListener("click", openLb);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); }
      });
    })(src, alt, photo.caption || "");

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
  initAnimateObserver(grid);
}

(function initLightbox() {
  var lb = document.getElementById("lb-overlay");
  if (!lb) return;
  var lbClose = document.getElementById("lb-close");
  var lbImg = document.getElementById("lb-img");
  var lbCaption = document.getElementById("lb-caption");

  var currentItems = [];
  var currentIndex = 0;

  function updateCounter() {
    var counter = document.getElementById("lb-counter");
    if (counter && currentItems.length > 1) {
      counter.textContent = (currentIndex + 1) + " / " + currentItems.length;
      counter.style.display = "block";
    } else if (counter) {
      counter.style.display = "none";
    }
  }

  function showItem(index) {
    if (index < 0 || index >= currentItems.length) return;
    currentIndex = index;
    var item = currentItems[index];
    lbImg.src = item.src;
    lbImg.alt = item.alt || "";
    lbCaption.textContent = item.name || item.alt || "";
    updateCounter();
  }

  function openFromElement(el) {
    collectItems();
    var grid = el.closest(".gallery-grid, .war-gallery-grid, .bio-photo-grid") || el.closest("main") || document;
    var items = grid.querySelectorAll(".gallery-item.has-lightbox, .has-lightbox");
    var idx = Array.prototype.indexOf.call(items, el);
    if (idx >= 0) {
      currentIndex = idx;
      showItem(idx);
    } else {
      var img = el.querySelector("img");
      if (img) {
        currentItems = [{ src: img.src, alt: img.alt, name: el.querySelector(".gallery-info span")?.textContent || "" }];
        currentIndex = 0;
        showItem(0);
      }
    }
    lb.classList.add("active");
    document.body.classList.add("menu-open");
    requestAnimationFrame(function () { lbClose.focus(); });
  }

  function collectItems() {
    currentItems = [];
    var grids = document.querySelectorAll(".gallery-grid, .war-gallery-grid, .bio-photo-grid");
    grids.forEach(function (grid) {
      var items = grid.querySelectorAll(".gallery-item.has-lightbox, .has-lightbox");
      items.forEach(function (el) {
        var img = el.querySelector("img");
        if (img) {
          currentItems.push({
            src: img.src,
            alt: img.alt,
            name: el.querySelector(".gallery-info span")?.textContent || ""
          });
        }
      });
    });
  }

  document.addEventListener("click", function (e) {
    var card = e.target.closest(".gallery-item.has-lightbox, .war-photo-card");
    if (!card) return;
    e.preventDefault();
    openFromElement(card);
  });

  document.addEventListener("keydown", function (e) {
    if (e.target.closest(".gallery-item.has-lightbox, .war-photo-card") && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openFromElement(e.target.closest(".gallery-item.has-lightbox, .war-photo-card"));
    }
  });

  function closeLb() {
    lb.classList.remove("active");
    document.body.classList.remove("menu-open");
  }

  lbClose.addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("active")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") showItem(currentIndex + 1);
    if (e.key === "ArrowLeft") showItem(currentIndex - 1);
  });

  var touchStartX = 0;
  lb.addEventListener("touchstart", function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) showItem(currentIndex + 1);
      else showItem(currentIndex - 1);
    }
  });

  var counter = document.createElement("div");
  counter.id = "lb-counter";
  counter.className = "lb-counter";
  lb.querySelector(".lb-inner").appendChild(counter);
})();

loadExhibitManifest();
loadGalleryManifest("awards-grid", "assets/awards/manifest.json", "assets/awards/", buildStandardInfo);
loadGalleryManifest("archive-grid", "assets/portnova/manifest.json", "assets/portnova/", buildStandardInfo);
loadGalleryManifest("books-grid", "assets/books/manifest.json", "assets/books/", buildStandardInfo);

initAnimateObserver();

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

  const positions = [];
  for (let i = 0; i < totalItems; i++) {
    let angle, x, y, z, scale, opacity, zIndex;

    if (i === 0) {
      angle = 0; x = 0; y = 0; z = 100; scale = 1; opacity = 1; zIndex = 100;
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

  carousel3d._carouselGo = function (dir) {
    if (dir === "prev") currentIndex = (currentIndex + 1 + totalItems) % totalItems;
    else currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateCarousel();
  };

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

  carousel3d.addEventListener("click", (e) => {
    if (didDrag) return;

    const cardImage = e.target.closest(".card-image");
    if (!cardImage) return;

    const item = cardImage.closest(".carousel-item");
    const href = item?.dataset.href;

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

  updateCarousel();
})();

// ===== ОБЩИЙ КЛАВИАТУРНЫЙ ОБРАБОТЧИК =====
document.addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

  const carousel3d = document.getElementById("carousel-3d");
  const carouselSection = document.getElementById("exhibits");
  const sliderSection = document.getElementById("times");
  const sliderTrack = document.getElementById("swipe-track");

  if (carouselSection && carousel3d?._carouselGo) {
    const rect = carouselSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight / 2 && rect.bottom > 0;
    if (inView) {
      e.preventDefault();
      carousel3d._carouselGo(e.key === "ArrowLeft" ? "prev" : "next");
      return;
    }
  }

  if (sliderSection && sliderTrack?._sliderGoToSlide) {
    const rect = sliderSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      e.preventDefault();
      const cur = sliderTrack._sliderGetCurrent();
      const cnt = sliderTrack._sliderGetCount();
      let idx = e.key === "ArrowLeft" ? cur - 1 : cur + 1;
      if (idx < 0) idx = cnt - 1;
      if (idx >= cnt) idx = 0;
      sliderTrack._sliderGoToSlide(idx);
      return;
    }
  }
});

// ===== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: ловушка фокуса =====
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
  const btnAbout = document.getElementById("btnAboutMuseum");
  const aboutModal = document.getElementById("aboutMuseumModal");
  const aboutClose = document.getElementById("aboutMuseumClose");

  if (btnAbout && aboutModal) {
    let removeTrap = null;

    function openAbout() {
      aboutModal.classList.add("active");
      document.body.classList.add("menu-open");
      btnAbout.setAttribute("aria-expanded", "true");
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

  // War Path preview modal
  const warModal = document.getElementById("warPathModal");
  const warModalClose = document.getElementById("warPathModalClose");
  const warBackdrop = warModal?.querySelector(".war-preview-modal__backdrop");

  if (warModal && warModalClose) {
    function closeWarModal() {
      warModal.classList.remove("active");
      document.body.classList.remove("menu-open");
    }
    warModalClose.addEventListener("click", closeWarModal);
    warBackdrop?.addEventListener("click", closeWarModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && warModal.classList.contains("active"))
        closeWarModal();
    });
  }

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
          modalVideo.play();
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

  const galleryContainer = document.getElementById("video-gallery-container");

  if (galleryContainer) {
    function buildVideoCard(item) {
      const ariaLabel = escapeHtml(`${item.caption} — нажмите для просмотра`);
      const poster = escapeHtml(item.poster);
      const alt = escapeHtml(item.alt);
      const video = escapeHtml(item.video);
      const caption = escapeHtml(item.caption);
      return `
        <div class="video-vertical-item animate-up" role="listitem">
          <div class="video-media-block">
            <div class="video-container" role="button" tabindex="0" aria-label="${ariaLabel}">
              <img
                src="${poster}"
                alt="${alt}"
                class="video-poster"
                loading="lazy"
              />
              <video class="video-player" muted playsinline preload="metadata">
                <source src="${video}" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            </div>
            <div class="video-caption">${caption}</div>
          </div>
        </div>`;
    }

    function buildColorCard(item) {
      const ariaLabel = escapeHtml(`${item.caption} — нажмите для перехода к цветной версии`);
      const poster = escapeHtml(item.poster);
      const colorSrc = escapeHtml(item.colorSrc);
      const alt = escapeHtml(item.alt);
      const altColor = escapeHtml(item.altColor || "Цветная версия");
      const caption = escapeHtml(item.caption);
      return `
        <div class="video-vertical-item animate-up" role="listitem">
          <div class="video-media-block">
            <div class="video-container has-color-reveal" role="button" tabindex="0" aria-label="${ariaLabel}">
              <img
                src="${poster}"
                data-color-src="${colorSrc}"
                alt="${alt}"
                class="video-poster"
                loading="lazy"
              />
              <img src="" alt="${altColor}" class="video-player color-reveal" />
            </div>
            <div class="video-caption">${caption}</div>
          </div>
        </div>`;
    }

    function buildImageCard(item) {
      const src = escapeHtml(item.src);
      const alt = escapeHtml(item.alt);
      const caption = escapeHtml(item.caption);
      return `
        <div class="video-vertical-item animate-up" role="listitem">
          <div class="video-media-block">
            <div class="video-caption-only">
              <img src="${src}" alt="${alt}" loading="lazy" />
              <div class="video-caption">${caption}</div>
            </div>
          </div>
        </div>`;
    }

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
          video.play();
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

    function loadGallery() {
      const galleryContainer = document.getElementById("video-gallery-container");
      if (!galleryContainer) return;

      fetch("assets/bw/manifest.json")
        .then(function (res) { return res.json(); })
        .then(function (items) {
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
          initAnimateObserver(galleryContainer);
        })
        .catch(function () {});
    }

    loadGallery();
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


