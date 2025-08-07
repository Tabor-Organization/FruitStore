import './style.css'
import { renderRegistrationForm, setupRegistrationForm } from './registration'

type Fruit = {
  name: string;
  price: number;
};

const fruits: Fruit[] = [
  { name: 'Apple', price: 1.29 },
  { name: 'Banana', price: 0.79 },
  { name: 'Orange', price: 1.09 },
  { name: 'Cherry', price: 2.49 },
  { name: 'Grape', price: 3.99 },
  { name: 'Kiwi', price: 1.79 },
  { name: 'Lemon', price: 0.89 },
  { name: 'Mango', price: 2.99 },
  { name: 'Peach', price: 1.99 },
  { name: 'Pear', price: 1.49 },
  { name: 'Pineapple', price: 4.99 },
  { name: 'Strawberry', price: 3.49 },
  { name: 'Watermelon', price: 5.99 },
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

type Basket = {
  [fruit: string]: { quantity: number; price: number };
};

const basket: Basket = {};

// Pagination state
const ITEMS_PER_PAGE = 9;
let currentPage = 0;

// App state
type AppView = 'shop' | 'register';
let currentView: AppView = 'shop';

// Get fruit emoji/icon for display
function getFruitIcon(fruitName: string): string {
  const fruitIcons: { [key: string]: string } = {
    'Apple': '🍎',
    'Banana': '🍌',
    'Cherry': '🍒',
    'Grape': '🍇',
    'Kiwi': '🥝',
    'Lemon': '🍋',
    'Mango': '🥭',
    'Orange': '🍊',
    'Peach': '🍑',
    'Pear': '🍐',
    'Pineapple': '🍍',
    'Strawberry': '🍓',
    'Watermelon': '🍉'
  };
  return fruitIcons[fruitName] || '🍎';
}

// Get paginated fruits
function getPaginatedFruits() {
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  return fruits.slice(startIndex, endIndex);
}

// Get total pages
function getTotalPages() {
  return Math.ceil(fruits.length / ITEMS_PER_PAGE);
}

function renderApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  // Render navigation
  const navHtml = `
    <div class="nav-container">
      <button class="nav-btn ${currentView === 'shop' ? 'active' : ''}" id="shop-nav">🛒 Shop</button>
      <button class="nav-btn ${currentView === 'register' ? 'active' : ''}" id="register-nav">👤 Register</button>
    </div>
  `;
  
  if (currentView === 'shop') {
    renderShop(app, navHtml);
  } else if (currentView === 'register') {
    renderRegistration(app, navHtml);
  }
  
  // Setup navigation event listeners
  setupNavigation();
}

function renderShop(app: HTMLDivElement, navHtml: string) {
  const paginatedFruits = getPaginatedFruits();
  const totalPages = getTotalPages();
  
  app.innerHTML = `
    ${navHtml}
    <h1>Fruit Shop</h1>
    <div class="pagination-info">
      Page ${currentPage + 1} of ${totalPages} (${fruits.length} fruits total)
    </div>
    <div class="fruit-grid">
      ${paginatedFruits
        .map(
          (fruit, idx) => `
            <div class="fruit-card">
              <div class="fruit-icon">${getFruitIcon(fruit.name)}</div>
              <h3 class="fruit-name">${fruit.name}</h3>
              <p class="fruit-price">$${fruit.price.toFixed(2)}</p>
              <button class="add-to-basket-btn" data-fruit="${currentPage * ITEMS_PER_PAGE + idx}">Add to Basket</button>
            </div>
          `
        )
        .join('')}
    </div>
    <div class="pagination-controls">
      <button id="first-page" ${currentPage === 0 ? 'disabled' : ''}>⏮️ First</button>
      <button id="prev-page" ${currentPage === 0 ? 'disabled' : ''}>⏪ Previous</button>
      <span class="page-indicator">${currentPage + 1} / ${totalPages}</span>
      <button id="next-page" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>Next ⏩</button>
      <button id="last-page" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>Last ⏭️</button>
    </div>
    <h2>Basket</h2>
    <div id="basket"></div>
  `;

  // Add event listeners for add to basket buttons
  document.querySelectorAll<HTMLButtonElement>('.add-to-basket-btn').forEach((btn) => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.fruit);
      const fruit = fruits[idx];
      if (!basket[fruit.name]) {
        basket[fruit.name] = { quantity: 0, price: fruit.price };
      }
      basket[fruit.name].quantity += 1;
      renderBasket();
    };
  });

  // Add event listeners for pagination controls
  const firstBtn = document.getElementById('first-page');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const lastBtn = document.getElementById('last-page');

  if (firstBtn) {
    firstBtn.onclick = () => {
      currentPage = 0;
      renderApp();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentPage > 0) {
        currentPage--;
        renderApp();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentPage < totalPages - 1) {
        currentPage++;
        renderApp();
      }
    };
  }

  if (lastBtn) {
    lastBtn.onclick = () => {
      currentPage = totalPages - 1;
      renderApp();
    };
  }

  renderBasket();
}

function renderBasket() {
  const basketDiv = document.getElementById('basket')!;
  const items = Object.entries(basket);
  if (items.length === 0) {
    basketDiv.innerHTML = '<em>Your basket is empty.</em>';
    return;
  }
  let total = 0;
  basketDiv.innerHTML = `
    <ul>
      ${items
        .map(
          ([name, { quantity, price }]) => {
            total += quantity * price;
            return `<li>${name} x ${quantity} = $${(quantity * price).toFixed(2)}</li>`;
          }
        )
        .join('')}
    </ul>
    <strong>Total: $${total.toFixed(2)}</strong>
  `;
}

function renderRegistration(app: HTMLDivElement, navHtml: string) {
  app.innerHTML = `
    ${navHtml}
    ${renderRegistrationForm()}
  `;
  
  // Setup registration form after rendering
  setupRegistrationForm();
}

function setupNavigation() {
  const shopNav = document.getElementById('shop-nav');
  const registerNav = document.getElementById('register-nav');
  
  if (shopNav) {
    shopNav.onclick = () => {
      currentView = 'shop';
      renderApp();
    };
  }
  
  if (registerNav) {
    registerNav.onclick = () => {
      currentView = 'register';
      renderApp();
    };
  }
}

renderApp();
