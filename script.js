// ============================================
// SAMTRONICS SOLUTIONS - COMPLETE JAVASCRIPT
// LED Signages Kenya - Shopping Cart & M-Pesa Payment
// ============================================

// ============================================
// PRODUCT DATA
// ============================================

const products = [
    { id: 'mpesa-board', name: 'M‑PESA LED Boards', img: 'images/mpesa_1200-edited.jpg', alt: 'M-Pesa LED Sign', shortDesc: 'Fast, reliable display for M-PESA shops.', longDesc: 'Bright, durable, and energy-efficient LED boards perfect for M-PESA outlets.', price: 1200 },
    { id: 'mpesa-shop', name: 'M‑PESA Shop Sign', img: 'images/20260320_185819-edited.jpg', alt: 'M-Pesa Shop LED Sign', shortDesc: 'Affordable sign for M-PESA and shop branding.', longDesc: 'Professional M-PESA shop sign with strong visibility.', price: 3000 },
    { id: 'blinking-sign', name: 'Custom Blinking Signs', img: 'images/blinking-sign-edited.jpg', alt: 'Blinking Custom Sign', shortDesc: 'Stand out at night with animated LEDs.', longDesc: 'Tailored LED signs that suit your brand identity.', price: 4500 },
    { id: 'led-display', name: 'Outdoor LED Displays', img: 'images/led-display-edited.jpg', alt: 'LED Display', shortDesc: 'Large signage for events and businesses.', longDesc: 'Large digital LED displays for shops and events.', price: 4500 },
    { id: 'custom-led-1', name: 'Custom LED Sign 1', img: 'images/custom_phone_repair_15000-edited.jpg', alt: 'Custom LED Sign 1', shortDesc: 'Premium custom branding solutions.', longDesc: 'Tailored LED signs for various applications.', price: 15000 },
    { id: 'custom-led-2', name: 'Custom LED Sign 2', img: 'images/custom_dental_services_10000-edited.jpg', alt: 'Custom LED Sign 2', shortDesc: 'Classic design with a modern twist.', longDesc: 'Another custom LED sign option.', price: 10000 },
    { id: 'led-billboard', name: 'LED Billboard', img: 'images/3d_65000-edited.jpg', alt: 'LED Billboard', shortDesc: 'Big impact billboard advertising.', longDesc: 'High-visibility LED billboards.', price: 65000 },
    { id: 'neon-led-sign', name: 'Neon LED Sign', img: 'images/cosmetics_double_sided_8000-edited.jpg', alt: 'Neon LED Sign', shortDesc: 'Stylish neon effect with low power draw.', longDesc: 'Eye-catching neon-style LED signs.', price: 8000 },
    { id: 'scrolling-led', name: 'Scrolling LED Display', img: 'images/cyber_1800-edited.jpg', alt: 'Scrolling LED Display', shortDesc: 'Dynamic message feed in real time.', longDesc: 'Dynamic scrolling LED displays.', price: 1800 },
    { id: 'kinyozi-plain', name: 'Kinyozi Plain', img: 'images/kinyozi_custom_5000-edited.jpg', alt: 'Kinyozi Plain LED Sign', shortDesc: 'Affordable kinyozi sign option for barbershops.', longDesc: 'Simple and effective LED sign ideal for kinyozi.', price: 1800 },
    { id: 'rgb-led-panel', name: 'RGB LED Panel', img: 'images/nails_10000-edited.jpg', alt: 'RGB LED Panel', shortDesc: 'Colorful panels for creative lighting effects.', longDesc: 'Colorful RGB LED panels.', price: 10000 }
];

// ============================================
// GALLERY IMAGES
// ============================================

const manualGalleryImages = [
    'airtel_money_1500-edited.jpg', 'bakery_4500-edited.jpg', 'bold_laptops_6500-edited.jpg', 'bold_phone_repair_double_sided_15000-edited.jpg',
    'bold_phone_repair_single_sided_8000-edited.jpg', 'cafe-3500-edited.jpg', 'chemist_mpesa_5000-edited.jpg', 'computers_4500-edited.jpg',
    'cosmetics_double_sided_8000-edited.jpg', 'custom_kinyozi_5000-edited.jpg', 'custom_photo_studio_8000-edited.jpg', 'cyber_1800-edited.jpg',
    'cyber_4500-edited.jpg', 'equity_mpesa_kcb_4500-edited.jpg', 'hotel_rooms_5000-edited.jpg', 'kinyozi_custom_5000-edited.jpg',
    'kinyozi_spa_double_sided_8000-edited.jpg', 'mpesa_coop_equity_kcb_12000-edited.jpg', 'mpesa_cyber_5000-edited.jpg', 'mpesa_kcb_accessories_7500-edited.jpg',
    'mpesa_phone_accessories_5000-edited.jpg', 'mpesa_supermarket_8000_one sided-edited.jpg', 'phone_accessories_6500-edited.jpg', 'phone_repair_4500-edited.jpg',
    'photo_studio_4500-edited.jpg', 'turkey_wear_4000-edited.jpg'
];

