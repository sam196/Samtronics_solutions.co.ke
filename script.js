// ============================================
// SAMTRONICS SOLUTIONS - FRONTEND JAVASCRIPT
// This file handles all the interactive features:
// - Shopping cart
// - Product display
// - Gallery
// - M-Pesa payments
// - Search
// - Dark mode
// ============================================

// ============================================
// SHOPPING CART
// ============================================

// Get cart from browser storage, or start with empty array
// localStorage is like a notebook that remembers data even after page refresh
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ============================================
// PRODUCT DATA - All items for sale
// ============================================

const products = [
  { 
    id: 'mpesa-board',           // Unique ID for this product
    name: 'M‑PESA LED Boards',   // Display name
    img: 'images/mpesa_1200-edited.jpg',  // Image path
    alt: 'M-Pesa LED Sign',      // Alt text for accessibility
    shortDesc: 'Fast, reliable display for M-PESA shops.',
    longDesc: 'Bright, durable, and energy-efficient LED boards.',
    price: 1                  // Price in KSh
  },
  { 
    id: 'mpesa-shop', 
    name: 'M‑PESA Shop Sign', 
    img: 'images/20260320_185819-edited.jpg', 
    alt: 'M-Pesa Shop Sign', 
    shortDesc: 'Affordable sign for M-PESA shops.', 
    longDesc: 'Professional M-PESA shop sign.', 
    price: 3000 
  },
  { 
    id: 'blinking-sign', 
    name: 'Custom Blinking Signs', 
    img: 'images/blinking-sign-edited.jpg', 
    alt: 'Blinking Sign', 
    shortDesc: 'Stand out at night with animated LEDs.', 
    longDesc: 'Tailored LED signs for your brand.', 
    price: 4500 
  },
  { 
    id: 'led-display', 
    name: 'Outdoor LED Displays', 
    img: 'images/led-display-edited.jpg', 
    alt: 'LED Display', 
    shortDesc: 'Large signage for events.', 
    longDesc: 'Large digital LED displays.', 
    price: 4500 
  },
  { 
    id: 'custom-led-1', 
    name: 'Custom LED Sign', 
    img: 'images/custom_phone_repair_15000-edited.jpg', 
    alt: 'Custom LED', 
    shortDesc: 'Premium custom branding.', 
    longDesc: 'Tailored LED signs.', 
    price: 15000 
  },
  { 
    id: 'custom-led-2', 
    name: 'Custom LED Sign 2', 
    img: 'images/custom_dental_services_10000-edited.jpg', 
    alt: 'Custom LED 2', 
    shortDesc: 'Classic design.', 
    longDesc: 'Custom LED sign option.', 
    price: 10000 
  },
  { 
    id: 'led-billboard', 
    name: 'LED Billboard', 
    img: 'images/3d_65000-edited.jpg', 
    alt: 'Billboard', 
    shortDesc: 'Big impact advertising.', 
    longDesc: 'High-visibility LED billboards.', 
    price: 65000 
  },
  { 
    id: 'neon-led-sign', 
    name: 'Neon LED Sign', 
    img: 'images/cosmetics_double_sided_8000-edited.jpg', 
    alt: 'Neon Sign', 
    shortDesc: 'Stylish neon effect.', 
    longDesc: 'Eye-catching neon-style LED signs.', 
    price: 8000 
  },
  { 
    id: 'scrolling-led', 
    name: 'Scrolling LED Display', 
    img: 'images/cyber_1800-edited.jpg', 
    alt: 'Scrolling Display', 
    shortDesc: 'Dynamic message feed.', 
    longDesc: 'Dynamic scrolling LED displays.', 
    price: 1800 
  },
  { 
    id: 'kinyozi-plain', 
    name: 'Kinyozi Sign', 
    img: 'images/kinyozi_custom_5000-edited.jpg', 
    alt: 'Kinyozi Sign', 
    shortDesc: 'Affordable barbershop sign.', 
    longDesc: 'Simple LED sign for barbershops.', 
    price: 1800 
  },
  { 
    id: 'rgb-led-panel', 
    name: 'RGB LED Panel', 
    img: 'images/nails_10000-edited.jpg', 
    alt: 'RGB Panel', 
    shortDesc: 'Colorful lighting effects.', 
    longDesc: 'Colorful RGB LED panels.', 
    price: 10000 
  }
];

