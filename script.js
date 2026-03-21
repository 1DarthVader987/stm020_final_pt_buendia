let cart = [];
let currentFilter = 'all';
let surveyData = {
  level: '',
  budget: '',
  category: '',
  genre: '',
  instrument: ''
};

// Budget to price range mapping
const budgetRanges = {
  'Low': {min: 0, max: 10000},
  'Medium': {min: 10000, max: 25000},
  'High': {min: 25000, max: 999999}
};

// Sound effect generator
function playHoverSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  
  oscillator.frequency.value = 600;
  oscillator.type = 'sine';
  
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playWhooshSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.5);
  oscillator.type = 'sawtooth';
  
  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function jumpTo(sectionId) {
  document.getElementById(sectionId).scrollIntoView({behavior:'smooth'});
}

function continueSite() {
  document.getElementById('startPopup').classList.add('hidden');
}

function openSurvey() {
  document.getElementById('surveyPopup').classList.remove('hidden');
}

function goBack() {
  document.getElementById('surveyPopup').classList.add('hidden');
  document.getElementById('startPopup').classList.remove('hidden');
}

function applySurvey() {
  const level = document.getElementById('level').value;
  const budget = document.getElementById('budget').value;
  const category = document.getElementById('category').value;
  const genre = document.getElementById('genre').value;
  const instrument = document.getElementById('instrument').value;
  
  // Store survey data
  surveyData = {level, budget, category, genre, instrument};
  
  const recommendation = `Based on your ${level} level and ${budget} budget, we recommend items from the ${category} category!`;
  document.getElementById('recommendation').textContent = recommendation;
  document.getElementById('surveyPopup').classList.add('hidden');
  
  // Filter products based on survey answers
  if(category !== 'All') {
    currentFilter = category.toLowerCase();
  } else {
    currentFilter = 'all';
  }
  
  applyFilters();
  jumpTo('shop');
}

function addToCart(name, price) {
  cart.push({name, price});
  updateCart();
  alert(name + ' added to cart!');
}