const allGalleryImages = Array.from(new Set([...products.map(p => p.img.replace('images/', '')), ...manualGalleryImages]));

// ============================================
// SHOPPING CART
// ============================================

let cart = JSON.parse(localStorage.getItem('samtronicsCart')) || [];

// Helper Functions
function normalizeProductName(imgPath) {
    let base = imgPath.split('/').pop().replace('-edited.jpg', '').replace(/_/g, ' ').replace(/-/g, ' ');
    base = base.replace(/\s+\d+$/, '');
    return base.replace(/\b\w/g, c => c.toUpperCase());
}

function formatPrice(price) {
    return `KSh ${price.toLocaleString()}`;
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function saveCart() {
    localStorage.setItem('samtronicsCart', JSON.stringify(cart));
    updateCartCount();
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#22c55e' : '#ef4444'};
        color: white;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ============================================
// RENDER PRODUCTS
// ============================================

function renderProducts(productList = products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = productList.map(product => `
        <div class="product">
            <img src="${product.img}" alt="${product.alt}" loading="lazy" onerror="this.src='images/mpesa_1200-edited.jpg';">
            <p class="product-short-desc">${product.shortDesc}</p>
            <h4>${normalizeProductName(product.img)}</h4>
            <p>${product.longDesc}</p>
            <p class="price">${formatPrice(product.price)}</p>
            <button class="add-to-cart" data-product="${product.id}" data-price="${product.price}">Add to Cart</button>
        </div>
    `).join('');

    attachCartButtons();
}

function attachCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = () => {
            const product = btn.dataset.product;
            const price = parseInt(btn.dataset.price);
            addToCart(product, price);
        };
    });
}

function addToCart(product, price) {
    const existing = cart.find(item => item.product === product);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product, price, quantity: 1 });
    }
    saveCart();
    showNotification('Added to cart!', 'success');
    updateCartDisplay();
}

// ============================================
// RENDER GALLERY
// ============================================

