// DealHound's finder: renders the deal grid, runs the search and filters,
// sorts the list, and shows one deal's full page on a hash route. Everything
// runs from the data in deals.js; nothing is fetched at run time.

import { CHECKED_NOTE, CHECKED_ON, CATEGORIES, DEALS, STORES, discountOf, money, savedOf } from './deals.js';

const grid = document.getElementById('deal-grid');
const countLine = document.getElementById('result-count');
const searchBox = document.getElementById('search-box');
const categoryPick = document.getElementById('filter-category');
const storePick = document.getElementById('filter-store');
const discountPick = document.getElementById('filter-discount');
const sortPick = document.getElementById('sort-pick');
const listView = document.getElementById('list-view');
const detailView = document.getElementById('detail-view');
const detailBody = document.getElementById('detail-body');
const newLowTotal = document.getElementById('stat-new-lows');
const bestSaving = document.getElementById('stat-best-saving');
const dealTotal = document.getElementById('stat-deals');
const storeTotal = document.getElementById('stat-stores');
const checkedLine = document.getElementById('checked-line');
const methodLine = document.getElementById('method-line');

const VERDICT_CLASS = {
  'NEW LOW': 'verdict-new',
  'STRONG DEAL': 'verdict-strong',
  'ROUTINE SALE': 'verdict-routine',
};

const state = {
  query: '',
  category: 'All',
  store: 'All',
  minDiscount: 0,
  sort: 'discount',
};

function initialsOf(product) {
  const words = product.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean);
  const first = words[0] ? words[0][0] : 'D';
  const second = words[1] ? words[1][0] : '';
  return (first + second).toUpperCase();
}

function tileColorOf(product) {
  const palette = ['#7c3aed', '#0e7490', '#b45309', '#be123c', '#15803d', '#1d4ed8', '#a16207', '#9d174d'];
  let sum = 0;
  for (const ch of product) sum += ch.charCodeAt(0);
  return palette[sum % palette.length];
}

function dealMatches(deal) {
  if (state.query) {
    const hay = (deal.product + ' ' + deal.store + ' ' + deal.category + ' ' + deal.note).toLowerCase();
    if (!hay.includes(state.query.toLowerCase())) return false;
  }
  if (state.category !== 'All' && deal.category !== state.category) return false;
  if (state.store !== 'All' && deal.store !== state.store) return false;
  if (discountOf(deal) < state.minDiscount) return false;
  return true;
}

function sortDeals(list) {
  const copy = list.slice();
  if (state.sort === 'discount') copy.sort((a, b) => discountOf(b) - discountOf(a) || savedOf(b) - savedOf(a));
  if (state.sort === 'saving') copy.sort((a, b) => savedOf(b) - savedOf(a));
  if (state.sort === 'price') copy.sort((a, b) => a.sale - b.sale);
  if (state.sort === 'name') copy.sort((a, b) => a.product.localeCompare(b.product));
  return copy;
}

function cardHtml(deal) {
  const pct = discountOf(deal);
  return (
    '<article class="deal-card">' +
    '<div class="deal-tile" style="background:' + tileColorOf(deal.product) + '">' + initialsOf(deal.product) + '</div>' +
    '<div class="deal-main">' +
    '<span class="verdict ' + VERDICT_CLASS[deal.verdict] + '">' + deal.verdict + '</span>' +
    '<h3><a href="#/deal/' + deal.id + '">' + deal.product + '</a></h3>' +
    '<p class="deal-store">' + deal.store + ' &middot; ' + deal.category + '</p>' +
    '<p class="deal-note">' + deal.note + '</p>' +
    '<p class="deal-price"><span class="sale">' + money(deal.sale) + '</span> ' +
    '<span class="usual">' + money(deal.usual) + '</span> ' +
    '<span class="pct">-' + pct + '%</span></p>' +
    '<p class="deal-save">You save ' + money(savedOf(deal)) + '</p>' +
    '<p class="deal-checked">Checked ' + deal.checked + ' &middot; Source: <a href="' + deal.sourceUrl + '" target="_blank" rel="noopener">' + deal.source + '</a></p>' +
    '<p class="deal-actions"><a class="store-link" href="' + deal.storeUrl + '" target="_blank" rel="noopener">View at ' + deal.store + ' &rarr;</a> ' +
    '<a class="detail-link" href="#/deal/' + deal.id + '">Details</a></p>' +
    '</div></article>'
  );
}

