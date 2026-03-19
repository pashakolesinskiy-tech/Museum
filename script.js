// Бургер-меню
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

if (burger && menu) {
  burger.addEventListener("click", () => {
  burger.classList.toggle("active");
  menu.classList.toggle("active");
  document.body.classList.toggle("menu-open");
  });

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      burger.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
      menu.classList.remove('active');
      burger.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
}

// Слайдер (Выставки)
const track = document.getElementById('swipe-track');
const slides = document.querySelectorAll('.swipe-slide');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');
const dotsContainer = document.getElementById('swipe-dots');

if (track && slides.length > 0 && prevBtn && nextBtn && dotsContainer) {
  let currentIndex = 0;
  const slideCount = slides.length;

  function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function goToSlide(index) {
    if (index < 0) index = slideCount - 1;
    if (index >= slideCount) index = 0;
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  createDots();
  goToSlide(0);
}

// Анимация при скролле (Intersection Observer)
const animatedElements = document.querySelectorAll('.animate-up');

if (animatedElements.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animatedElements.forEach(el => observer.observe(el));
}

// Floating 3D Carousel - Optimized
(function() {
  const carousel3d = document.getElementById('carousel-3d');
  const carouselItems = document.querySelectorAll('.carousel-item');
  const carouselPrev = document.getElementById('carousel-prev');
  const carouselNext = document.getElementById('carousel-next');
  const carouselDotsContainer = document.getElementById('carousel-dots');

  if (!carousel3d || carouselItems.length === 0) return;

  let currentIndex = 0;
  const totalItems = carouselItems.length;
  const radius = window.innerWidth < 480 ? 200 : (window.innerWidth < 768 ? 280 : 350);
  const rotateAngle = 50;
  let isAnimating = false;

  // Pre-calculate positions
  const positions = [];
  for (let i = 0; i < totalItems; i++) {
    let angle, x, y, z, scale, opacity, zIndex;
    
    if (i === 0) {
      angle = 0;
      x = 0; y = 0; z = 100;
      scale = 1; opacity = 1; zIndex = 100;
    } else if (i <= totalItems / 2) {
      angle = -rotateAngle + (i - 1) * (rotateAngle * 2 / (totalItems - 2));
      x = Math.sin(angle * Math.PI / 180) * radius;
      z = Math.cos(angle * Math.PI / 180) * radius - radius;
      y = -i * 15;
      scale = 0.85 - i * 0.08;
      opacity = 0.9 - i * 0.12;
      zIndex = 50 - i * 5;
    } else {
      const rev = totalItems - i;
      angle = rotateAngle - (rev - 1) * (rotateAngle * 2 / (totalItems - 2));
      x = Math.sin(angle * Math.PI / 180) * radius;
      z = Math.cos(angle * Math.PI / 180) * radius - radius;
      y = -rev * 15;
      scale = 0.85 - rev * 0.08;
      opacity = 0.9 - rev * 0.12;
      zIndex = 50 - rev * 5;
    }
    positions.push({ angle, x, y, z, scale, opacity, zIndex });
  }

  // Create dots once
  if (carouselDotsContainer) {
    carouselDotsContainer.innerHTML = '';
    for (let i = 0; i < totalItems; i++) {
      const dot = document.createElement('span');
      dot.className = 'carousel-dot';
      dot.dataset.index = i;
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
        item.classList.toggle('active', offset === 0);
      });

      if (carouselDotsContainer) {
        carouselDotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }
      isAnimating = false;
    });
  }

  carouselPrev?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1 + totalItems) % totalItems;
    updateCarousel();
  });

  carouselNext?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateCarousel();
  });

  carouselDotsContainer?.addEventListener('click', (e) => {
    if (e.target.classList.contains('carousel-dot')) {
      currentIndex = parseInt(e.target.dataset.index);
      updateCarousel();
    }
  });

  // Swipe support & Drag Detection
  let startX = 0;
  let isDragging = false;
  let didDrag = false; // Отслеживаем, был ли это клик или свайп

  function handleSwipe(endX) {
    const diff = startX - endX;
    
    // Если сдвиг больше 5px, считаем, что это перетаскивание, а не клик
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

  function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
    didDrag = false;
  }

  carousel3d.addEventListener('touchstart', handleTouchStart, { passive: true });
  carousel3d.addEventListener('touchend', (e) => {
    if (isDragging) handleSwipe(e.changedTouches[0].clientX);
  });

  carousel3d.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
    didDrag = false;
  });

  carousel3d.addEventListener('mouseup', (e) => {
    if (isDragging) handleSwipe(e.clientX);
  });

// ========== ЛОГИКА КЛИКА ПО КАРТОЧКЕ ==========
carousel3d.addEventListener('click', (e) => {
  if (didDrag) return;

  const cardImage = e.target.closest('.card-image');
  if (!cardImage) return;

  // Находим родительский .carousel-item и берём его data-href
  const item = cardImage.closest('.carousel-item');
  const href = item?.dataset.href;

  if (href) {
    window.location.href = href;
  }
});

  // Initial render
  updateCarousel();
})();

// ========== ВИДЕО ПО КЛИКУ (модальное окно) и УНИВЕРСАЛЬНОЕ ВИДЕО ==========
document.addEventListener('DOMContentLoaded', function() {

  // --- Модальное окно для слайдера ---
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const closeBtn = document.querySelector('.close');

  if (modal && modalVideo && closeBtn) {
    const videoImages = document.querySelectorAll('.swipe-slide img[data-video-src]');

    videoImages.forEach(img => {
      img.addEventListener('click', function(e) {
        e.stopPropagation();
        const videoSrc = this.dataset.videoSrc;
        if (videoSrc) {
          modalVideo.querySelector('source').src = videoSrc;
          modalVideo.load();
          modal.style.display = 'block';
          modalVideo.play().catch(error => {
            console.log('Автовоспроизведение не удалось:', error);
          });
        }
      });
    });

    closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
      modalVideo.pause();
      modalVideo.querySelector('source').src = '';
      modalVideo.load();
    });

    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
        modalVideo.pause();
        modalVideo.querySelector('source').src = '';
        modalVideo.load();
      }
    });
  }

  // --- Универсальное видео по клику (video-gallery.html) ---
  const videoContainers = document.querySelectorAll('.video-container');
  videoContainers.forEach(container => {
  const poster = container.querySelector('.video-poster');
  const colorImg = container.querySelector('.color-reveal');
  const video = container.querySelector('video.video-player');

  if (!poster) return;

  // Режим «цветная картинка»
  if (colorImg && poster.dataset.colorSrc) {
    colorImg.src = poster.dataset.colorSrc;

    container.addEventListener('click', function () {
      container.classList.toggle('playing');
    });

  // Режим «видео»
  } else if (video) {
    container.addEventListener('click', function () {
      container.classList.add('playing');
      video.play().catch(e => console.log('Ошибка:', e));
    });

    video.addEventListener('ended', function () {
      container.classList.remove('playing');
      video.currentTime = 0;
    });
  }
});
});