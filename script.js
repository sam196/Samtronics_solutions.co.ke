// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const products = [
  {
    id: 'mpesa-board',
    name: 'M‑PESA LED Boards',
    img: 'images/mpesa_1200-edited.jpg',
    alt: 'M-Pesa LED Sign',
    shortDesc: 'Fast, reliable display for M-PESA shops.',
    longDesc: 'Bright, durable, and energy-efficient LED boards perfect for M-PESA outlets.',
    price: 1200
  },
  {
    id: 'mpesa-shop',
    name: 'M‑PESA Shop Sign',
    img: 'images/20260320_185819-edited.jpg',
    alt: 'M-Pesa Shop LED Sign',
    shortDesc: 'Affordable sign for M-PESA and shop branding.',
    longDesc: 'Professional M-PESA shop sign with strong visibility, priced for small businesses.',
    price: 3000
  },
  {
    id: 'blinking-sign',
    name: 'Custom Blinking Signs',
    img: 'images/blinking-sign-edited.jpg',
    alt: 'Blinking Custom Sign',
    shortDesc: 'Stand out at night with animated LEDs.',
    longDesc: 'Tailored LED signs that suit your brand identity and attract more customers.',
    price: 4500
  },
  {
    id: 'led-display',
    name: 'Outdoor LED Displays',
    img: 'images/led-display-edited.jpg',
    alt: 'LED Display',
    shortDesc: 'Large signage for events and businesses.',
    longDesc: 'Large digital LED displays for shops, businesses, and events.',
    price: 4500
  },
  {
    id: 'custom-led-1',
    name: 'Custom LED Sign 1',
    img: 'images/custom_phone_repair_15000-edited.jpg',
    alt: 'Custom LED Sign 1',
    shortDesc: 'Premium custom branding solutions.',
    longDesc: 'Tailored LED signs for various applications.',
    price: 15000
  },
  {
    id: 'custom-led-2',
    name: 'Custom LED Sign 2',
    img: 'images/custom_dental_services_10000-edited.jpg',
    alt: 'Custom LED Sign 2',
    shortDesc: 'Classic design with a modern twist.',
    longDesc: 'Another custom LED sign option.',
    price: 10000
  },
  {
    id: 'led-billboard',
    name: 'LED Billboard',
    img: 'images/3d_65000-edited.jpg',
    alt: 'LED Billboard',
    shortDesc: 'Big impact billboard advertising.',
    longDesc: 'High-visibility LED billboards for advertising.',
    price: 65000
  },
  {
    id: 'neon-led-sign',
    name: 'Neon LED Sign',
    img: 'images/cosmetics_double_sided_8000-edited.jpg',
    alt: 'Neon LED Sign',
    shortDesc: 'Stylish neon effect with low power draw.',
    longDesc: 'Eye-catching neon-style LED signs.',
    price: 8000
  },
  {
    id: 'scrolling-led',
    name: 'Scrolling LED Display',
    img: 'images/cyber_1800-edited.jpg',
    alt: 'Scrolling LED Display',
    shortDesc: 'Dynamic message feed in real time.',
    longDesc: 'Dynamic scrolling LED displays for messages.',
    price: 1800
  },
  {
    id: 'kinyozi-plain',
    name: 'Kinyozi Plain',
    img: 'images/kinyozi_custom_5000-edited.jpg',
    alt: 'Kinyozi Plain LED Sign',
    shortDesc: 'Affordable kinyozi sign option for barbershops.',
    longDesc: 'Simple and effective LED sign ideal for kinyozi and barber shop promotions.',
    price: 1800
  },
  {
    id: 'rgb-led-panel',
    name: 'RGB LED Panel',
    img: 'images/nails_10000-edited.jpg',
    alt: 'RGB LED Panel',
    shortDesc: 'Colorful panels for creative lighting effects.',
    longDesc: 'Colorful RGB LED panels for creative displays.',
    price: 10000
  }
];

function normalizeProductName(imgPath) {
  let base = imgPath.split('/').pop().replace('-edited.jpg', '');
  base = base.replace(/_/g, ' ').replace(/-/g, ' ');
  // Remove trailing price numbers and whitespace from file-based name (e.g. "mpesa 1200" -> "mpesa")
  base = base.replace(/\s+\d+$/, '');
  return base.replace(/\b\w/g, c => c.toUpperCase());
}

const heroData = {
  slides: [
    'images/20241120_170358.mp4',
    'images/1a9d9094cbc7009adcce91f029b84b6f.mp4'
  ],
  current: 0,
  interval: 5000,
  timer: null
};

function setupHeroSlider() {
  const dotsContainer = document.getElementById('hero-dots');
  const prev = document.getElementById('hero-prev');
  const next = document.getElementById('hero-next');
  if (!dotsContainer || !prev || !next) return;

  heroData.slides.forEach((_, idx) => {
    const dot = document.createElement('span');
    dot.className = 'hero-dot' + (idx === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      goToSlide(idx);
      restartHeroTimer();
    });
    dotsContainer.appendChild(dot);
  });

  prev.addEventListener('click', () => {
    goToSlide((heroData.current - 1 + heroData.slides.length) % heroData.slides.length);
    restartHeroTimer();
  });
  next.addEventListener('click', () => {
    goToSlide((heroData.current + 1) % heroData.slides.length);
    restartHeroTimer();
  });

  startHeroTimer();
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length || !dots.length) return;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
    if (i === index) {
      slide.currentTime = 0;
      slide.play();
    } else {
      slide.pause();
    }
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  heroData.current = index;
}