function renderList() {
  const shown = sortDeals(DEALS.filter(dealMatches));
  if (shown.length === 0) {
    grid.innerHTML = '<p class="empty-state">No deals match that search. Try a different word, or clear a filter — every deal is still listed with all filters off.</p>';
  } else {
    grid.innerHTML = shown.map(cardHtml).join('');
  }
  const total = DEALS.length;
  countLine.textContent = shown.length === total
    ? 'Showing all ' + total + ' deals'
    : 'Showing ' + shown.length + ' of ' + total + ' deals';
}

function fillPick(select, values) {
  for (const value of values) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
}

function renderStats() {
  const newLows = DEALS.filter((deal) => deal.verdict === 'NEW LOW').length;
  const biggest = DEALS.reduce((best, deal) => Math.max(best, discountOf(deal)), 0);
  newLowTotal.textContent = newLows;
  bestSaving.textContent = biggest + '%';
  dealTotal.textContent = DEALS.length;
  storeTotal.textContent = STORES.length;
  checkedLine.textContent = 'Prices checked ' + CHECKED_ON + ' (WIB).';
  methodLine.textContent = CHECKED_NOTE;
}

function detailHtml(deal) {
  const pct = discountOf(deal);
  const siblings = DEALS.filter((other) => other.category === deal.category && other.id !== deal.id).slice(0, 3);
  const siblingLinks = siblings.map((other) =>
    '<li><a href="#/deal/' + other.id + '">' + other.product + '</a> — ' + money(other.sale) + ' at ' + other.store + '</li>',
  ).join('');
  return (
    '<p class="back-link"><a href="#/">&larr; Back to all deals</a></p>' +
    '<span class="verdict ' + VERDICT_CLASS[deal.verdict] + '">' + deal.verdict + '</span>' +
    '<h2>' + deal.product + '</h2>' +
    '<p class="deal-store">' + deal.store + ' &middot; ' + deal.category + '</p>' +
    '<div class="detail-price">' +
    '<p><span class="sale">' + money(deal.sale) + '</span> <span class="usual">' + money(deal.usual) + '</span> <span class="pct">-' + pct + '%</span></p>' +
    '<p class="deal-save">You save ' + money(savedOf(deal)) + ' off the usual price.</p>' +
    '</div>' +
    '<p class="deal-note">' + deal.note + '</p>' +
    '<h3>Is it really a deal?</h3>' +
    '<p>' + deal.verdictNote + '</p>' +
    '<h3>How this price was checked</h3>' +
    '<p>Checked ' + deal.checked + ' from <a href="' + deal.sourceUrl + '" target="_blank" rel="noopener">' + deal.source + '</a>, a deals report naming ' + deal.store + '. ' +
    'The store link below opens ' + deal.store + '’s search for this exact product, so you can see the live price before you buy.</p>' +
    '<p class="deal-actions"><a class="store-link" href="' + deal.storeUrl + '" target="_blank" rel="noopener">View at ' + deal.store + ' &rarr;</a></p>' +
    (siblings.length ? '<h3>More ' + deal.category + ' deals</h3><ul class="sibling-list">' + siblingLinks + '</ul>' : '')
  );
}

function showDetail(id) {
  const deal = DEALS.find((item) => item.id === id);
  if (!deal) {
    listView.hidden = false;
    detailView.hidden = true;
    return;
  }
  detailBody.innerHTML = detailHtml(deal);
  listView.hidden = true;
  detailView.hidden = false;
  window.scrollTo(0, 0);
}

function showList() {
  detailView.hidden = true;
  listView.hidden = false;
}

function route() {
  const hash = window.location.hash || '#/';
  const match = hash.match(/^#\/deal\/([a-z0-9-]+)$/);
  if (match) showDetail(match[1]);
  else showList();
}

searchBox.addEventListener('input', () => {
  state.query = searchBox.value.trim();
  renderList();
});
categoryPick.addEventListener('change', () => {
  state.category = categoryPick.value;
  renderList();
});
storePick.addEventListener('change', () => {
  state.store = storePick.value;
  renderList();
});
discountPick.addEventListener('change', () => {
  state.minDiscount = Number(discountPick.value);
  renderList();
});
sortPick.addEventListener('change', () => {
  state.sort = sortPick.value;
  renderList();
});
window.addEventListener('hashchange', route);

fillPick(categoryPick, CATEGORIES);
fillPick(storePick, STORES);
renderStats();
renderList();
route();
