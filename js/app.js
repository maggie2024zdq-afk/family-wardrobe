'use strict';

/* ===================== 常量 ===================== */
const CATEGORIES = ['上装', '下装', '鞋子', '包包', '配饰'];
const SUB_CATEGORIES = {
  '上装': ['T恤', '卫衣', '衬衫', '毛衣', '夹克', '大衣', '羽绒服'],
  '下装': ['牛仔裤', '休闲裤', '运动裤', '短裤', '半身裙', '连衣裙'],
  '鞋子': ['运动鞋', '休闲鞋', '皮鞋', '靴子', '凉鞋', '拖鞋'],
  '包包': ['单肩包', '双肩包', '手提包', '斜挎包', '钱包', '手拿包'],
  '配饰': ['帽子', '围巾', '眼镜', '项链', '耳环', '手表', '腰带'],
};
const CAT_COLOR = {
  '上装': '#E8B4B8', '下装': '#A8C5DA', '鞋子': '#B5D8C7', '包包': '#D4A373', '配饰': '#F2C078',
};
const SEASONS = [
  { key: 'spring', label: '春', color: '#8BC48A' },
  { key: 'summer', label: '夏', color: '#F4A261' },
  { key: 'autumn', label: '秋', color: '#D4A373' },
  { key: 'winter', label: '冬', color: '#7EB5D6' },
];
const SEASON_LABEL = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
const SEASON_COLOR = { spring: '#8BC48A', summer: '#F4A261', autumn: '#D4A373', winter: '#7EB5D6' };
// 尺码按一级分类智能切换（鞋子显示鞋码、上装/下装显示服装码、包包/配饰显示通用规格）
const SIZE_OPTIONS = {
  '鞋子': ['不填', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
  '上装': ['不填', '均码', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  '下装': ['不填', '均码', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  '包包': ['不填', '均码', '小号', '中号', '大号'],
  '配饰': ['不填', '均码', '可调节'],
};
const SIZE_FALLBACK = ['不填', '均码', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const sizeOptionsFor = (cat) => SIZE_OPTIONS[cat] || SIZE_FALLBACK;
function sizeOptionsHtml(cat, selected) {
  const opts = sizeOptionsFor(cat);
  const sel = selected && opts.includes(selected) ? selected : '不填';
  return opts.map((s) => `<option value="${s}" ${sel === s ? 'selected' : ''}>${s}</option>`).join('');
}
// 存储位置预设（datalist 候选，也可自由填写）
const LOCATION_LIST = ['衣帽间', '主卧衣柜', '次卧衣柜', '儿童房衣柜', '玄关鞋柜', '客厅收纳柜', '阳台收纳区', '收纳箱', '旅行箱'];
const locOptionsHtml = LOCATION_LIST.map((l) => `<option value="${l}"></option>`).join('');
const CAT_ICON = { '全部': '📋', '上装': '👕', '下装': '👖', '鞋子': '👟', '包包': '👜', '配饰': '🕶️' };
const SUB_ICON = {
  'T恤': '👕', '卫衣': '🧥', '衬衫': '👔', '毛衣': '🧶', '夹克': '🧥', '大衣': '🧥', '羽绒服': '🧥',
  '牛仔裤': '👖', '休闲裤': '👖', '运动裤': '🩳', '短裤': '🩳', '半身裙': '👗', '连衣裙': '👗',
  '运动鞋': '👟', '休闲鞋': '👞', '皮鞋': '👞', '靴子': '🥾', '凉鞋': '👡', '拖鞋': '🩴',
  '单肩包': '👜', '双肩包': '🎒', '手提包': '👛', '斜挎包': '👜', '钱包': '👛', '手拿包': '👛',
  '帽子': '🎩', '围巾': '🧣', '眼镜': '👓', '项链': '💎', '耳环': '💎', '手表': '⌚', '腰带': '💫',
};
const ACCOUNT_COLORS = ['#4A90D9', '#E8B4B8', '#7EB5D6', '#B5D8C7', '#D4A373', '#F4A261'];

/* ===================== 状态 ===================== */
const state = {
  currentAccountId: localStorage.getItem('fw_currentAccount') || null,
  accounts: [],
  items: [],
  outfits: [],
  categories: [],
  seasonFilter: 'all',
  categoryFilter: 'all',
  subCategoryFilter: 'all',
  sort: 'newest',
  search: '',
  screen: 'closet',
  _img: null,
};

/* ===================== 工具 ===================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const currentAccount = () => state.accounts.find((a) => a.id === state.currentAccountId);

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 1800);
}

function compressImage(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ===================== 数据加载 ===================== */
async function loadData() {
  state.items = (await WardrobeDB.getItemsByAccount(state.currentAccountId)) || [];
  state.outfits = (await WardrobeDB.getOutfitsByAccount(state.currentAccountId)) || [];
  state.items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const acc = currentAccount();
  const base = acc && acc.categories && acc.categories.length ? acc.categories : [...CATEGORIES];
  // 把旧数据里实际存在的分类也纳入侧边栏，避免丢失
  const extras = state.items.map((it) => it.category).filter(Boolean);
  state.categories = [...new Set([...base, ...extras])];
}

/* ===================== 渲染：衣橱 / 单品 ===================== */
function getFilteredItems() {
  let list = state.items.filter((it) => {
    if (state.seasonFilter !== 'all' && !(it.seasons || []).includes(state.seasonFilter)) return false;
    if (state.categoryFilter !== 'all' && it.category !== state.categoryFilter) return false;
    if (state.subCategoryFilter !== 'all' && it.subCategory !== state.subCategoryFilter) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const hay = [it.name, it.category, it.subCategory, it.color, it.brand, it.note].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (state.sort === 'worn') list = [...list].sort((a, b) => (b.wornCount || 0) - (a.wornCount || 0));
  if (state.sort === 'name') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh'));
  if (state.sort === 'newest') list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

function renderSeasonBar() {
  const opts = [{ key: 'all', label: '全部' }].concat(SEASONS);
  $('#seasonBar').innerHTML = opts.map((o) =>
    `<button class="season-pill ${state.seasonFilter === o.key ? 'active' : ''}" data-season="${o.key}">${o.label}</button>`
  ).join('');
}

function renderSidebar() {
  const cats = ['全部', ...state.categories];
  const counts = {};
  state.items.forEach((it) => {
    if (state.seasonFilter !== 'all' && !(it.seasons || []).includes(state.seasonFilter)) return;
    counts[it.category] = (counts[it.category] || 0) + 1;
  });
  $('#catSidebar').innerHTML = cats.map((c) => {
    const count = c === '全部' ? state.items.filter((it) => state.seasonFilter === 'all' || (it.seasons || []).includes(state.seasonFilter)).length : (counts[c] || 0);
    const active = state.categoryFilter === c || (c === '全部' && state.categoryFilter === 'all');
    return `<button class="sidebar-item ${active ? 'active' : ''}" data-cat="${c}"><span class="cat-ico">${CAT_ICON[c] || '👕'}</span><span>${c}</span><span class="count">${count}</span></button>`;
  }).join('');
}

function renderSubTags() {
  const wrap = $('#subTags');
  if (state.categoryFilter === 'all') {
    wrap.innerHTML = '';
    return;
  }
  const subs = SUB_CATEGORIES[state.categoryFilter] || [];
  if (subs.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  const counts = {};
  state.items.forEach((it) => {
    if (it.category !== state.categoryFilter) return;
    if (state.seasonFilter !== 'all' && !(it.seasons || []).includes(state.seasonFilter)) return;
    counts[it.subCategory] = (counts[it.subCategory] || 0) + 1;
  });
  wrap.innerHTML = [{ label: '全部', key: 'all' }].concat(subs.map((s) => ({ label: s, key: s }))).map((o) =>
    `<button class="sub-tag ${state.subCategoryFilter === o.key ? 'active' : ''}" data-sub="${o.key}">${o.key !== 'all' ? `<span class="sub-ico">${SUB_ICON[o.label] || ''}</span>` : ''}${esc(o.label)}${o.key !== 'all' ? `<span class="t-count">${counts[o.label] || 0}</span>` : ''}</button>`
  ).join('');
}

function renderItemGrid() {
  const items = getFilteredItems();
  const grid = $('#itemGrid');
  const empty = $('#closetEmpty');
  if (items.length === 0) {
    grid.innerHTML = '';
    empty.hidden = false;
  } else {
    empty.hidden = true;
    grid.innerHTML = items.map((it) => `
      <div class="item-card" data-id="${it.id}">
        <div class="item-thumb">${it.image ? `<img src="${it.image}" alt="${esc(it.name)}">` : `<span class="no-img">👕</span>`}</div>
        <div class="item-meta">
          <div class="item-name">${esc(it.name || '未命名')}</div>
          <div class="item-sub">${esc([it.category, it.subCategory].filter(Boolean).join(' · '))}${it.color ? (' · ' + esc(it.color)) : ''}${it.size && it.size !== '不填' ? (' · ' + esc(it.size)) : ''}${it.location ? (' · 📍' + esc(it.location)) : ''}</div>
          <div class="item-seasons">${(it.seasons || []).map((s) => `<span class="sbadge" style="background:${SEASON_COLOR[s]}">${SEASON_LABEL[s]}</span>`).join('')}</div>
        </div>
      </div>`).join('');
  }
}

function renderCloset() {
  renderSeasonBar();
  renderSidebar();
  renderSubTags();
  renderItemGrid();
}

/* ===================== 渲染：首页 ===================== */
function renderHome() {
  // 首页静态内容已在 HTML，无需额外渲染
}

/* ===================== 渲染：搭配 / 穿搭 ===================== */
function renderOutfits() {
  const list = $('#outfitList');
  const empty = $('#outfitEmpty');
  if (state.outfits.length === 0) { list.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  list.innerHTML = state.outfits.map((o) => {
    const thumbs = (o.itemIds || []).slice(0, 4).map((id) => {
      const it = state.items.find((x) => x.id === id);
      return it ? (it.image ? `<img src="${it.image}" alt="">` : `<span>👕</span>`) : '';
    }).join('');
    return `<div class="outfit-card" data-id="${o.id}">
      <div class="outfit-thumbs">${thumbs || '<span class="no-img">🧥</span>'}</div>
      <div class="outfit-meta">
        <div class="outfit-name">${esc(o.name || '未命名搭配')}</div>
        <div class="outfit-sub">${o.season ? SEASON_LABEL[o.season] + ' · ' : ''}${esc(o.occasion || '')}</div>
      </div>
    </div>`;
  }).join('');
}

/* ===================== 渲染：日历 / 统计 ===================== */
function renderStats() {
  const items = state.items;
  const total = items.length;
  const bySeason = { spring: 0, summer: 0, autumn: 0, winter: 0 };
  items.forEach((it) => (it.seasons || []).forEach((s) => bySeason[s]++));
  const byCat = {};
  items.forEach((it) => { if (it.category) byCat[it.category] = (byCat[it.category] || 0) + 1; });
  const totalValue = items.reduce((s, it) => s + (it.price || 0), 0);

  const seasonBars = SEASONS.map((s) => `
    <div class="bar-row"><span class="bar-label">${s.label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${total ? Math.round(bySeason[s.key] / total * 100) : 0}%;background:${s.color}"></div></div>
      <span class="bar-val">${bySeason[s.key]}</span></div>`).join('');

  const catBars = state.categories.filter((c) => byCat[c] > 0).map((c) => `
    <div class="bar-row"><span class="bar-label">${c}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${total ? Math.round(byCat[c] / total * 100) : 0}%;background:${CAT_COLOR[c] || '#4A90D9'}"></div></div>
      <span class="bar-val">${byCat[c]}</span></div>`).join('') || '<p class="muted">暂无数据</p>';

  const top = [...items].sort((a, b) => (b.wornCount || 0) - (a.wornCount || 0)).slice(0, 5);
  const topHtml = top.length
    ? top.map((it) => `<div class="top-row"><span>${esc(it.name || '')}</span><span class="worn">${(it.wornCount || 0)} 次</span></div>`).join('')
    : '<p class="muted">暂无穿着记录</p>';

  $('#statsContent').innerHTML = `
    <div class="stat-cards">
      <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-lab">衣物总数</div></div>
      <div class="stat-card"><div class="stat-num">${totalValue.toLocaleString()}</div><div class="stat-lab">总价值(¥)</div></div>
      <div class="stat-card"><div class="stat-num">${state.outfits.length}</div><div class="stat-lab">搭配数</div></div>
    </div>
    <div class="stat-block"><h3>按季节分布</h3>${seasonBars}</div>
    <div class="stat-block"><h3>按分类分布</h3>${catBars}</div>
    <div class="stat-block"><h3>最常穿着</h3>${topHtml}</div>`;
}

/* ===================== 渲染：我的 ===================== */
function renderMe() {
  const a = currentAccount();
  const offline = !navigator.onLine;
  $('#meContent').innerHTML = `
    <div class="me-card">
      <span class="avatar lg" style="background:${a ? a.color : '#4A90D9'}">${esc((a ? a.name : '家')[0])}</span>
      <div style="flex:1">
        <div class="me-name">${esc(a ? a.name : '')}</div>
        <div class="me-sub">当前账号 · ${state.items.length} 件衣物</div>
      </div>
      <button class="btn-ghost" id="switchAccountBtn">切换</button>
    </div>
    <div class="me-section">
      <h3>家庭成员</h3>
      <div class="account-list">
        ${state.accounts.map((x) => `
          <div class="account-row ${x.id === state.currentAccountId ? 'cur' : ''}">
            <span class="avatar" style="background:${x.color}">${esc((x.name || '家')[0])}</span>
            <div class="account-info"><div class="account-rname">${esc(x.name)}</div>
              <div class="account-rsub">${x.id === state.currentAccountId ? '当前账号' : '点击切换'}</div></div>
            <button class="btn-sm" data-switch="${x.id}" ${x.id === state.currentAccountId ? 'disabled' : ''}>${x.id === state.currentAccountId ? '使用中' : '切换'}</button>
          </div>`).join('')}
      </div>
      <button class="btn-ghost full" id="openAccountBtn">管理 / 添加成员</button>
    </div>
    <div class="me-section">
      <h3>数据备份</h3>
      <button class="btn-ghost full" id="exportBtn">导出备份 (JSON)</button>
      <button class="btn-ghost full" id="importBtn">导入备份</button>
      <input type="file" id="importFile" accept="application/json" hidden>
    </div>
    <div class="me-section">
      <div class="status-row"><span>网络状态</span><span class="dot ${offline ? 'off' : 'on'}">${offline ? '离线可用' : '在线'}</span></div>
      <p class="muted small">所有数据保存在本机浏览器，离线也能用。换设备或换浏览器时，用“导出备份”再“导入备份”迁移数据。</p>
    </div>`;

  $('#switchAccountBtn').addEventListener('click', openAccountModal);
  $('#openAccountBtn').addEventListener('click', openAccountModal);
  $$('#meContent [data-switch]').forEach((b) => b.addEventListener('click', () => switchAccount(b.dataset.switch)));
  $('#exportBtn').addEventListener('click', exportData);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', importData);
}

/* ===================== 弹窗系统 ===================== */
function openModal({ title, body, foot }) {
  const root = $('#modalRoot');
  root.innerHTML = `
    <div class="modal">
      <div class="modal-head"><h3>${title}</h3><button class="modal-close" data-close>✕</button></div>
      <div class="modal-body">${body}</div>
      <div class="modal-foot">${foot || ''}</div>
    </div>`;
  root.hidden = false;
  requestAnimationFrame(() => root.classList.add('show'));
}
function closeModal() {
  const root = $('#modalRoot');
  root.classList.remove('show');
  setTimeout(() => { root.hidden = true; root.innerHTML = ''; }, 180);
}

function subCategoryOptions(category, selected) {
  const subs = SUB_CATEGORIES[category] || [];
  if (subs.length === 0) return '<option value="">-</option>';
  return subs.map((s) => `<option value="${s}" ${selected === s ? 'selected' : ''}>${s}</option>`).join('');
}

/* ===================== 衣物：添加/编辑 ===================== */
function openItemEditor(item, defaultCategory) {
  const it = item || {};
  state._img = it.image || null;
  const cat = it.category || defaultCategory || state.categoryFilter || state.categories[0] || '上装';
  const body = `
    <label class="photo-drop" id="photoDrop">
      <input type="file" id="photoInput" accept="image/*" capture="environment" hidden>
      ${it.image
        ? `<img id="photoPreview" src="${it.image}" alt="预览">`
        : `<img id="photoPreview" alt="预览" hidden><span id="photoHint">📷 点击拍照 / 选图</span>`}
    </label>
    <label class="field"><span>名称 *</span><input type="text" id="fName" placeholder="如：白色棉衬衫" value="${esc(it.name || '')}"></label>
    <label class="field"><span>一级分类</span><select id="fCategory">${state.categories.map((c) => `<option value="${c}" ${cat === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
    <label class="field"><span>二级分类</span><select id="fSubCategory">${subCategoryOptions(cat, it.subCategory)}</select></label>
    <label class="field"><span>颜色</span><input type="text" id="fColor" placeholder="如：白色" value="${esc(it.color || '')}"></label>
    <label class="field"><span>尺码</span><select id="fSize">${sizeOptionsHtml(cat, it.size)}</select></label>
    <label class="field"><span>存储位置</span><input type="text" id="fLocation" list="locList" placeholder="如：主卧衣柜上层" value="${esc(it.location || '')}"></label>
    <datalist id="locList">${locOptionsHtml}</datalist>
    <div class="field"><span>季节（可多选）</span><div class="season-pick" id="seasonPick">
      ${SEASONS.map((s) => `<label class="spick"><input type="checkbox" value="${s.key}" ${(it.seasons || []).includes(s.key) ? 'checked' : ''}><span style="background:${s.color}">${s.label}</span></label>`).join('')}
    </div></div>
    <label class="field"><span>品牌</span><input type="text" id="fBrand" value="${esc(it.brand || '')}"></label>
    <label class="field"><span>价格 (¥)</span><input type="number" id="fPrice" value="${it.price != null ? it.price : ''}"></label>
    <label class="field"><span>备注</span><textarea id="fNote" rows="2">${esc(it.note || '')}</textarea></label>
    ${item ? `<label class="field"><span>穿着次数</span><input type="number" id="fWorn" value="${it.wornCount || 0}" min="0"></label>` : ''}
  `;
  const foot = `
    ${item ? `<button class="btn-text danger" id="deleteItemBtn">删除</button>` : ''}
    <button class="btn-primary" id="saveItemBtn">保存</button>`;
  openModal({ title: item ? '编辑衣物' : '添加衣物', body, foot });

  $('#photoInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      state._img = await compressImage(file);
      const prev = $('#photoPreview');
      prev.src = state._img; prev.hidden = false;
      const hint = $('#photoHint'); if (hint) hint.remove();
    } catch (err) { toast('图片读取失败'); }
  });
  $('#fCategory').addEventListener('change', (e) => {
    $('#fSubCategory').innerHTML = subCategoryOptions(e.target.value, '');
    const cur = $('#fSize').value;
    $('#fSize').innerHTML = sizeOptionsHtml(e.target.value, sizeOptionsFor(e.target.value).includes(cur) ? cur : '不填');
  });
  if (item) $('#deleteItemBtn').addEventListener('click', () => confirmDeleteItem(item.id));
  $('#saveItemBtn').addEventListener('click', () => saveItem(item));
}

async function saveItem(original) {
  const name = $('#fName').value.trim();
  if (!name) { toast('请填写名称'); return; }
  const seasons = $$('#seasonPick input:checked').map((i) => i.value);
  const item = {
    id: original ? original.id : uid(),
    accountId: state.currentAccountId,
    name,
    category: $('#fCategory').value,
    subCategory: $('#fSubCategory').value,
    color: $('#fColor').value.trim(),
    size: $('#fSize').value,
    location: $('#fLocation').value.trim(),
    seasons,
    brand: $('#fBrand').value.trim(),
    price: $('#fPrice').value ? Number($('#fPrice').value) : null,
    note: $('#fNote').value.trim(),
    image: state._img,
    wornCount: original ? (Number($('#fWorn').value) || 0) : 0,
    createdAt: original ? original.createdAt : Date.now(),
    updatedAt: Date.now(),
  };
  if (original) await WardrobeDB.putItem(item); else await WardrobeDB.addItem(item);
  await loadData();
  closeModal();
  renderCloset(); renderStats();
  toast('已保存');
}

function confirmDeleteItem(id) {
  openModal({
    title: '删除衣物',
    body: '<p>确定删除这件衣物吗？此操作不可撤销。</p>',
    foot: `<button class="btn-text" data-close>取消</button><button class="btn-primary danger" id="doDelete">删除</button>`,
  });
  $('#doDelete').addEventListener('click', async () => {
    await WardrobeDB.deleteItem(id);
    await loadData();
    closeModal();
    renderCloset(); renderStats();
    toast('已删除');
  });
}

/* ===================== 账号：切换 / 管理 ===================== */
async function createAccount(name) {
  const acc = {
    id: uid(), name,
    color: ACCOUNT_COLORS[state.accounts.length % ACCOUNT_COLORS.length],
    categories: [...CATEGORIES],
    createdAt: Date.now(),
  };
  await WardrobeDB.addAccount(acc);
  return acc;
}

function openAccountModal() {
  const body = `
    <div class="account-list">
      ${state.accounts.map((a) => `
        <div class="account-row ${a.id === state.currentAccountId ? 'cur' : ''}">
          <span class="avatar" style="background:${a.color}">${esc((a.name || '家')[0])}</span>
          <div class="account-info"><div class="account-rname">${esc(a.name)}</div>
            <div class="account-rsub">${a.id === state.currentAccountId ? '当前账号' : '点击切换'}</div></div>
          <button class="btn-sm" data-switch="${a.id}" ${a.id === state.currentAccountId ? 'disabled' : ''}>${a.id === state.currentAccountId ? '使用中' : '切换'}</button>
        </div>`).join('')}
    </div>
    <div class="add-account">
      <input type="text" id="newAccountName" placeholder="新成员名称，如：妈妈 / 小明">
      <button class="btn-primary" id="addAccountBtn">添加</button>
    </div>`;
  openModal({ title: '切换 / 管理账号', body });
  $$('#modalRoot [data-switch]').forEach((b) => b.addEventListener('click', () => switchAccount(b.dataset.switch)));
  $('#addAccountBtn').addEventListener('click', async () => {
    const name = $('#newAccountName').value.trim();
    if (!name) { toast('请输入名称'); return; }
    await createAccount(name);
    state.accounts = await WardrobeDB.getAllAccounts();
    openAccountModal();
  });
}

async function switchAccount(id) {
  state.currentAccountId = id;
  localStorage.setItem('fw_currentAccount', id);
  await loadData();
  closeModal();
  renderAll();
  toast('已切换到 ' + (currentAccount() ? currentAccount().name : ''));
}

/* ===================== 分类：添加 / 删除 ===================== */
function openAddCategoryModal() {
  const body = `
    <label class="field"><span>新分类名称</span><input type="text" id="newCatName" placeholder="如：运动服 / 正装"></label>
    <p class="muted small">分类只对当前账号生效</p>`;
  openModal({
    title: '添加分类',
    body,
    foot: `<button class="btn-text" data-close>取消</button><button class="btn-primary" id="saveCat">保存</button>`,
  });
  $('#saveCat').addEventListener('click', async () => {
    const name = $('#newCatName').value.trim();
    if (!name) { toast('请输入分类名称'); return; }
    if (state.categories.includes(name)) { toast('分类已存在'); return; }
    const acc = currentAccount();
    if (!acc) return;
    acc.categories = [...state.categories.filter((c) => CATEGORIES.includes(c) || state.items.some((it) => it.category === c)), name];
    await WardrobeDB.putAccount(acc);
    state.accounts = await WardrobeDB.getAllAccounts();
    await loadData();
    closeModal();
    renderCloset();
    toast('已添加分类');
  });
}

function openCategoryMenu(cat) {
  openModal({
    title: '分类：' + cat,
    body: `<p class="muted">可在此处管理分类</p>`,
    foot: `<button class="btn-text" data-close>取消</button><button class="btn-primary danger" id="deleteCat">删除分类</button>`,
  });
  $('#deleteCat').addEventListener('click', async () => {
    if (state.categories.length <= 1) { toast('至少保留一个分类'); return; }
    const acc = currentAccount();
    if (!acc) return;
    acc.categories = acc.categories.filter((c) => c !== cat);
    await WardrobeDB.putAccount(acc);
    state.accounts = await WardrobeDB.getAllAccounts();
    if (state.categoryFilter === cat) state.categoryFilter = 'all';
    await loadData();
    closeModal();
    renderCloset();
    toast('已删除分类');
  });
}

/* ===================== 批量导入 ===================== */
async function openBatchImportModal() {
  state._batch = [];
  const body = `
    <label class="photo-drop" id="batchDrop">
      <input type="file" id="batchInput" accept="image/*" multiple hidden>
      <span id="batchHint">📷 点击一次性选择多张图片</span>
    </label>
    <div class="batch-default">
      <label class="field"><span>默认分类</span><select id="batchCat">${state.categories.map((c) => `<option value="${c}">${c}</option>`).join('')}</select></label>
      <label class="field"><span>默认二级分类</span><select id="batchSubCat"><option value="">不设置</option></select></label>
      <label class="field"><span>默认尺码</span><select id="batchSize">${sizeOptionsHtml(state.categories[0] || '上装', '不填')}</select></label>
      <label class="field"><span>默认存储位置</span><input type="text" id="batchLoc" list="batchLocList" placeholder="如：主卧衣柜"></label>
      <datalist id="batchLocList">${locOptionsHtml}</datalist>
      <button class="btn-sm" id="batchApplyAll">应用到全部</button>
    </div>
    <p class="batch-summary" id="batchSummary">尚未选择图片</p>
    <div class="batch-grid" id="batchGrid"></div>
    <div class="field"><span>统一季节（可多选）</span><div class="season-pick" id="batchSeasonPick">
      ${SEASONS.map((s) => `<label class="spick"><input type="checkbox" value="${s.key}"><span style="background:${s.color}">${s.label}</span></label>`).join('')}
    </div></div>`;
  openModal({ title: '批量导入', body, foot: `<button class="btn-text" data-close>取消</button><button class="btn-primary" id="batchSave">全部保存</button>` });

  const grid = $('#batchGrid');
  function updateBatchSubCat() {
    const cat = $('#batchCat').value;
    $('#batchSubCat').innerHTML = '<option value="">不设置</option>' + subCategoryOptions(cat, '');
  }
  updateBatchSubCat();
  $('#batchCat').addEventListener('change', () => {
    updateBatchSubCat();
    const defSize = $('#batchSize');
    if (defSize) {
      const cur = defSize.value;
      defSize.innerHTML = sizeOptionsHtml($('#batchCat').value, sizeOptionsFor($('#batchCat').value).includes(cur) ? cur : '不填');
    }
    $$('#batchGrid select[data-field="cat"]').forEach((sel) => {
      sel.innerHTML = state.categories.map((c) => `<option value="${c}" ${sel.value === c ? 'selected' : ''}>${c}</option>`).join('');
    });
    $$('#batchGrid select[data-field="sub"]').forEach((sel) => {
      const rowCat = sel.closest('.batch-card').querySelector('select[data-field="cat"]').value;
      sel.innerHTML = '<option value="">-</option>' + subCategoryOptions(rowCat, sel.value);
    });
  });
  function renderGrid() {
    const summary = $('#batchSummary');
    if (state._batch.length === 0) { grid.innerHTML = ''; summary.textContent = '尚未选择图片'; return; }
    summary.textContent = '共 ' + state._batch.length + ' 张';
    grid.innerHTML = state._batch.map((b, i) => `
      <div class="batch-card" data-i="${i}">
        <div class="batch-thumb"><img src="${b.dataUrl}" alt=""></div>
        <select data-i="${i}" data-field="cat">${state.categories.map((c) => `<option value="${c}" ${b.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
        <select data-i="${i}" data-field="sub"><option value="">二级分类</option>${subCategoryOptions(b.category, b.subCategory)}</select>
        <select data-i="${i}" data-field="size">${sizeOptionsHtml(b.category, b.size)}</select>
        <input type="text" data-i="${i}" data-field="location" list="batchLocList" placeholder="位置" value="${esc(b.location || '')}">
      </div>`).join('');
    $$('#batchGrid select[data-field="cat"]').forEach((sel) => sel.addEventListener('change', (e) => {
      const idx = Number(e.target.dataset.i);
      state._batch[idx].category = e.target.value;
      const subSel = e.target.parentElement.querySelector('select[data-field="sub"]');
      subSel.innerHTML = '<option value="">二级分类</option>' + subCategoryOptions(e.target.value, '');
      state._batch[idx].subCategory = '';
      const sizeSel = e.target.parentElement.querySelector('select[data-field="size"]');
      if (sizeSel) { sizeSel.innerHTML = sizeOptionsHtml(e.target.value, '不填'); state._batch[idx].size = '不填'; }
    }));
    $$('#batchGrid select[data-field="sub"]').forEach((sel) => sel.addEventListener('change', (e) => {
      state._batch[Number(e.target.dataset.i)].subCategory = e.target.value;
    }));
    $$('#batchGrid select[data-field="size"]').forEach((sel) => sel.addEventListener('change', (e) => {
      state._batch[Number(e.target.dataset.i)].size = e.target.value;
    }));
    $$('#batchGrid input[data-field="location"]').forEach((sel) => sel.addEventListener('input', (e) => {
      state._batch[Number(e.target.dataset.i)].location = e.target.value.trim();
    }));
  }
  $('#batchInput').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const def = $('#batchCat').value;
    const defSub = $('#batchSubCat').value;
    const defSize = $('#batchSize').value;
    const defLoc = $('#batchLoc').value.trim();
    for (const f of files) {
      try { const d = await compressImage(f); state._batch.push({ file: f, dataUrl: d, category: def, subCategory: defSub, size: defSize, location: defLoc }); } catch (_) {}
    }
    renderGrid();
  });
  $('#batchApplyAll').addEventListener('click', () => {
    const def = $('#batchCat').value;
    const defSub = $('#batchSubCat').value;
    const defSize = $('#batchSize').value;
    const defLoc = $('#batchLoc').value.trim();
    state._batch.forEach((b) => { b.category = def; b.subCategory = defSub; b.size = defSize; b.location = defLoc; });
    renderGrid();
    toast('已应用默认分类');
  });
  $('#batchSave').addEventListener('click', async () => {
    if (state._batch.length === 0) { toast('请先选择图片'); return; }
    const seasons = $$('#batchSeasonPick input:checked').map((i) => i.value);
    const counters = {};
    for (const b of state._batch) {
      counters[b.category] = (counters[b.category] || 0) + 1;
      const item = {
        id: uid(), accountId: state.currentAccountId,
        name: b.category + counters[b.category],
        category: b.category,
        subCategory: b.subCategory || '',
        size: b.size || '不填',
        location: b.location || '',
        color: '', seasons,
        brand: '', price: null, note: '', image: b.dataUrl, wornCount: 0,
        createdAt: Date.now(), updatedAt: Date.now(),
      };
      await WardrobeDB.addItem(item);
    }
    await loadData();
    closeModal();
    renderCloset(); renderStats();
    toast('已导入 ' + state._batch.length + ' 件');
  });
}

/* ===================== 搭配：新建/编辑 ===================== */
function openOutfitEditor(outfit) {
  const o = outfit || {};
  const sel = new Set(o.itemIds || []);
  const body = `
    <label class="field"><span>搭配名称 *</span><input type="text" id="oName" placeholder="如：周一通勤" value="${esc(o.name || '')}"></label>
    <div class="field"><span>适合季节</span><select id="oSeason"><option value="">不限</option>${SEASONS.map((s) => `<option value="${s.key}" ${o.season === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div>
    <label class="field"><span>场合</span><input type="text" id="oOccasion" placeholder="如：上班 / 约会" value="${esc(o.occasion || '')}"></label>
    <div class="field"><span>选择衣物（点选）</span>
      <div class="pick-grid" id="outfitPick">
        ${state.items.map((it) => `
          <div class="pick-item ${sel.has(it.id) ? 'on' : ''}" data-id="${it.id}">
            ${it.image ? `<img src="${it.image}" alt="">` : `<span>👕</span>`}
            <span class="pick-name">${esc(it.name || '')}</span>
          </div>`).join('') || '<p class="muted">还没有衣物，先去添加吧</p>'}
      </div>
    </div>`;
  const foot = `${outfit ? `<button class="btn-text danger" id="delOutfit">删除</button>` : ''}<button class="btn-primary" id="saveOutfit">保存</button>`;
  openModal({ title: outfit ? '编辑搭配' : '新建搭配', body, foot });

  $$('#outfitPick .pick-item').forEach((el) => el.addEventListener('click', () => el.classList.toggle('on')));
  if (outfit) $('#delOutfit').addEventListener('click', () => confirmDeleteOutfit(outfit.id));
  $('#saveOutfit').addEventListener('click', () => saveOutfit(outfit));
}

async function saveOutfit(original) {
  const name = $('#oName').value.trim();
  const ids = $$('#outfitPick .pick-item.on').map((el) => el.dataset.id);
  if (!name) { toast('请填写名称'); return; }
  if (ids.length < 1) { toast('至少选一件衣物'); return; }
  const o = {
    id: original ? original.id : uid(),
    accountId: state.currentAccountId,
    name,
    season: $('#oSeason').value,
    occasion: $('#oOccasion').value.trim(),
    itemIds: ids,
    createdAt: original ? original.createdAt : Date.now(),
    updatedAt: Date.now(),
  };
  if (original) await WardrobeDB.putOutfit(o); else await WardrobeDB.addOutfit(o);
  await loadData();
  closeModal();
  renderOutfits();
  toast('已保存');
}

function confirmDeleteOutfit(id) {
  openModal({
    title: '删除搭配',
    body: '<p>确定删除这个搭配吗？</p>',
    foot: `<button class="btn-text" data-close>取消</button><button class="btn-primary danger" id="doDeleteO">删除</button>`,
  });
  $('#doDeleteO').addEventListener('click', async () => {
    await WardrobeDB.deleteOutfit(id);
    await loadData();
    closeModal();
    renderOutfits();
    toast('已删除');
  });
}

/* ===================== 备份：导出 / 导入 ===================== */
function exportData() {
  const data = {
    type: 'familyWardrobeBackup',
    accounts: state.accounts,
    items: state.items,
    outfits: state.outfits,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `衣橱备份_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('已导出备份');
}

async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || data.type !== 'familyWardrobeBackup') throw new Error('格式不符');
    if (data.accounts) for (const a of data.accounts) await WardrobeDB.putAccount(a);
    if (data.items) for (const it of data.items) await WardrobeDB.putItem(it);
    if (data.outfits) for (const o of data.outfits) await WardrobeDB.putOutfit(o);
    state.accounts = await WardrobeDB.getAllAccounts();
    if (!state.accounts.find((a) => a.id === state.currentAccountId)) {
      state.currentAccountId = state.accounts[0].id;
      localStorage.setItem('fw_currentAccount', state.currentAccountId);
    }
    await loadData();
    closeModal();
    renderAll();
    toast('导入成功');
  } catch (err) {
    toast('导入失败：备份文件格式错误');
  }
  e.target.value = '';
}

/* ===================== 导航 / 总渲染 ===================== */
function renderTop() {
  const a = currentAccount();
  $('#accountName').textContent = a ? a.name : '未选择';
  const av = $('#accountAvatar');
  av.textContent = (a ? a.name : '家')[0];
  if (a) av.style.background = a.color;
}
function updateActiveNav() {
  $$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.screen === state.screen));
}
function switchScreen(name) {
  state.screen = name;
  $$('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
  const titles = { home: '我的衣橱', closet: '我的衣橱', outfits: '我的搭配', stats: '穿搭日历', me: '我的' };
  $('#topTitle').textContent = titles[name] || '家庭衣橱';
  updateActiveNav();
}
function renderAll() {
  renderTop();
  renderHome();
  renderCloset();
  renderOutfits();
  renderStats();
  renderMe();
  updateActiveNav();
}

/* ===================== 事件绑定 ===================== */
function bindEvents() {
  $$('.nav-btn').forEach((b) => b.addEventListener('click', () => switchScreen(b.dataset.screen)));
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => switchScreen(b.dataset.go)));
  $('#addItemFab').addEventListener('click', () => openItemEditor(null));
  $('#accountPill').addEventListener('click', openAccountModal);
  $('#topTitlePill').addEventListener('click', openAccountModal);
  $('#addOutfitBtn').addEventListener('click', () => openOutfitEditor(null));
  $('#addCategoryBtn').addEventListener('click', openAddCategoryModal);
  $('#batchImportBtn').addEventListener('click', openBatchImportModal);

  $('#seasonBar').addEventListener('click', (e) => {
    const b = e.target.closest('.season-pill');
    if (b) { state.seasonFilter = b.dataset.season; state.subCategoryFilter = 'all'; renderCloset(); }
  });
  $('#catSidebar').addEventListener('click', (e) => {
    const b = e.target.closest('.sidebar-item');
    if (!b) return;
    const cat = b.dataset.cat;
    state.categoryFilter = cat === '全部' ? 'all' : cat;
    state.subCategoryFilter = 'all';
    renderSidebar();
    renderSubTags();
    renderItemGrid();
  });
  $('#subTags').addEventListener('click', (e) => {
    const b = e.target.closest('.sub-tag');
    if (!b) return;
    state.subCategoryFilter = b.dataset.sub;
    renderSubTags();
    renderItemGrid();
  });
  $('#sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; renderItemGrid(); });
  $('#filterBtn').addEventListener('click', () => toast('筛选功能后续开放'));
  $('#editGridBtn').addEventListener('click', () => toast('批量编辑功能后续开放'));
  $('#itemGrid').addEventListener('click', (e) => {
    const c = e.target.closest('.item-card');
    if (c) { const it = state.items.find((x) => x.id === c.dataset.id); if (it) openItemEditor(it); }
  });
  $('#outfitList').addEventListener('click', (e) => {
    const c = e.target.closest('.outfit-card');
    if (c) { const o = state.outfits.find((x) => x.id === c.dataset.id); if (o) openOutfitEditor(o); }
  });
  $('#modalRoot').addEventListener('click', (e) => {
    if (e.target.id === 'modalRoot' || e.target.hasAttribute('data-close')) closeModal();
  });
  window.addEventListener('online', () => { toast('已恢复在线'); renderMe(); });
  window.addEventListener('offline', () => { toast('已离线，可继续使用'); renderMe(); });
}

/* ===================== 启动 ===================== */
async function init() {
  await WardrobeDB.open();
  state.accounts = await WardrobeDB.getAllAccounts();
  if (state.accounts.length === 0) {
    await createAccount('我');
    state.accounts = await WardrobeDB.getAllAccounts();
  }
  if (!state.currentAccountId || !state.accounts.find((a) => a.id === state.currentAccountId)) {
    state.currentAccountId = state.accounts[0].id;
    localStorage.setItem('fw_currentAccount', state.currentAccountId);
  }
  await loadData();
  bindEvents();
  renderAll();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
      navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