function startHeroTimer() {
  heroData.timer = setInterval(() => {
    goToSlide((heroData.current + 1) % heroData.slides.length);
  }, heroData.interval);
}

function restartHeroTimer() {
  clearInterval(heroData.timer);
  startHeroTimer();
}

function renderProducts(productList = products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  if (productList.length === 0) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = productList.map(product => {
    const title = normalizeProductName(product.img);
    return `
      <div class="product">
        <img src="${product.img}" alt="${product.alt}" onerror="this.onerror=null;this.src='images/mpesa_1200-edited.jpg';" loading="lazy">
        <p class="product-short-desc">${product.shortDesc}</p>
        <h4>${title}</h4>
        <p>${product.longDesc}</p>
        <p class="price">KSh ${product.price.toLocaleString()}</p>
        <button class="add-to-cart" data-product="${product.id}" data-price="${product.price}">Add to Cart</button>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const product = button.dataset.product;
      const price = parseInt(button.dataset.price);
      addToCart(product, price);
    });
  });
}

function searchProducts(searchValue) {
  const normalized = searchValue.trim().toLowerCase();
  if (!normalized) return products;

  const terms = normalized.split(/\s+/);
  return products.filter(product => {
    const indexText = `${normalizeProductName(product.img)} ${product.shortDesc} ${product.longDesc} KSh ${product.price}`.toLowerCase();
    return terms.every(term => indexText.includes(term));
  });
}

function initProductSearch() {
  const searchInput = document.getElementById('product-search');
  const noResults = document.getElementById('no-results');
  if (!searchInput || !noResults) return;

  const update = () => {
    const filteredProducts = searchProducts(searchInput.value);
    const filteredGallery = searchGallery(searchInput.value);
    renderProducts(filteredProducts);
    renderGallery(filteredGallery);
    noResults.style.display = (filteredProducts.length === 0 && filteredGallery.length === 0) ? 'block' : 'none';
  };

  searchInput.addEventListener('input', update);
  update();
}

function addToCart(product, price) {
  const existing = cart.find(item => item.product === product);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product, price, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert('Added to cart!');
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

const manualGalleryImages = [
  'airtel_money_1500-edited.jpg',
  'bakery_4500-edited.jpg',
  'bold_laptops_6500-edited.jpg',
  'bold_phone_repair_double_sided_15000-edited.jpg',
  'bold_phone_repair_single_sided_8000-edited.jpg',
  'cafe-3500-edited.jpg',
  'chemist_mpesa_5000-edited.jpg',
  'computers_4500-edited.jpg',
  'cosmetics_double_sided_8000-edited.jpg',
  'custom_kinyozi_5000-edited.jpg',
  'custom_photo_studio_8000-edited.jpg',
  'cyber_1800-edited.jpg',
  'cyber_4500-edited.jpg',
  'equity_mpesa_kcb_4500-edited.jpg',
  'hotel_rooms_5000-edited.jpg',
  'kinyozi_custom_5000-edited.jpg',
  'kinyozi_spa_double_sided_8000-edited.jpg',
  'mpesa_coop_equity_kcb_12000-edited.jpg',
  'mpesa_cyber_5000-edited.jpg',
  'mpesa_kcb_accessories_7500-edited.jpg',
  'mpesa_phone_accessories_5000-edited.jpg',
  'mpesa_supermarket_8000_one sided-edited.jpg',
  'phone_accessories_6500-edited.jpg',
  'phone_repair_4500-edited.jpg',
  'photo_studio_4500-edited.jpg',
  'turkey_wear_4000-edited.jpg'
];

const allGalleryImages = Array.from(new Set([
  ...products.map(p => p.img.replace('images/', '')),
  ...manualGalleryImages
]));

function renderGallery(imageList = allGalleryImages) {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  galleryGrid.innerHTML = imageList.map(file => `
    <img src="images/${file}" alt="Gallery Image" class="gallery-item" loading="lazy">
  `).join('');
}

function searchGallery(searchValue) {
  const normalized = searchValue.trim().toLowerCase();
  if (!normalized) return allGalleryImages;

  const terms = normalized.split(/\s+/);
  return allGalleryImages.filter(file => {
    const fileName = file.replace('-edited.jpg', '').replace(/_/g, ' ').replace(/-/g, ' ').toLowerCase();
    const priceMatch = fileName.match(/\b(\d+)$/);
    const fileText = `${fileName} ${priceMatch ? priceMatch[1] : ''}`;
    return terms.every(term => fileText.includes(term));
  });
}

function initPriceCalculator() {
  const select = document.getElementById('calc-product');
  const qtyInput = document.getElementById('calc-quantity');
  const calcButton = document.getElementById('calc-button');
  const result = document.getElementById('calc-price');
  const comment = document.getElementById('calc-comment');

  if (!select || !qtyInput || !calcButton || !result || !comment) return;

  // populate selector from products array
  products.forEach(product => {
    const opt = document.createElement('option');
    opt.value = product.id;
    opt.textContent = `${product.name} (KSh ${product.price.toLocaleString()})`;
    select.appendChild(opt);
  });

  const updatePrice = () => {
    const productId = select.value;
    const quantity = Math.max(1, Number(qtyInput.value) || 1);
    const selected = products.find(p => p.id === productId);
    if (!selected) {
      result.textContent = '0';
      return;
    }

    const total = selected.price * quantity;
    result.textContent = total.toLocaleString();
  };

  calcButton.addEventListener('click', () => {
    updatePrice();

    const note = comment.value.trim();
    const selected = products.find(p => p.id === select.value);
    if (note && selected) {
      const messageField = document.querySelector('form textarea[name="message"]');
      if (messageField) {
        messageField.value = `Qty: ${qtyInput.value} - ${selected.name}. ${note}`;
      }
    }
  });

  select.addEventListener('change', updatePrice);
  qtyInput.addEventListener('input', updatePrice);

  updatePrice();
}

function initHeroTyping() {
  const captionEl = document.getElementById('hero-caption');
  const text = 'Lighting Up Kenyan Businesses';
  const speed = 80;
  let index = 0;

  if (!captionEl) return;

  captionEl.classList.add('typing-cursor');
  captionEl.textContent = '';

  function type() {
    if (index < text.length) {
      captionEl.textContent += text[index++];
      setTimeout(type, speed);
    } else {
      setTimeout(() => {
        captionEl.textContent = '';
        index = 0;
        type();
      }, 2000);
    }
  }

  type();
}

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  setTheme(saved === 'dark' || saved === 'light' ? saved : preferred);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

renderProducts();
updateCartCount();
renderGallery();
initProductSearch();
setupHeroSlider();
initHeroTyping();
initPriceCalculator();
initTheme();

// Modal
const modal = document.getElementById('cart-modal');
const cartLink = document.getElementById('cart-link');
const closeBtn = document.querySelector('.close');

cartLink.addEventListener('click', (e) => {
  e.preventDefault();
  showCart();
  modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

function showCart() {
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.product} x ${item.quantity}</span>
        <span>KSh ${itemTotal.toLocaleString()}</span>
        <button class="remove-cart-item" data-product="${item.product}">Remove</button>
      </div>
    `;
  });

  document.querySelectorAll('.remove-cart-item').forEach(button => {
    button.addEventListener('click', () => {
      const product = button.dataset.product;
      removeFromCart(product);
      showCart();
    });
  });

  document.getElementById('cart-total').textContent = total.toLocaleString();
}