function updateCart() {
  const cartItemsDiv = document.getElementById('cartItems');
  cartItemsDiv.innerHTML = '';
  let total = 0;
  
  if(cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('total').textContent = 'Total: ₱0';
    return;
  }
  
  cart.forEach((item, index) => {
    // Find the product details
    const products = document.querySelectorAll('.product');
    let productImg = 'https://via.placeholder.com/100x60?text=No+Image';
    let productBrand = 'Unknown';
    products.forEach(prod => {
      if (prod.querySelector('h3').textContent === item.name) {
        productImg = prod.querySelector('img').src;
        productBrand = prod.getAttribute('data-brand') || 'Unknown';
      }
    });
    
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${productImg}" alt="${item.name}" style="width:80px;height:60px;object-fit:contain;border-radius:5px;">
      <div class="cart-details">
        <p><strong>Brand:</strong> ${productBrand}</p>
        <p><strong>Model:</strong> ${item.name}</p>
        <p><strong>Price:</strong> ₱${item.price}</p>
      </div>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
    cartItemsDiv.appendChild(div);
    total += item.price;
  });
  
  document.getElementById('total').textContent = `Total: ₱${total}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

function checkout() {
  if(cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  document.getElementById('deliveryPopup').classList.remove('hidden');
}

function filterCategory(category) {
  currentFilter = category;
  applyFilters();
}

function resetFilters() {
  currentFilter = 'all';
  document.getElementById('brandFilter').value = 'all';
  document.getElementById('priceSort').value = 'none';
  applyFilters();
}

function backToDefaults() {
  // Clear survey data
  surveyData = {
    level: '',
    budget: '',
    category: '',
    genre: '',
    instrument: ''
  };
  
  // Reset recommendation text
  document.getElementById('recommendation').textContent = 'Take the survey to get personalized recommendations.';
  
  // Reset all filters
  resetFilters();
}

function applyFilters() {
  const products = document.querySelectorAll('.product');
  const brandFilter = document.getElementById('brandFilter').value;
  const priceSort = document.getElementById('priceSort').value;
  
  // Get budget range if survey was completed
  let budgetRange = {min: 0, max: 999999};
  if(surveyData.budget) {
    budgetRange = budgetRanges[surveyData.budget];
  }
  
  products.forEach(product => {
    let show = true;
    const productPrice = parseInt(product.getAttribute('data-price'));
    
    // Filter by category
    if(currentFilter !== 'all' && !product.classList.contains(currentFilter)) {
      show = false;
    }
    
    // Filter by brand
    if(brandFilter !== 'all' && product.getAttribute('data-brand') !== brandFilter) {
      show = false;
    }
    
    // Filter by budget (if survey was completed)
    if(surveyData.budget && (productPrice < budgetRange.min || productPrice > budgetRange.max)) {
      show = false;
    }
    
    product.style.display = show ? 'block' : 'none';
  });
  
  if(priceSort === 'high') {
    sortProductsByPrice(true);
  } else if(priceSort === 'low') {
    sortProductsByPrice(false);
  }
}

function sortProductsByPrice(descending) {
  const container = document.getElementById('products');
  const products = Array.from(container.querySelectorAll('.product:not([style*="display: none"])'));
  
  products.sort((a, b) => {
    const priceA = parseInt(a.getAttribute('data-price'));
    const priceB = parseInt(b.getAttribute('data-price'));
    return descending ? priceB - priceA : priceA - priceB;
  });
  
  products.forEach(p => container.appendChild(p));
}

function searchProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const products = document.querySelectorAll('.product');
  
  products.forEach(product => {
    const name = product.querySelector('h3').textContent.toLowerCase();
    const brand = product.getAttribute('data-brand').toLowerCase();
    if(name.includes(query) || brand.includes(query)) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

function sendMessage(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  alert(`Thank you, ${name}! We will get back to you soon.`);
  event.target.reset();
}

// Background music support
const bgMusic = document.getElementById('backgroundMusic');
let ambientSynthActive = false;
let ambientInterval;
let ambientContext;

function playAmbientMusic() {
  if (ambientSynthActive) return;
  ambientSynthActive = true;
  ambientContext = new (window.AudioContext || window.webkitAudioContext)();

  function scheduleChord(time, rootFreq) {
    const intervals = [0, 4, 7];
    intervals.forEach((interval, idx) => {
      const osc = ambientContext.createOscillator();
      const gain = ambientContext.createGain();
      osc.type = ['sine', 'triangle', 'sawtooth'][idx % 3];
      osc.frequency.value = rootFreq * Math.pow(2, interval / 12);
      gain.gain.setValueAtTime(0.008, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.7);
      osc.connect(gain);
      gain.connect(ambientContext.destination);
      osc.start(time);
      osc.stop(time + 3);
    });
  }

  ambientInterval = setInterval(() => {
    const base = 110 + Math.random() * 80;
    const now = ambientContext.currentTime;
    scheduleChord(now, base);
  }, 3000);
}

function stopAmbientMusic() {
  if (!ambientSynthActive) return;
  ambientSynthActive = false;
  clearInterval(ambientInterval);
  ambientInterval = null;
  if (ambientContext) {
    ambientContext.close();
    ambientContext = null;
  }
}

function setMusicStatus(text) {
  const status = document.getElementById('musicStatus');
  if (status) status.textContent = `Status: ${text}`;
}

function toggleMode() {
  document.body.classList.toggle('light');
  updateDarkModeButton();
}

function updateDarkModeButton() {
  const button = document.getElementById('darkModeToggle');
  if (!button) return;
  if (document.body.classList.contains('light')) {
    button.textContent = '☀️ Light Mode';
  } else {
    button.textContent = '🌙 Dark Mode';
  }
}

function startBackgroundMusic() {
  setMusicStatus('Starting...');
  if (bgMusic && bgMusic.src) {
    bgMusic.muted = false;
    bgMusic.volume = 0.35;
    bgMusic.play().then(() => {
      setMusicStatus('Playing (file)');
      document.getElementById('musicToggle').textContent = '⏸️ Pause Music';
    }).catch(() => {
      setMusicStatus('File blocked, fallback synth');
      playAmbientMusic();
      document.getElementById('musicToggle').textContent = '⏸️ Pause Music';
    });
  } else {
    setMusicStatus('No file; using synth');
    playAmbientMusic();
    document.getElementById('musicToggle').textContent = '⏸️ Pause Music';
  }
}

function toggleMusic() {
  const btn = document.getElementById('musicToggle');
  if (bgMusic && !bgMusic.paused) {
    bgMusic.pause();
    stopAmbientMusic();
    btn.textContent = '▶️ Play Music';
    setMusicStatus('Paused');
  } else {
    if (bgMusic) {
      bgMusic.play().then(() => {
        setMusicStatus('Playing (file)');
      }).catch(() => {
        setMusicStatus('Synth started');
      });
    }
    playAmbientMusic();
    btn.textContent = '⏸️ Pause Music';
    setMusicStatus('Playing');
  }
}

function submitOrder(event) {
  event.preventDefault();
  const name = document.getElementById('deliveryName').value;
  const address = document.getElementById('deliveryAddress').value;
  const contact = document.getElementById('deliveryContact').value;
  const delivery = document.getElementById('deliveryOptions').value;
  
  alert(`Thank you, ${name}! Your order will be delivered to ${address}. We will contact you at ${contact}. Delivery option: ${delivery}.`);
  clearCart();
  closeDeliveryPopup();
}

function closeDeliveryPopup() {
  document.getElementById('deliveryPopup').classList.add('hidden');
  document.getElementById('deliveryPopup').querySelector('form').reset();
}

function scrollToTop() {
  window.scrollTo({top: 0, behavior: 'smooth'});
}

window.addEventListener('load', () => {
  // Play whoosh sound for intro
  playWhooshSound();
  
  // Add hover sound to all buttons and nav links
  document.querySelectorAll('button, nav a').forEach(element => {
    element.addEventListener('mouseenter', playHoverSound);
  });
  
  // Background image cycling
  const backgrounds = ['background1.jpg', 'background2.jpg', 'background3.jpg', 'background4.jpg'];
  let currentBgIndex = 0;
  
  // Set initial background immediately
  document.body.style.background = `linear-gradient(135deg,rgba(13,27,42,0.8) 0%,rgba(27,38,59,0.8) 50%,rgba(15,52,96,0.8) 100%),url('${backgrounds[currentBgIndex]}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
  
  setInterval(() => {
    currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
    document.body.style.background = `linear-gradient(135deg,rgba(13,27,42,0.8) 0%,rgba(27,38,59,0.8) 50%,rgba(15,52,96,0.8) 100%),url('${backgrounds[currentBgIndex]}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }, 13000); // Change every 13 seconds
  
  // Scroll to top after splash screen fades
  setTimeout(() => {
    window.scrollTo(0, 0);
    startBackgroundMusic();
  }, 4500);
  
  setTimeout(() => {
    document.getElementById('startPopup').classList.remove('hidden');
  }, 1000);
  
  updateDarkModeButton();

  // Show back to top button on scroll
  window.addEventListener('scroll', () => {
    const backToTop = document.querySelector('.back-to-top');
    if(window.scrollY > 300) {
      backToTop.style.display = 'block';
    } else {
      backToTop.style.display = 'none';
    }
  });
});