// ============================================
// GALLERY IMAGES
// ============================================

const allGalleryImages = [
  'airtel_money_1500-edited.jpg', 'bakery_4500-edited.jpg', 'bold_laptops_6500-edited.jpg',
  'bold_phone_repair_double_sided_15000-edited.jpg', 'cafe-3500-edited.jpg', 'chemist_mpesa_5000-edited.jpg',
  'computers_4500-edited.jpg', 'cosmetics_double_sided_8000-edited.jpg', 'custom_kinyozi_5000-edited.jpg',
  'cyber_1800-edited.jpg', 'cyber_4500-edited.jpg', 'equity_mpesa_kcb_4500-edited.jpg',
  'hotel_rooms_5000-edited.jpg', 'kinyozi_spa_double_sided_8000-edited.jpg', 'mpesa_coop_equity_kcb_12000-edited.jpg',
  'mpesa_cyber_5000-edited.jpg', 'mpesa_kcb_accessories_7500-edited.jpg', 'mpesa_phone_accessories_5000-edited.jpg',
  'phone_accessories_6500-edited.jpg', 'phone_repair_4500-edited.jpg', 'photo_studio_4500-edited.jpg',
  'turkey_wear_4000-edited.jpg'
];

// ============================================
// HELPER FUNCTION - Format product names nicely
// ============================================

function normalizeProductName(imgPath) {
  // Extract filename, remove "-edited.jpg", replace underscores with spaces
  let base = imgPath.split('/').pop().replace('-edited.jpg', '').replace(/_/g, ' ');
  // Remove any numbers at the end (like "1200")
  base = base.replace(/\s+\d+$/, '');
  // Capitalize first letter of each word
  return base.replace(/\b\w/g, c => c.toUpperCase());
}

// ============================================
// FUNCTION: Display Products on Page
// ============================================

function renderProducts(productList = products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;  // Exit if element doesn't exist
  
  // Create HTML for each product
  grid.innerHTML = productList.map(product => `
    <div class="product">
      <img src="${product.img}" alt="${product.alt}" loading="lazy">
      <p class="product-short-desc">${product.shortDesc}</p>
      <h4>${normalizeProductName(product.img)}</h4>
      <p>${product.longDesc}</p>
      <p class="price">KSh ${product.price.toLocaleString()}</p>
      <button class="add-to-cart" data-product="${product.id}" data-price="${product.price}">
        Add to Cart
      </button>
    </div>
  `).join('');
  
  // Attach click handlers to all "Add to Cart" buttons
  attachCartButtons();
}

// ============================================
// FUNCTION: Connect Add to Cart Buttons
// ============================================

function attachCartButtons() {
  // Find all add-to-cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    // When button is clicked, add product to cart
    btn.onclick = () => {
      const product = btn.dataset.product;  // Get product ID
      const price = parseInt(btn.dataset.price);  // Get price
      addToCart(product, price);
    };
  });
}

// ============================================
// FUNCTION: Add Item to Shopping Cart
// ============================================

function addToCart(product, price) {
  // Check if product already in cart
  const existing = cart.find(item => item.product === product);
  
  if (existing) {
    // If exists, increase quantity
    existing.quantity += 1;
  } else {
    // If new, add to cart with quantity 1
    cart.push({ product, price, quantity: 1 });
  }
  
  // Save to browser storage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count display
  updateCartCount();
  
  // Notify user
  alert('Added to cart!');
}

// ============================================
// FUNCTION: Update Cart Count Display
// ============================================

function updateCartCount() {
  // Sum up all quantities
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = count;
}

// ============================================
// FUNCTION: Display Gallery Images
// ============================================

function renderGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    // Create an image for each gallery file
    galleryGrid.innerHTML = allGalleryImages.map(file => 
      `<img src="images/${file}" alt="Gallery" class="gallery-item" loading="lazy">`
    ).join('');
  }
}

// ============================================
// FUNCTION: Product Search
// ============================================

function initProductSearch() {
  const input = document.getElementById('product-search');
  if (!input) return;
  
  // When user types in search box
  input.oninput = () => {
    const searchTerm = input.value.toLowerCase();
    
    // Filter products that match search term
    const filtered = products.filter(p => 
      normalizeProductName(p.img).toLowerCase().includes(searchTerm) ||
      p.shortDesc.toLowerCase().includes(searchTerm) ||
      p.price.toString().includes(searchTerm)
    );
    
    // Show filtered products
    renderProducts(filtered);
    
    // Show "no results" message if needed
    const noResults = document.getElementById('no-results');
    if (noResults) noResults.style.display = filtered.length === 0 ? 'block' : 'none';
  };
}

// ============================================
// FUNCTION: Hero Video Slider
// ============================================

function setupHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('hero-dots');
  const prev = document.getElementById('hero-prev');
  const next = document.getElementById('hero-next');
  let current = 0;
  let timer;
  
  function goTo(index) {
    // Show selected slide, hide others
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    
    // Update active dot
    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((d, i) => d.classList.toggle('active', i === index));
    }
    current = index;
  }
  
  function nextSlide() { goTo((current + 1) % slides.length); }
  function prevSlide() { goTo((current - 1 + slides.length) % slides.length); }
  
  // Create dots for each slide
  if (dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => { goTo(i); restartTimer(); };
      dotsContainer.appendChild(dot);
    });
  }
  
  // Auto-rotate every 5 seconds
  function restartTimer() { if (timer) clearInterval(timer); timer = setInterval(nextSlide, 5000); }
  
  // Handle prev/next buttons
  if (prev) prev.onclick = () => { prevSlide(); restartTimer(); };
  if (next) next.onclick = () => { nextSlide(); restartTimer(); };
  restartTimer();
}

// ============================================
// FUNCTION: Price Calculator
// ============================================