function removeFromCart(product) {
  cart = cart.filter(item => item.product !== product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function removeDuplicateGalleryImages() {
  const gallery = document.querySelector('.gallery-grid');
  if (!gallery) return;
  const seen = new Set();
  Array.from(gallery.querySelectorAll('img')).forEach(img => {
    const src = img.getAttribute('src');
    if (seen.has(src)) {
      img.remove();
    } else {
      seen.add(src);
    }
  });
}

function initImageLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const zoomIn = document.getElementById('zoom-in');
  const zoomOut = document.getElementById('zoom-out');
  const zoomReset = document.getElementById('zoom-reset');

  if (!lightbox || !lightboxImg || !closeBtn || !zoomIn || !zoomOut || !zoomReset) return;

  let scale = 1;

  const openLightbox = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    scale = 1;
    lightboxImg.style.transform = 'scale(1)';
    lightbox.style.display = 'flex';
  };

  const closeLightbox = () => {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
  };

  const registerImageClick = () => {
    document.querySelectorAll('.gallery-item, .product img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openLightbox(img.src, img.alt || 'Image'));
    });
  };

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  zoomIn.addEventListener('click', () => {
    scale = Math.min(scale + 0.2, 3);
    lightboxImg.style.transform = `scale(${scale})`;
  });
  zoomOut.addEventListener('click', () => {
    scale = Math.max(scale - 0.2, 0.4);
    lightboxImg.style.transform = `scale(${scale})`;
  });
  zoomReset.addEventListener('click', () => {
    scale = 1;
    lightboxImg.style.transform = 'scale(1)';
  });

  const observer = new MutationObserver(() => {
    registerImageClick();
  });

  const productsGrid = document.getElementById('product-grid');
  const galleryGrid = document.getElementById('gallery-grid');
  if (productsGrid) observer.observe(productsGrid, { childList: true, subtree: true });
  if (galleryGrid) observer.observe(galleryGrid, { childList: true, subtree: true });

  registerImageClick();
}

window.addEventListener('DOMContentLoaded', () => {
  removeDuplicateGalleryImages();
  initImageLightbox();
});

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  // For simplicity, just alert. In real app, redirect to checkout page or integrate payment.
  alert('Checkout functionality would be implemented here. For now, contact us directly.');
  // Could send cart data via email or something.
});