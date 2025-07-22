
import './style.css'

type Fruit = {
  name: string;
  price: number;
};

const fruits: Fruit[] = [
  { name: 'Apple', price: 1.29 },
  { name: 'Banana', price: 0.79 },
  { name: 'Orange', price: 1.09 },
];

type Basket = {
  [fruit: string]: { quantity: number; price: number };
};

const basket: Basket = {};

function renderShop() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = `
    <h1>Fruit Shop</h1>
    <div class="fruit-list">
      ${fruits
        .map(
          (fruit, idx) => `
            <div class="fruit-item">
              <span>${fruit.name} - $${fruit.price.toFixed(2)}</span>
              <button data-fruit="${idx}">Add to Basket</button>
            </div>
          `
        )
        .join('')}
    </div>
    <h2>Basket</h2>
    <div id="basket"></div>
  `;

  document.querySelectorAll<HTMLButtonElement>('.fruit-item button').forEach((btn) => {
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

renderShop();