function initPriceCalculator() {
  const select = document.getElementById('calc-product');
  const qty = document.getElementById('calc-quantity');
  const btn = document.getElementById('calc-button');
  const span = document.getElementById('calc-price');
  
  // Populate product dropdown
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (KSh ${p.price.toLocaleString()})`;
    select.appendChild(opt);
  });
  
  // Calculate total price
  const update = () => {
    const prod = products.find(p => p.id === select.value);
    if (prod) {
      const total = prod.price * (Math.max(1, qty.valueAsNumber || 1));
      span.textContent = total.toLocaleString();
    } else {
      span.textContent = '0';
    }
  };
  
  // Attach event listeners
  btn.onclick = update;
  select.onchange = update;
  qty.oninput = update;
  update();
}

// ============================================
// FUNCTION: Image Lightbox (Zoom Popup)
// ============================================

function initLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const imgEl = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  let scale = 1;
  
  // When any product or gallery image is clicked
  document.body.addEventListener('click', (e) => {
    const img = e.target.closest('.gallery-item, .product img');
    if (img && img.src) {
      imgEl.src = img.src;           // Set image source
      scale = 1;                      // Reset zoom
      imgEl.style.transform = 'scale(1)';
      lightbox.style.display = 'flex';  // Show lightbox
      document.body.style.overflow = 'hidden';  // Prevent scrolling
    }
  });
  
  // Close lightbox
  closeBtn.onclick = () => {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  };
  
  // Click background to close
  lightbox.onclick = (e) => { if (e.target === lightbox) closeBtn.onclick(); };
  
  // Zoom controls
  document.getElementById('zoom-in').onclick = () => {
    scale = Math.min(scale + 0.2, 3);
    imgEl.style.transform = `scale(${scale})`;
  };
  document.getElementById('zoom-out').onclick = () => {
    scale = Math.max(scale - 0.2, 0.4);
    imgEl.style.transform = `scale(${scale})`;
  };
  document.getElementById('zoom-reset').onclick = () => {
    scale = 1;
    imgEl.style.transform = 'scale(1)';
  };
}

// ============================================
// FUNCTION: Dark/Light Mode Toggle
// ============================================

function initTheme() {
  // Check for saved preference
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  
  // Apply theme
  document.body.classList.toggle('dark', theme === 'dark');
  
  // Toggle on button click
  document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  };
}

// ============================================
// FUNCTION: Mobile Menu (Hamburger)
// ============================================

function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('main-nav');
  
  if (toggle && nav) {
    // Toggle menu when button clicked
    toggle.onclick = () => nav.classList.toggle('nav-open');
    
    // Close menu when clicking a link
    document.querySelectorAll('#main-nav a').forEach(link => {
      link.onclick = () => nav.classList.remove('nav-open');
    });
  }
}

// ============================================
// FUNCTION: M-Pesa Payment Integration
// ============================================

function initMpesaPayment() {
  const checkoutBtn = document.getElementById('checkout-btn');
  const paymentSection = document.getElementById('payment-section');
  const payAmountSpan = document.getElementById('pay-amount');
  let currentTotal = 0;
  
  // ============================================
  // Show payment options when checkout clicked
  // ============================================
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      // Calculate total
      currentTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (payAmountSpan) payAmountSpan.textContent = currentTotal.toLocaleString();
      
      // Show payment section
      if (paymentSection) paymentSection.style.display = 'block';
      paymentSection.scrollIntoView({ behavior: 'smooth' });
    };
  }
  
  // ============================================
  // STK PUSH - Send payment request to phone
  // ============================================
  const stkPushBtn = document.getElementById('stk-push-btn');
  const mpesaPhone = document.getElementById('mpesa-phone');
  const stkStatus = document.getElementById('stk-status');
  
  if (stkPushBtn) {
    stkPushBtn.onclick = async () => {
      const phone = mpesaPhone.value.trim();
      
      // Validate phone number
      if (!phone) {
        alert('Please enter your M-Pesa phone number');
        return;
      }
      
      // Calculate total
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Show processing message
      stkStatus.textContent = 'Processing payment...';
      stkStatus.style.color = '#ffa500';
      stkPushBtn.disabled = true;
      stkPushBtn.textContent = 'Processing...';
      
      try {
        // Send request to your server
        const response = await fetch('/api/mpesa/stkpush', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone,
            amount: total,
            accountReference: `SAM-${Date.now()}`,
            transactionDesc: 'LED Signage Purchase'
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          stkStatus.textContent = 'Payment request sent! Check your phone and enter PIN to complete.';
          stkStatus.style.color = '#39ff14';
          
          // Start checking payment status
          pollPaymentStatus(data.checkoutRequestID);
        } else {
          stkStatus.textContent = data.message || 'Payment failed. Please try again.';
          stkStatus.style.color = '#ff6b6b';
          stkPushBtn.disabled = false;
          stkPushBtn.textContent = 'Pay with M-Pesa';
        }
      } catch (error) {
        stkStatus.textContent = 'Network error. Please try again.';
        stkStatus.style.color = '#ff6b6b';
        stkPushBtn.disabled = false;
        stkPushBtn.textContent = 'Pay with M-Pesa';
      }
    };
  }
  
  // ============================================
  // Check payment status repeatedly
  // ============================================
  function pollPaymentStatus(checkoutRequestID) {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch('/api/mpesa/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestID })
        });
        
        const data = await response.json();
        
        // ResultCode 0 = success
        if (data.ResultCode === 0) {
          clearInterval(interval);
          stkStatus.textContent = '✅ Payment successful! Thank you for your purchase.';
          stkStatus.style.color = '#39ff14';
          
          // Clear cart
          cart = [];
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
          
          // Close modal and show success
          setTimeout(() => {
            const modal = document.getElementById('cart-modal');
            if (modal) modal.style.display = 'none';
            alert('Order placed successfully! We will contact you shortly.');
          }, 2000);
          
          // Reset button
          const stkBtn = document.getElementById('stk-push-btn');
          if (stkBtn) {
            stkBtn.disabled = false;
            stkBtn.textContent = 'Pay with M-Pesa';
          }
        } 
        // 1037 = pending, other codes = failure
        else if (data.ResultCode && data.ResultCode !== 1037) {
          clearInterval(interval);
          stkStatus.textContent = 'Payment failed or was cancelled. Please try again.';
          stkStatus.style.color = '#ff6b6b';
          
          const stkBtn = document.getElementById('stk-push-btn');
          if (stkBtn) {
            stkBtn.disabled = false;
            stkBtn.textContent = 'Pay with M-Pesa';
          }
        } 
        // Timeout after 2 minutes (24 attempts * 5 seconds)
        else if (attempts >= 24) {
          clearInterval(interval);
          stkStatus.textContent = 'Payment timeout. Please check your M-Pesa messages.';
          stkStatus.style.color = '#ffa500';
          
          const stkBtn = document.getElementById('stk-push-btn');
          if (stkBtn) {
            stkBtn.disabled = false;
            stkBtn.textContent = 'Pay with M-Pesa';
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 5000);  // Check every 5 seconds
  }
  
  // ============================================
  // COPY TILL NUMBER TO CLIPBOARD
  // ============================================
  const copyTillBtn = document.getElementById('copy-till-btn');
  if (copyTillBtn) {
    copyTillBtn.onclick = () => {
      navigator.clipboard.writeText('5673977');
      copyTillBtn.textContent = 'Copied!';
      setTimeout(() => copyTillBtn.textContent = 'Copy Till Number', 2000);
    };
  }
  
  // ============================================
  // VERIFY MANUAL PAYMENT (Till Number)
  // ============================================
  const verifyBtn = document.getElementById('verify-payment');
  const transCode = document.getElementById('trans-code');
  
  if (verifyBtn) {
    verifyBtn.onclick = () => {
      const code = transCode.value.trim();
      if (!code) {
        alert('Please enter your M-Pesa transaction code');
        return;
      }
      
      alert('Payment recorded! We will verify and contact you shortly.');
      
      // Clear cart
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      
      // Close modal
      const modal = document.getElementById('cart-modal');
      if (modal) modal.style.display = 'none';
      
      transCode.value = '';
    };
  }
}

// ============================================
// FUNCTION: Shopping Cart Modal (Popup)
// ============================================

function initCartModal() {
  const modal = document.getElementById('cart-modal');
  const cartLink = document.getElementById('cart-link');
  const closeBtn = document.querySelector('.close');
  
  function showCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    
    if (container) {
      container.innerHTML = '';
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        container.innerHTML += `
          <div class="cart-item">
            <span>${item.product} x ${item.quantity}</span>
            <span>KSh ${itemTotal.toLocaleString()}</span>
            <button class="remove-cart-item" data-product="${item.product}">Remove</button>
          </div>
        `;
      });
      
      document.getElementById('cart-total').textContent = total.toLocaleString();
      
      // Add remove button functionality
      document.querySelectorAll('.remove-cart-item').forEach(btn => {
        btn.onclick = () => {
          cart = cart.filter(i => i.product !== btn.dataset.product);
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
          showCart();  // Refresh cart display
        };
      });
    }
  }
  
  // Open cart when link clicked
  if (cartLink) {
    cartLink.onclick = (e) => {
      e.preventDefault();
      showCart();
      modal.style.display = 'block';
    };
  }
  
  // Close cart
  if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

// ============================================
// INITIALIZE EVERYTHING - Start all features
// ============================================

renderProducts();        // Show products on page
updateCartCount();       // Update cart count display
renderGallery();         // Show gallery images
initProductSearch();     // Enable search functionality
setupHeroSlider();       // Start video slider
initPriceCalculator();   // Enable price calculator
initLightbox();          // Enable image zoom
initTheme();             // Apply dark/light mode
initMobileMenu();        // Enable mobile hamburger menu
initCartModal();         // Enable shopping cart popup
initMpesaPayment();      // Enable M-Pesa payments