function renderGallery(imageList = allGalleryImages) {
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
        galleryGrid.innerHTML = imageList.map(file => `
            <img src="images/${file}" alt="Gallery Image" class="gallery-item" loading="lazy">
        `).join('');
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function searchProducts(searchValue) {
    const terms = searchValue.trim().toLowerCase().split(/\s+/).filter(t => t);
    if (!terms.length) return products;
    return products.filter(p => {
        const text = `${normalizeProductName(p.img)} ${p.shortDesc} ${p.longDesc} ${p.price}`.toLowerCase();
        return terms.every(term => text.includes(term));
    });
}

function searchGallery(searchValue) {
    const terms = searchValue.trim().toLowerCase().split(/\s+/).filter(t => t);
    if (!terms.length) return allGalleryImages;
    return allGalleryImages.filter(file => {
        const name = file.replace('-edited.jpg', '').replace(/_/g, ' ').replace(/-/g, ' ').toLowerCase();
        return terms.every(term => name.includes(term));
    });
}

function initProductSearch() {
    const input = document.getElementById('product-search');
    const noResults = document.getElementById('no-results');
    if (!input) return;

    const update = () => {
        const filteredProducts = searchProducts(input.value);
        const filteredGallery = searchGallery(input.value);
        renderProducts(filteredProducts);
        renderGallery(filteredGallery);
        if (noResults) noResults.style.display = (filteredProducts.length === 0 && filteredGallery.length === 0) ? 'block' : 'none';
    };

    input.addEventListener('input', update);
    update();
}

// ============================================
// CART DISPLAY
// ============================================

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div style="text-align:center; padding:40px;">Your cart is empty</div>';
        document.getElementById('cart-total').textContent = '0';
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <span>${item.product} x ${item.quantity}</span>
                <span>${formatPrice(itemTotal)}</span>
                <button class="remove-cart-item" data-product="${item.product}">Remove</button>
            </div>
        `;
    }).join('');

    document.getElementById('cart-total').textContent = total.toLocaleString();

    document.querySelectorAll('.remove-cart-item').forEach(btn => {
        btn.onclick = () => {
            cart = cart.filter(i => i.product !== btn.dataset.product);
            saveCart();
            updateCartDisplay();
        };
    });
}

// ============================================
// HERO SLIDER
// ============================================

function setupHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('hero-dots');
    const prev = document.getElementById('hero-prev');
    const next = document.getElementById('hero-next');
    let current = 0;
    let timer;

    function goTo(index) {
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === index);
            if (i === index && s.play) s.play();
            else if (s.pause) s.pause();
        });
        if (dotsContainer) {
            const dots = dotsContainer.children;
            Array.from(dots).forEach((d, i) => d.classList.toggle('active', i === index));
        }
        current = index;
    }

    function nextSlide() { goTo((current + 1) % slides.length); }
    function prevSlide() { goTo((current - 1 + slides.length) % slides.length); }

    if (dotsContainer && slides.length) {
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
            dot.onclick = () => { goTo(i); restartTimer(); };
            dotsContainer.appendChild(dot);
        });
    }

    function restartTimer() { if (timer) clearInterval(timer); timer = setInterval(nextSlide, 5000); }

    if (prev) prev.onclick = () => { prevSlide(); restartTimer(); };
    if (next) next.onclick = () => { nextSlide(); restartTimer(); };
    restartTimer();
}

// ============================================
// PRICE CALCULATOR
// ============================================

function initPriceCalculator() {
    const select = document.getElementById('calc-product');
    const qty = document.getElementById('calc-quantity');
    const btn = document.getElementById('calc-button');
    const span = document.getElementById('calc-price');
    const comment = document.getElementById('calc-comment');

    if (!select) return;

    products.forEach(product => {
        const opt = document.createElement('option');
        opt.value = product.id;
        opt.textContent = `${product.name} (${formatPrice(product.price)})`;
        select.appendChild(opt);
    });

    const update = () => {
        const prod = products.find(p => p.id === select.value);
        if (prod) span.textContent = (prod.price * (Math.max(1, qty.valueAsNumber || 1))).toLocaleString();
        else span.textContent = '0';
    };

    btn.onclick = () => {
        update();
        const note = comment.value.trim();
        const selected = products.find(p => p.id === select.value);
        if (note && selected) {
            const messageField = document.querySelector('form textarea[name="message"]');
            if (messageField) {
                messageField.value = `Qty: ${qty.value} - ${selected.name}. ${note}`;
            }
        }
    };
    select.onchange = update;
    qty.oninput = update;
    update();
}

// ============================================
// LIGHTBOX
// ============================================

function initLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    const imgEl = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    let scale = 1;

    function open(src) {
        imgEl.src = src;
        scale = 1;
        imgEl.style.transform = 'scale(1)';
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        imgEl.src = '';
        document.body.style.overflow = '';
    }

    document.body.addEventListener('click', (e) => {
        const img = e.target.closest('.gallery-item, .product img');
        if (img && img.src) open(img.src);
    });

    if (closeBtn) closeBtn.onclick = closeLightbox;
    if (lightbox) lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };

    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomReset = document.getElementById('zoom-reset');

    if (zoomIn) zoomIn.onclick = () => { scale = Math.min(scale + 0.2, 3); imgEl.style.transform = `scale(${scale})`; };
    if (zoomOut) zoomOut.onclick = () => { scale = Math.max(scale - 0.2, 0.4); imgEl.style.transform = `scale(${scale})`; };
    if (zoomReset) zoomReset.onclick = () => { scale = 1; imgEl.style.transform = 'scale(1)'; };
}

// ============================================
// THEME TOGGLE
// ============================================

function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.body.classList.toggle('dark', theme === 'dark');

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        };
    }
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('main-nav');

    if (toggle && nav) {
        toggle.onclick = () => nav.classList.toggle('nav-open');
        document.querySelectorAll('#main-nav a').forEach(link => {
            link.onclick = () => nav.classList.remove('nav-open');
        });
    }
}

// ============================================
// M-PESA PAYMENT
// ============================================

function initMpesaPayment() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const paymentSection = document.getElementById('payment-section');
    const payAmountSpan = document.getElementById('pay-amount');
    let currentTotal = 0;

    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            currentTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (payAmountSpan) payAmountSpan.textContent = currentTotal.toLocaleString();
            if (paymentSection) paymentSection.style.display = 'block';
            paymentSection.scrollIntoView({ behavior: 'smooth' });
        };
    }

    // STK Push
    const stkPushBtn = document.getElementById('stk-push-btn');
    const mpesaPhone = document.getElementById('mpesa-phone');
    const stkStatus = document.getElementById('stk-status');

    if (stkPushBtn) {
        stkPushBtn.onclick = async () => {
            const phone = mpesaPhone.value.trim();
            if (!phone) {
                alert('Please enter your M-Pesa phone number');
                return;
            }

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            if (stkStatus) {
                stkStatus.textContent = 'Processing payment...';
                stkStatus.style.color = '#ffa500';
            }
            stkPushBtn.disabled = true;
            stkPushBtn.textContent = 'Processing...';

            try {
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
                    if (stkStatus) {
                        stkStatus.textContent = 'Payment request sent! Check your phone and enter PIN to complete.';
                        stkStatus.style.color = '#39ff14';
                    }
                    pollPaymentStatus(data.checkoutRequestID);
                } else {
                    if (stkStatus) {
                        stkStatus.textContent = data.message || 'Payment failed. Please try again.';
                        stkStatus.style.color = '#ff6b6b';
                    }
                    stkPushBtn.disabled = false;
                    stkPushBtn.textContent = 'Pay with M-Pesa';
                }
            } catch (error) {
                if (stkStatus) {
                    stkStatus.textContent = 'Network error. Please try again.';
                    stkStatus.style.color = '#ff6b6b';
                }
                stkPushBtn.disabled = false;
                stkPushBtn.textContent = 'Pay with M-Pesa';
            }
        };
    }

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

                if (data.ResultCode === 0) {
                    clearInterval(interval);
                    if (stkStatus) {
                        stkStatus.textContent = '✅ Payment successful! Thank you for your purchase.';
                        stkStatus.style.color = '#39ff14';
                    }
                    cart = [];
                    saveCart();
                    updateCartDisplay();
                    setTimeout(() => {
                        const modal = document.getElementById('cart-modal');
                        if (modal) modal.style.display = 'none';
                        alert('Order placed successfully! We will contact you shortly.');
                    }, 2000);
                    if (stkPushBtn) {
                        stkPushBtn.disabled = false;
                        stkPushBtn.textContent = 'Pay with M-Pesa';
                    }
                } else if (data.ResultCode && data.ResultCode !== 1037) {
                    clearInterval(interval);
                    if (stkStatus) {
                        stkStatus.textContent = 'Payment failed or was cancelled. Please try again.';
                        stkStatus.style.color = '#ff6b6b';
                    }
                    if (stkPushBtn) {
                        stkPushBtn.disabled = false;
                        stkPushBtn.textContent = 'Pay with M-Pesa';
                    }
                } else if (attempts >= 24) {
                    clearInterval(interval);
                    if (stkStatus) {
                        stkStatus.textContent = 'Payment timeout. Please check your M-Pesa messages.';
                        stkStatus.style.color = '#ffa500';
                    }
                    if (stkPushBtn) {
                        stkPushBtn.disabled = false;
                        stkPushBtn.textContent = 'Pay with M-Pesa';
                    }
                }
            } catch (error) {
                console.error('Status check error:', error);
            }
        }, 5000);
    }

    // Copy Till Number
    const copyTillBtn = document.getElementById('copy-till-btn');
    if (copyTillBtn) {
        copyTillBtn.onclick = () => {
            navigator.clipboard.writeText('5673977');
            copyTillBtn.textContent = 'Copied!';
            setTimeout(() => copyTillBtn.textContent = 'Copy Till Number', 2000);
        };
    }

    // Verify Manual Payment
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
            cart = [];
            saveCart();
            updateCartDisplay();
            const modal = document.getElementById('cart-modal');
            if (modal) modal.style.display = 'none';
            transCode.value = '';
        };
    }
}

// ============================================
// CART MODAL
// ============================================

function initCartModal() {
    const modal = document.getElementById('cart-modal');
    const cartLink = document.getElementById('cart-link');
    const closeBtn = document.querySelector('.close');

    if (cartLink) {
        cartLink.onclick = (e) => {
            e.preventDefault();
            updateCartDisplay();
            modal.style.display = 'block';
        };
    }

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================

renderProducts();
updateCartCount();
renderGallery();
initProductSearch();
setupHeroSlider();
initPriceCalculator();
initLightbox();
initTheme();
initMobileMenu();
initCartModal();
initMpesaPayment();

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
