'use strict';

/* ===================== 常量 ===================== */
const CATEGORIES = ['上装', '下装', '鞋子', '包包', '配饰', '其它'];
const SUB_CATEGORIES = {
  '上装': ['T恤', '卫衣', '衬衫', '毛衣', '夹克', '大衣', '羽绒服'],
  '下装': ['牛仔裤', '休闲裤', '运动裤', '短裤', '半身裙', '连衣裙'],
  '鞋子': ['运动鞋', '休闲鞋', '皮鞋', '靴子', '凉鞋', '拖鞋'],
  '包包': ['单肩包', '双肩包', '手提包', '斜挎包', '钱包', '手拿包'],
  '配饰': ['帽子', '围巾', '眼镜', '项链', '耳环', '手表', '腰带'],
  // 「其它」为自由分类：二级分类由用户自行填写（见 subSuggestionsHtml，预设+已用历史）
  '其它': [],
};
const CAT_COLOR = {
  '上装': '#F2B8C6', '下装': '#A9CFE8', '鞋子': '#9FDCC0', '包包': '#E8CFA0', '配饰': '#C9B8E0', '其它': '#A8D8D0',
};
const SEASONS = [
  { key: 'spring', label: '春', color: '#8BC48A' },
  { key: 'summer', label: '夏', color: '#F4A261' },
  { key: 'autumn', label: '秋', color: '#D4A373' },
  { key: 'winter', label: '冬', color: '#7EB5D6' },
];
const SEASON_LABEL = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
const SEASON_COLOR = { spring: '#8BC48A', summer: '#F4A261', autumn: '#D4A373', winter: '#7EB5D6' };
// 尺码按一级分类智能切换（鞋子显示常规鞋码、上装/下装显示服装码、包包/配饰/洗护显示通用规格）
const SIZE_OPTIONS = {
  '鞋子': ['不填', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  '上装': ['不填', '均码', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  '下装': ['不填', '均码', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  '包包': ['不填', '均码', '小号', '中号', '大号'],
  '配饰': ['不填', '均码', '可调节'],
  '其它': ['不填', '小瓶', '中瓶', '大瓶', '补充装', '旅行装', '替换装'],
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
// 材质/面料预设
const MATERIAL_LIST = ['棉', '麻', '真丝', '羊毛', '涤纶', '混纺', '牛仔', '针织', '其他'];
const materialOptionsHtml = (sel) => ['<option value="">不填</option>'].concat(MATERIAL_LIST.map((m) => `<option value="${m}" ${sel === m ? 'selected' : ''}>${m}</option>`)).join('');
const CAT_ICON = { '全部': '📋', '上装': '👕', '下装': '👖', '鞋子': '👟', '包包': '👜', '配饰': '🕶️', '其它': '🧴' };
const SUB_ICON = {
  'T恤': '👕', '卫衣': '🧥', '衬衫': '👔', '毛衣': '🧶', '夹克': '🧥', '大衣': '🧥', '羽绒服': '🧥',
  '牛仔裤': '👖', '休闲裤': '👖', '运动裤': '🩳', '短裤': '🩳', '半身裙': '👗', '连衣裙': '👗',
  '运动鞋': '👟', '休闲鞋': '👞', '皮鞋': '👞', '靴子': '🥾', '凉鞋': '👡', '拖鞋': '🩴',
  '单肩包': '👜', '双肩包': '🎒', '手提包': '👛', '斜挎包': '👜', '钱包': '👛', '手拿包': '👛',
  '帽子': '🎩', '围巾': '🧣', '眼镜': '👓', '项链': '💎', '耳环': '💎', '手表': '⌚', '腰带': '💫',
  '洗衣液': '🧴', '洗衣凝珠': '🫧', '柔顺剂': '🧴', '衣物消毒液': '🧼', '去渍笔': '🧽', '鞋油/鞋刷': '🥿', '留香珠': '🫧', '收纳工具': '🧺',
};
const ACCOUNT_COLORS = ['#54BFA1', '#A9CFE8', '#E8B6C6', '#E8CFA0', '#C9B8E0', '#9FDCC0'];

/* ===================== 每日励志语录 ===================== */
// 正面向上的句子：名人名言 / 浪漫散文 / 励志短句，离线内置，每次打开随机显示
const QUOTES = [
  { t: '生活原本沉闷，但跑起来就有风。', a: '佚名', theme: 'nature' },
  { t: '你只管努力，剩下的交给时间。', a: '佚名', theme: 'hope' },
  { t: '星光不问赶路人，时光不负有心人。', a: '佚名', theme: 'star' },
  { t: '每一个不曾起舞的日子，都是对生命的辜负。', a: '尼采', theme: 'star' },
  { t: '不乱于心，不困于情，不畏将来，不念过往。', a: '丰子恺', theme: 'mountain' },
  { t: '且将新火试新茶，诗酒趁年华。', a: '苏轼', theme: 'sun' },
  { t: '纵有疾风起，人生不言弃。', a: '瓦雷里', theme: 'mountain' },
  { t: '人间值得，未来可期。', a: '佚名', theme: 'flower' },
  { t: '热爱可抵岁月漫长。', a: '佚名', theme: 'flower' },
  { t: '所有的运气和惊喜，都来自你日复一日的认真与努力。', a: '佚名', theme: 'sun' },
  { t: '心之所向，素履以往。', a: '佚名', theme: 'mountain' },
  { t: '生活明朗，万物可爱。', a: '佚名', theme: 'sun' },
  { t: '你所见的惊艳，都曾被平庸历练。', a: '佚名', theme: 'flower' },
  { t: '慢慢来，谁还不是一边努力一边成长。', a: '佚名', theme: 'nature' },
  { t: '心有繁星，沐光而行。', a: '佚名', theme: 'star' },
  { t: '前路浩浩荡荡，万事尽可期待。', a: '佚名', theme: 'mountain' },
  { t: '凡是过往，皆为序章。', a: '莎士比亚', theme: 'book' },
  { t: '长风破浪会有时，直挂云帆济沧海。', a: '李白', theme: 'sea' },
  { t: '路虽远，行则将至；事虽难，做则必成。', a: '《格言联璧》', theme: 'mountain' },
  { t: '士不可以不弘毅，任重而道远。', a: '《论语》', theme: 'book' },
  { t: '锲而不舍，金石可镂。', a: '荀子', theme: 'mountain' },
  { t: '春风十里不如你。', a: '冯唐', theme: 'flower' },
  { t: '你来人间一趟，你要看看太阳。', a: '海子', theme: 'sun' },
  { t: '世界以痛吻我，要我报之以歌。', a: '泰戈尔', theme: 'flower' },
  { t: '当你穿过了暴风雨，你早已不再是原来那个人。', a: '村上春树', theme: 'sea' },
  { t: '保持热爱，奔赴山海。', a: '佚名', theme: 'sea' },
  { t: '你若盛开，清风自来。', a: '佚名', theme: 'flower' },
  { t: '万物皆有裂痕，那是光照进来的地方。', a: '莱昂纳德·科恩', theme: 'star' },
  { t: '即使没有月亮，心中也是一片皎洁。', a: '佚名', theme: 'star' },
  { t: '微笑着去唱生活的歌谣。', a: '佚名', theme: 'sun' },
  { t: '愿有岁月可回首，且以深情共白头。', a: '佚名', theme: 'flower' },
  { t: '努力的意义，是不想让未来的自己讨厌现在的自己。', a: '佚名', theme: 'hope' },
  { t: '今天也是元气满满的一天！', a: '佚名', theme: 'sun' },
  { t: '把日子过成诗，简单而精致。', a: '佚名', theme: 'book' },
  { t: '温柔半两，从容一生。', a: '佚名', theme: 'flower' },
  { t: '我们单枪匹马闯入这世间，只为活出属于自己的所有可能。', a: '佚名', theme: 'mountain' },
  { t: '愿你出走半生，归来仍是少年。', a: '佚名', theme: 'star' },
  { t: '与其互为人间，不如自成宇宙。', a: '佚名', theme: 'star' },
  { t: '海阔凭鱼跃，天高任鸟飞。', a: '佚名', theme: 'sea' },
  { t: '你要做一只鸟，飞往你的山。', a: '塔拉·韦斯特弗', theme: 'mountain' },
  { t: '把每一个平凡的日子，过出欢喜。', a: '佚名', theme: 'flower' },
  { t: '心若向阳，无畏悲伤。', a: '佚名', theme: 'sun' },
  { t: '与其等待别人送花，不如自己种一座花园。', a: '佚名', theme: 'flower' },
  { t: '走过的路，每一步都算数。', a: '佚名', theme: 'hope' },
  { t: '别灰心，普普通通的我们，也值得被生活温柔以待。', a: '佚名', theme: 'flower' },
  { t: '总有一束光，为你而亮。', a: '佚名', theme: 'star' },
  { t: '山高水长，怕什么来不及。', a: '佚名', theme: 'mountain' },
  { t: '把烦恼写在沙滩上，让海浪带走它。', a: '佚名', theme: 'sea' },
  { t: '心存希冀，目有繁星。', a: '佚名', theme: 'star' },
  { t: '万物生长，不负春光。', a: '佚名', theme: 'nature' },
  { t: '愿你手中有书，眼里有光。', a: '佚名', theme: 'book' },
  { t: '风很温柔，你也是。', a: '佚名', theme: 'nature' },
  { t: '把日子调成自己喜欢的频道。', a: '佚名', theme: 'sun' },
  { t: '那些打不倒你的，终将使你更强大。', a: '佚名', theme: 'mountain' },
  { t: '认真生活的人，会被生活偏爱。', a: '佚名', theme: 'flower' },
  { t: '只要还有期待，日子就有盼头。', a: '佚名', theme: 'hope' },
  { t: '种一棵树最好的时间是十年前，其次是现在。', a: '佚名', theme: 'nature' },
  { t: '你不必借光而行，你本身就是光。', a: '佚名', theme: 'star' },
  { t: '生活的最佳状态，是冷冷清清地风风火火。', a: '佚名', theme: 'sun' },
  { t: '在心里种花，人生才不会荒芜。', a: '佚名', theme: 'flower' },
  { t: '理想是指路明灯。', a: '车尔尼雪夫斯基', theme: 'star' },
  { t: '黑夜给了我黑色的眼睛，我却用它寻找光明。', a: '顾城', theme: 'star' },
  { t: '沉舟侧畔千帆过，病树前头万木春。', a: '刘禹锡', theme: 'nature' },
  { t: '会当凌绝顶，一览众山小。', a: '杜甫', theme: 'mountain' },
  { t: '千磨万击还坚劲，任尔东西南北风。', a: '郑板桥', theme: 'mountain' },
  { t: '宝剑锋从磨砺出，梅花香自苦寒来。', a: '佚名', theme: 'flower' },
  { t: '业精于勤，荒于嬉。', a: '韩愈', theme: 'book' },
  { t: '海纳百川，有容乃大。', a: '佚名', theme: 'sea' },
  { t: '落霞与孤鹜齐飞，秋水共长天一色。', a: '王勃', theme: 'sea' },
  { t: '采菊东篱下，悠然见南山。', a: '陶渊明', theme: 'mountain' },
  { t: '静以修身，俭以养德。', a: '诸葛亮', theme: 'book' },
  { t: '非淡泊无以明志，非宁静无以致远。', a: '诸葛亮', theme: 'book' },
  { t: '不积跬步，无以至千里。', a: '荀子', theme: 'mountain' },
  { t: '博观而约取，厚积而薄发。', a: '苏轼', theme: 'book' },
  { t: '苔花如米小，也学牡丹开。', a: '袁枚', theme: 'flower' },
  { t: '既然选择了远方，便只顾风雨兼程。', a: '汪国真', theme: 'mountain' },
  { t: '人生若只如初见。', a: '纳兰性德', theme: 'flower' },
  { t: '宠辱不惊，看庭前花开花落。', a: '佚名', theme: 'flower' },
  { t: '闲看庭前花开花落，漫随天外云卷云舒。', a: '佚名', theme: 'nature' },
  { t: '你若安好，便是晴天。', a: '佚名', theme: 'sun' },
];
// 与语录主题对应的小清新插画（程序化 SVG，离线内置，奶油白/薄荷绿/浅蓝配色）
const THEME_ART = {
  hope: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="56" r="22" fill="#F4C95D"/><g stroke="#F4C95D" stroke-width="3" stroke-linecap="round"><line x1="60" y1="20" x2="60" y2="29"/><line x1="24" y1="56" x2="33" y2="56"/><line x1="87" y1="56" x2="96" y2="56"/><line x1="36" y1="32" x2="41" y2="37"/><line x1="79" y1="32" x2="84" y2="37"/></g><path d="M14 86 Q60 70 106 86 L106 100 L14 100 Z" fill="#9FD8C4"/><path d="M14 92 Q60 80 106 92 L106 104 L14 104 Z" fill="#54BFA1"/></svg>`,
  nature: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M60 102 L60 54" stroke="#54BFA1" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M60 70 C40 70 30 54 30 40 C50 40 62 54 60 70 Z" fill="#9FD8C4"/><path d="M60 62 C80 62 90 46 90 32 C70 32 58 46 60 62 Z" fill="#54BFA1"/><path d="M44 106 Q60 100 76 106" stroke="#8FD0BB" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  sea: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="88" cy="40" r="14" fill="#F4C95D"/><path d="M8 70 Q30 56 52 70 T96 70 T140 70" stroke="#A9D7EC" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M8 84 Q30 70 52 84 T96 84 T140 84" stroke="#7FC4DE" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M8 98 Q30 84 52 98 T96 98 T140 98" stroke="#54BFA1" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  flower: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M60 106 L60 60" stroke="#54BFA1" stroke-width="4" stroke-linecap="round"/><path d="M60 78 C48 78 42 68 44 60" stroke="#9FD8C4" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#F4A6B8"><circle cx="60" cy="40" r="11"/><circle cx="44" cy="52" r="11"/><circle cx="76" cy="52" r="11"/><circle cx="50" cy="66" r="11"/><circle cx="70" cy="66" r="11"/></g><circle cx="60" cy="54" r="9" fill="#F4C95D"/></svg>`,
  mountain: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="88" cy="38" r="12" fill="#F4C95D"/><path d="M12 96 L46 50 L66 76 L84 44 L108 96 Z" fill="#9FD8C4"/><path d="M46 50 L56 64 L36 64 Z" fill="#FFFFFF" opacity=".9"/><path d="M84 44 L92 56 L76 56 Z" fill="#FFFFFF" opacity=".9"/><rect x="10" y="96" width="100" height="8" rx="4" fill="#54BFA1"/></svg>`,
  star: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M78 26 a22 22 0 1 0 14 42 a16 16 0 1 1 -14 -42 Z" fill="#A9D7EC"/><g fill="#F4C95D"><path d="M40 28 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z"/><path d="M28 58 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z"/><path d="M52 62 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z"/></g></svg>`,
  book: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M60 34 C44 26 26 28 14 34 L14 92 C26 86 44 84 60 92 Z" fill="#A9D7EC"/><path d="M60 34 C76 26 94 28 106 34 L106 92 C94 86 76 84 60 92 Z" fill="#9FD8C4"/><path d="M60 34 L60 92" stroke="#54BFA1" stroke-width="3"/><g stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity=".85"><line x1="22" y1="46" x2="50" y2="43"/><line x1="22" y1="56" x2="50" y2="53"/><line x1="22" y1="66" x2="50" y2="63"/><line x1="70" y1="43" x2="98" y2="46"/><line x1="70" y1="53" x2="98" y2="56"/><line x1="70" y1="63" x2="98" y2="66"/></g></svg>`,
  sun: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="58" r="26" fill="#F4C95D"/><g stroke="#F4C95D" stroke-width="3.5" stroke-linecap="round"><line x1="60" y1="16" x2="60" y2="27"/><line x1="18" y1="58" x2="29" y2="58"/><line x1="91" y1="58" x2="102" y2="58"/><line x1="31" y1="29" x2="38" y2="36"/><line x1="82" y1="29" x2="89" y2="36"/><line x1="31" y1="87" x2="38" y2="80"/><line x1="82" y1="87" x2="89" y2="80"/></g><circle cx="51" cy="54" r="3" fill="#7A5A1E"/><circle cx="69" cy="54" r="3" fill="#7A5A1E"/><path d="M50 64 Q60 72 70 64" stroke="#7A5A1E" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
};

let _lastQuoteIdx = -1;
function renderQuote() {
  const box = $('#quoteCard');
  if (!box || QUOTES.length === 0) return;
  let i = Math.floor(Math.random() * QUOTES.length);
  if (QUOTES.length > 1 && i === _lastQuoteIdx) i = (i + 1) % QUOTES.length;
  _lastQuoteIdx = i;
  const q = QUOTES[i];
  const art = THEME_ART[q.theme] || THEME_ART.hope;
  box.innerHTML = `<button class="quote-refresh" id="quoteRefresh" title="换一句">🔄</button>`
    + `<div class="quote-text"><span class="quote-mark">“</span>${esc(q.t)}</div>`
    + `<span class="quote-author">— ${esc(q.a)}</span>`
    + `<div class="quote-art">${art}</div>`;
  const rf = $('#quoteRefresh');
  if (rf) rf.addEventListener('click', renderQuote);
}

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
  locationFilter: 'all',
  colorFilter: 'all',
  brandFilter: 'all',
  sizeFilter: 'all',
  idleFilter: 'all',
  screen: 'closet',
  _img: null,
  trash: [],
  wearLog: [],
  multiSelect: false,
  selectedIds: new Set(),
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
  const all = (await WardrobeDB.getItemsByAccount(state.currentAccountId)) || [];
  state.items = all.filter((it) => !it.deletedAt).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  state.trash = all.filter((it) => it.deletedAt).sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  state.outfits = (await WardrobeDB.getOutfitsByAccount(state.currentAccountId)) || [];
  state.wearLog = (await WardrobeDB.getWearLogByAccount(state.currentAccountId)) || [];
  // 迁移：旧分类名「洗护用品」→「其它」（改名后旧数据不丢失）
  const OLD_CAT = '洗护用品', NEW_CAT = '其它';
  const needMig = [...state.items, ...state.trash].filter((it) => it.category === OLD_CAT);
  if (needMig.length) {
    needMig.forEach((it) => { it.category = NEW_CAT; });
    for (const it of needMig) await WardrobeDB.putItem(it);
  }
  if (state.accounts && state.accounts.length) {
    for (const a of state.accounts) {
      if (a.categories && a.categories.includes(OLD_CAT)) {
        a.categories = a.categories.map((c) => (c === OLD_CAT ? NEW_CAT : c));
        await WardrobeDB.putAccount(a);
      }
    }
  }
  const acc = currentAccount();
  // 始终并入全局默认分类（新增分类对老账号也可见），再加上账号自定义分类与历史数据里实际存在的分类
  const accCats = (acc && acc.categories && acc.categories.length) ? acc.categories : [];
  const extras = state.items.map((it) => it.category).filter(Boolean);
  state.categories = [...new Set([...CATEGORIES, ...accCats, ...extras])];
}

/* ===================== 渲染：衣橱 / 单品 ===================== */
function getFilteredItems() {
  let list = state.items.filter((it) => {
    if (state.seasonFilter !== 'all' && !(it.seasons || []).includes(state.seasonFilter)) return false;
    if (state.categoryFilter !== 'all' && it.category !== state.categoryFilter) return false;
    if (state.subCategoryFilter !== 'all' && it.subCategory !== state.subCategoryFilter) return false;
    if (state.locationFilter !== 'all' && (it.location || '') !== state.locationFilter) return false;
    if (state.colorFilter !== 'all' && (it.color || '') !== state.colorFilter) return false;
    if (state.brandFilter !== 'all' && (it.brand || '') !== state.brandFilter) return false;
    if (state.sizeFilter !== 'all' && (it.size || '不填') !== state.sizeFilter) return false;
    if (state.idleFilter === 'never' && (it.wornCount || 0) !== 0) return false;
    if (state.idleFilter === 'rarely' && (it.wornCount || 0) > 2) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const hay = [it.name, it.category, it.subCategory, it.color, it.brand, it.note, (it.tags || []).join(' ')].filter(Boolean).join(' ').toLowerCase();
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
  const cat = state.categoryFilter;
  const preset = SUB_CATEGORIES[cat] || [];
  const used = [...new Set(state.items.filter((it) => it.category === cat && it.subCategory).map((it) => it.subCategory))];
  const all = [...new Set([...preset, ...used])];
  if (all.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  const counts = {};
  state.items.forEach((it) => {
    if (it.category !== cat) return;
    if (state.seasonFilter !== 'all' && !(it.seasons || []).includes(state.seasonFilter)) return;
    if (it.subCategory) counts[it.subCategory] = (counts[it.subCategory] || 0) + 1;
  });
  wrap.innerHTML = [{ label: '全部', key: 'all' }].concat(all.map((s) => ({ label: s, key: s }))).map((o) =>
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
      <div class="item-card ${state.multiSelect ? 'selectable' : ''} ${state.selectedIds.has(it.id) ? 'selected' : ''}" data-id="${it.id}">
        <div class="item-thumb">${it.image ? `<img src="${it.image}" alt="${esc(it.name)}">` : `<span class="no-img">👕</span>`}</div>
        <div class="item-meta">
          <div class="item-name">${esc(it.name || '未命名')}</div>
          <div class="item-sub">${esc([it.category, it.subCategory].filter(Boolean).join(' · '))}${it.color ? (' · ' + esc(it.color)) : ''}${it.size && it.size !== '不填' ? (' · ' + esc(it.size)) : ''}${it.location ? (' · 📍' + esc(it.location)) : ''}${it.material ? (' · ' + esc(it.material)) : ''}${it.washStatus && it.washStatus !== '正常' ? (' · 🧺' + esc(it.washStatus)) : ''}${(it.tags && it.tags.length) ? (' · 🏷' + esc(it.tags.join('/'))) : ''}${it.buyDate ? (' · 衣龄' + (new Date().getFullYear() - new Date(it.buyDate).getFullYear()) + '年') : ''}${it.expireDate ? (' · ⏳' + esc(it.expireDate) + (expireState(it.expireDate) === 'expired' ? ' <span class="exp-warn">⚠️已过期</span>' : expireState(it.expireDate) === 'soon' ? ' <span class="exp-soon">⏰1个月内到期</span>' : ' 到期')) : ''}</div>
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
  const fActive = state.search || state.locationFilter !== 'all' || state.colorFilter !== 'all' || state.brandFilter !== 'all' || state.sizeFilter !== 'all' || state.idleFilter !== 'all';
  const fb = $('#filterBtn');
  if (fb) fb.classList.toggle('active', !!fActive);
  const eb = $('#editGridBtn');
  if (eb) eb.textContent = state.multiSelect ? '完成' : '多选';
  const bar = $('#batchBar');
  if (bar) {
    bar.hidden = !state.multiSelect;
    $('#batchCount').textContent = '已选 ' + state.selectedIds.size + ' 件';
  }
}

function uniqueValues(key) {
  const set = new Set();
  state.items.forEach((it) => { const v = it[key]; if (v && v !== '不填') set.add(v); });
  return [...set].sort();
}
function optionList(values, selected, allLabel) {
  return `<option value="all">${allLabel}</option>` + values.map((v) => `<option value="${esc(v)}" ${selected === v ? 'selected' : ''}>${esc(v)}</option>`).join('');
}
function openFilterModal() {
  const body = `
    <label class="field"><span>关键词</span><input type="text" id="fSearch" placeholder="名称 / 备注" value="${esc(state.search)}"></label>
    <label class="field"><span>存储位置</span><select id="fLoc">${optionList(uniqueValues('location'), state.locationFilter, '全部位置')}</select></label>
    <label class="field"><span>颜色</span><select id="fColorF">${optionList(uniqueValues('color'), state.colorFilter, '全部颜色')}</select></label>
    <label class="field"><span>品牌</span><select id="fBrandF">${optionList(uniqueValues('brand'), state.brandFilter, '全部品牌')}</select></label>
    <label class="field"><span>尺码</span><select id="fSizeF">${optionList(uniqueValues('size'), state.sizeFilter, '全部尺码')}</select></label>
    <label class="field"><span>闲置程度</span><select id="fIdle">
      <option value="all">全部</option>
      <option value="never" ${state.idleFilter === 'never' ? 'selected' : ''}>从未穿过</option>
      <option value="rarely" ${state.idleFilter === 'rarely' ? 'selected' : ''}>很少穿(≤2次)</option>
    </select></label>`;
  const foot = `<button class="btn-text" id="filterReset">重置</button><button class="btn-primary" id="filterApply">应用</button>`;
  openModal({ title: '筛选', body, foot });
  $('#filterApply').addEventListener('click', () => {
    state.search = $('#fSearch').value.trim();
    state.locationFilter = $('#fLoc').value;
    state.colorFilter = $('#fColorF').value;
    state.brandFilter = $('#fBrandF').value;
    state.sizeFilter = $('#fSizeF').value;
    state.idleFilter = $('#fIdle').value;
    closeModal();
    renderCloset();
  });
  $('#filterReset').addEventListener('click', () => {
    state.search = ''; state.locationFilter = 'all'; state.colorFilter = 'all';
    state.brandFilter = 'all'; state.sizeFilter = 'all'; state.idleFilter = 'all';
    closeModal(); renderCloset();
  });
}

/* ===================== 渲染：首页 ===================== */
function renderHome() {
  renderWeather();
  renderQuote();
}
const WMO_DESC = {
  0: '晴', 1: '大致晴朗', 2: '局部多云', 3: '阴',
  45: '雾', 48: '雾凇', 51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
  61: '小雨', 63: '中雨', 65: '大雨', 66: '冻雨', 67: '强冻雨',
  71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
  80: '阵雨', 81: '强阵雨', 82: '暴雨', 85: '阵雪', 86: '强阵雪',
  95: '雷阵雨', 96: '雷阵雨伴冰雹', 99: '强雷暴冰雹',
};
function weatherDesc(code) { return WMO_DESC[code] != null ? WMO_DESC[code] : '未知'; }
function weatherTip(temp) {
  if (temp >= 30) return '高温酷暑，穿短袖/裙子，注意防晒补水';
  if (temp >= 25) return '炎热，短袖、薄衫最舒适';
  if (temp >= 20) return '舒适温暖，单衣或薄外套即可';
  if (temp >= 15) return '微凉，长袖或加件薄外套';
  if (temp >= 10) return '偏凉，毛衣/卫衣+外套';
  if (temp >= 0) return '寒冷，羽绒/厚外套+保暖内搭';
  return '严寒，厚羽绒+围巾帽子全副武装';
}
const loadWeatherCity = () => {
  try { return JSON.parse(localStorage.getItem('wardrobe_weather_city') || 'null'); } catch (e) { return null; }
};
async function geocodeCity(name) {
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&language=zh&count=1`);
    const d = await r.json();
    if (d && d.results && d.results.length) {
      const g = d.results[0];
      const extra = [g.admin1 && g.admin1 !== g.name ? g.admin1 : '', g.country && g.country !== '中国' ? g.country : ''].filter(Boolean).join('·');
      return { label: g.name + (extra ? '·' + extra : ''), latitude: g.latitude, longitude: g.longitude };
    }
  } catch (e) {}
  return null;
}
function editWeatherCity() {
  openModal({
    title: '设置默认城市',
    body: '<p class="muted small">输入你所在的城市，天气将默认显示该城市（如：上海、广州、成都）。留空则继续使用手机定位。</p>'
      + '<label class="field"><span>城市</span><input type="text" id="wxCityInput" placeholder="如：上海"></label>',
    foot: '<button class="btn-text" data-close>取消</button><button class="btn-primary" id="wxCityOk">确定</button>',
  });
  setTimeout(() => { const i = $('#wxCityInput'); if (i) i.focus(); }, 60);
  $('#wxCityOk').addEventListener('click', async () => {
    const name = $('#wxCityInput').value.trim();
    if (!name) { try { localStorage.removeItem('wardrobe_weather_city'); } catch (e) {} closeModal(); renderWeather(); toast('已恢复使用手机定位'); return; }
    const geo = await geocodeCity(name);
    if (!geo) { toast('未找到该城市，请检查名称'); return; }
    try { localStorage.setItem('wardrobe_weather_city', JSON.stringify(geo)); } catch (e) {}
    closeModal();
    renderWeather();
    toast('已默认显示：' + geo.label);
  });
}
function renderWeather() {
  const box = $('#weatherCard');
  if (!box) return;
  if (!navigator.onLine) { box.innerHTML = '<p class="muted small">📡 天气需联网查看</p>'; return; }
  const attachCityEdit = () => { const e = $('#wxCityEdit'); if (e) e.onclick = editWeatherCity; };
  const show = (temp, code, city) => {
    const t = Math.round(temp);
    box.innerHTML = `<div class="wx-main"><div class="wx-temp">${t}°</div><div class="wx-desc">${weatherDesc(code)}</div><div class="wx-city" id="wxCityEdit" title="点击修改城市">${esc(city)} ✎</div></div><div class="wx-tip">👕 ${weatherTip(t)}</div>`;
    attachCityEdit();
  };
  const fetchByCoord = async (lat, lon, cityName) => {
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
      const d = await r.json();
      if (d && d.current) show(d.current.temperature_2m, d.current.weather_code, cityName);
      else fallback();
    } catch (e) { fallback(); }
  };
  const fallback = () => {
    const saved = loadWeatherCity();
    fetchByCoord(39.9042, 116.4074, saved ? saved.label : '北京（点击设置城市）');
  };
  const saved = loadWeatherCity();
  if (saved) { fetchByCoord(saved.latitude, saved.longitude, saved.label); return; }
  if (!navigator.geolocation) { fallback(); return; }
  let done = false;
  const geoTimer = setTimeout(() => { if (!done) { done = true; fallback(); } }, 9000);
  navigator.geolocation.getCurrentPosition(async (pos) => {
    if (done) return; done = true; clearTimeout(geoTimer);
    const { latitude, longitude } = pos.coords;
    fetchByCoord(latitude, longitude, '当前位置');
  }, () => { if (!done) { done = true; clearTimeout(geoTimer); fallback(); } }, { timeout: 9000 });
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
function currentSeasonKey() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

function openPickToday() {
  const season = currentSeasonKey();
  let pool = state.items.filter((it) => (it.seasons || []).length === 0 || (it.seasons || []).includes(season));
  if (pool.length < 3) pool = state.items;
  const pickCat = (cat) => {
    const arr = pool.filter((it) => it.category === cat);
    return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
  };
  const chosen = [pickCat('上装'), pickCat('下装'), pickCat('鞋子')].filter(Boolean);
  const rest = pool.filter((it) => !chosen.includes(it));
  while (chosen.length < 3 && rest.length) chosen.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  const body = `
    <p class="muted small">根据当前季节「${SEASON_LABEL[season]}」为你随机搭配：</p>
    <div class="pick-grid">
      ${chosen.map((it) => `<div class="pick-item on">${it.image ? `<img src="${it.image}" alt="">` : '<span>👕</span>'}<span class="pick-name">${esc(it.name || '未命名')}</span></div>`).join('')}
    </div>
    <button class="btn-primary full" id="recordTodayBtn">📅 记录今天穿了这些</button>`;
  openModal({ title: '今天穿什么', body });
  $('#recordTodayBtn').addEventListener('click', async () => {
    const date = todayStr();
    for (const c of chosen) { c.wornCount = (c.wornCount || 0) + 1; await WardrobeDB.putItem(c); }
    let log = state.wearLog.find((w) => w.date === date);
    const ids = chosen.map((c) => c.id);
    if (log) log.itemIds = [...new Set([...log.itemIds, ...ids])];
    else log = { id: uid(), accountId: state.currentAccountId, date, itemIds: ids, createdAt: Date.now() };
    await WardrobeDB.putWearLog(log);
    await loadData();
    closeModal(); renderCloset(); renderStats();
    toast('已记录今天穿搭');
  });
}
function showDayWear(w) {
  const items = (w.itemIds || []).map((id) => state.items.find((x) => x.id === id)).filter(Boolean);
  const body = `<p class="muted small">${w.date}</p><div class="pick-grid">${
    items.length ? items.map((it) => `<div class="pick-item on">${it.image ? `<img src="${it.image}" alt="">` : '<span>👕</span>'}<span class="pick-name">${esc(it.name || '未命名')}</span></div>`).join('') : '<p>当天无衣物记录</p>'
  }</div>`;
  openModal({ title: '当天穿搭', body });
}
function renderWearCalendar(container) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const logsByDay = {};
  state.wearLog.forEach((w) => {
    const parts = w.date.split('-').map(Number);
    if (parts[0] === y && parts[1] - 1 === m) logsByDay[parts[2]] = w;
  });
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<div class="cal-cell empty"></div>';
  for (let d = 1; d <= days; d++) {
    const w = logsByDay[d];
    cells += `<div class="cal-cell ${w ? 'has-log' : ''}" data-day="${d}">${d}${w ? '<span class="cal-dot"></span>' : ''}</div>`;
  }
  container.innerHTML = cells;
  container.querySelectorAll('.cal-cell.has-log').forEach((c) => c.addEventListener('click', () => {
    const w = logsByDay[Number(c.dataset.day)];
    if (w) showDayWear(w);
  }));
}

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
      <div class="bar-track"><div class="bar-fill" style="width:${total ? Math.round(byCat[c] / total * 100) : 0}%;background:${CAT_COLOR[c] || '#54BFA1'}"></div></div>
      <span class="bar-val">${byCat[c]}</span></div>`).join('') || '<p class="muted">暂无数据</p>';

  const top = [...items].sort((a, b) => (b.wornCount || 0) - (a.wornCount || 0)).slice(0, 5);
  const topHtml = top.length
    ? top.map((it) => `<div class="top-row"><span>${esc(it.name || '')}</span><span class="worn">${(it.wornCount || 0)} 次</span></div>`).join('')
    : '<p class="muted">暂无穿着记录</p>';

  $('#statsContent').innerHTML = `
    <div class="stat-block">
      <h3>今天穿什么</h3>
      <button class="btn-primary" id="pickTodayBtn">🎲 帮我随机搭一套</button>
      <p class="muted small">按当前季节从衣橱随机推荐，可一键记录今天穿了这些。</p>
    </div>
    <div class="stat-block">
      <h3>穿着日历（${new Date().getFullYear()}年${new Date().getMonth() + 1}月）</h3>
      <div class="cal-grid" id="calGrid"></div>
      <p class="muted small">有记录的日期会高亮，点击查看当天穿了什么。</p>
    </div>
    <div class="stat-cards">
      <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-lab">衣物总数</div></div>
      <div class="stat-card"><div class="stat-num">${totalValue.toLocaleString()}</div><div class="stat-lab">总价值(¥)</div></div>
      <div class="stat-card"><div class="stat-num">${state.outfits.length}</div><div class="stat-lab">搭配数</div></div>
    </div>
    <div class="stat-block"><h3>按季节分布</h3>${seasonBars}</div>
    <div class="stat-block"><h3>按分类分布</h3>${catBars}</div>
    <div class="stat-block"><h3>最常穿着</h3>${topHtml}</div>`;

  const pt = $('#pickTodayBtn');
  if (pt) pt.addEventListener('click', openPickToday);
  const cg = $('#calGrid');
  if (cg) renderWearCalendar(cg);
}

/* ===================== 渲染：我的 ===================== */
function renderMe() {
  const a = currentAccount();
  const offline = !navigator.onLine;
  $('#meContent').innerHTML = `
    <div class="me-card">
      <span class="avatar lg" style="background:${a ? a.color : '#54BFA1'}">${esc((a ? a.name : '家')[0])}</span>
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
      <h3>回收站</h3>
      <button class="btn-ghost full" id="openTrashBtn">查看回收站（${state.trash.length}）</button>
      <p class="muted small">删除的衣物会先进入回收站，可恢复或彻底删除，避免误删。</p>
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
  $('#openTrashBtn').addEventListener('click', openTrashModal);
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
// 二级分类建议：预设 + 该分类下已用过的自由文本（用户可自行添加新二级分类）
function subSuggestionsHtml(category) {
  const preset = SUB_CATEGORIES[category] || [];
  const used = [...new Set((state.items || []).filter((it) => it.category === category && it.subCategory).map((it) => it.subCategory))];
  return [...new Set([...preset, ...used])].map((s) => `<option value="${esc(s)}"></option>`).join('');
}
function todayStr() {
  const t = new Date();
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
}
// 保质期状态：expired=已过期 / soon=30天内临期 / ok=正常
function expireState(expStr) {
  if (!expStr) return 'none';
  const today = new Date(todayStr());
  const exp = new Date(expStr);
  if (isNaN(exp)) return 'none';
  if (exp < today) return 'expired';
  if ((exp - today) <= 30 * 86400000) return 'soon';
  return 'ok';
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
    <label class="field"><span>二级分类</span><input type="text" id="fSubCategory" list="subList" placeholder="可自由填写，如：洗衣液 / 工具" value="${esc(it.subCategory || '')}"><datalist id="subList">${subSuggestionsHtml(cat)}</datalist></label>
    <label class="field"><span>颜色</span><input type="text" id="fColor" placeholder="如：白色" value="${esc(it.color || '')}"></label>
    <label class="field"><span>尺码</span><select id="fSize">${sizeOptionsHtml(cat, it.size)}</select></label>
    <label class="field"><span>存储位置</span><input type="text" id="fLocation" list="locList" placeholder="如：主卧衣柜上层" value="${esc(it.location || '')}"></label>
    <datalist id="locList">${locOptionsHtml}</datalist>
    <label class="field"><span>材质/面料</span><select id="fMaterial">${materialOptionsHtml(it.material)}</select></label>
    <label class="field"><span>购买日期</span><input type="date" id="fBuyDate" value="${it.buyDate || ''}"></label>
    <label class="field"><span>保质期</span><input type="date" id="fExpire" value="${it.expireDate || ''}"></label>
    <label class="field"><span>标签</span><input type="text" id="fTags" placeholder="通勤,运动,约会" value="${(it.tags || []).join(',')}"></label>
    <label class="field"><span>状态</span><select id="fWash">
      <option value="正常" ${(!it.washStatus || it.washStatus === '正常') ? 'selected' : ''}>正常</option>
      <option value="待洗" ${it.washStatus === '待洗' ? 'selected' : ''}>待洗</option>
      <option value="待熨" ${it.washStatus === '待熨' ? 'selected' : ''}>待熨</option>
      <option value="待收纳" ${it.washStatus === '待收纳' ? 'selected' : ''}>待收纳</option>
    </select></label>
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
    const nc = e.target.value;
    $('#subList').innerHTML = subSuggestionsHtml(nc);
    const cur = $('#fSize').value;
    $('#fSize').innerHTML = sizeOptionsHtml(nc, sizeOptionsFor(nc).includes(cur) ? cur : '不填');
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
    material: $('#fMaterial').value,
    buyDate: $('#fBuyDate').value || '',
    expireDate: $('#fExpire').value || '',
    tags: $('#fTags').value.split(',').map((s) => s.trim()).filter(Boolean),
    washStatus: $('#fWash').value,
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

function softDeleteItem(id) {
  const it = state.items.find((x) => x.id === id);
  if (!it) return;
  it.deletedAt = Date.now();
  return WardrobeDB.putItem(it);
}
function confirmDeleteItem(id) {
  openModal({
    title: '删除衣物',
    body: '<p>确定删除这件衣物吗？它会先进入“回收站”，可在回收站恢复或彻底删除。</p>',
    foot: `<button class="btn-text" data-close>取消</button><button class="btn-primary danger" id="doDelete">删除</button>`,
  });
  $('#doDelete').addEventListener('click', async () => {
    await softDeleteItem(id);
    await loadData();
    closeModal();
    renderCloset(); renderStats();
    toast('已移入回收站');
  });
}

/* 多选 / 批量删除（软删除 → 进回收站） */
function toggleMultiSelect() {
  state.multiSelect = !state.multiSelect;
  if (!state.multiSelect) state.selectedIds.clear();
  renderCloset();
}
async function batchDeleteSelected() {
  if (state.selectedIds.size === 0) { toast('请先选择衣物'); return; }
  const n = state.selectedIds.size;
  for (const id of state.selectedIds) await softDeleteItem(id);
  state.selectedIds.clear();
  state.multiSelect = false;
  await loadData();
  renderCloset(); renderStats();
  toast('已移入回收站 ' + n + ' 件');
}

/* 回收站：恢复 / 彻底删除 / 清空 */
function openTrashModal() {
  const body = `
    <div class="trash-list">
      ${state.trash.length ? state.trash.map((it) => `
        <div class="trash-row">
          <div class="trash-thumb">${it.image ? `<img src="${it.image}" alt="">` : '👕'}</div>
          <div class="trash-info"><div>${esc(it.name || '未命名')}</div><div class="muted small">删除于 ${new Date(it.deletedAt).toLocaleDateString()}</div></div>
          <div class="trash-actions">
            <button class="btn-sm" data-restore="${it.id}">恢复</button>
            <button class="btn-sm danger" data-purge="${it.id}">彻底删</button>
          </div>
        </div>`).join('') : '<p class="muted">回收站是空的</p>'}
    </div>
    ${state.trash.length ? `<button class="btn-ghost full danger" id="emptyTrashBtn" style="margin-top:12px">清空回收站</button>` : ''}`;
  openModal({ title: '回收站（' + state.trash.length + '）', body });
  $$('#modalRoot [data-restore]').forEach((b) => b.addEventListener('click', async () => {
    const it = state.trash.find((x) => x.id === b.dataset.restore);
    if (it) { delete it.deletedAt; await WardrobeDB.putItem(it); await loadData(); renderCloset(); renderStats(); renderMe(); openTrashModal(); }
  }));
  $$('#modalRoot [data-purge]').forEach((b) => b.addEventListener('click', async () => {
    await WardrobeDB.deleteItem(b.dataset.purge);
    await loadData(); renderCloset(); renderStats(); renderMe(); openTrashModal();
  }));
  const et = $('#emptyTrashBtn');
  if (et) et.addEventListener('click', async () => {
    for (const it of state.trash) await WardrobeDB.deleteItem(it.id);
    await loadData(); renderCloset(); renderStats(); renderMe(); openTrashModal(); toast('已清空回收站');
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
      <label class="field"><span>默认二级分类</span><input type="text" id="batchSubCat" list="batchSubList" placeholder="可自由填写"></label><datalist id="batchSubList"></datalist>
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
    $('#batchSubList').innerHTML = subSuggestionsHtml(cat);
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
    $('#batchSubList').innerHTML = subSuggestionsHtml($('#batchCat').value);
  });
  function renderGrid() {
    const summary = $('#batchSummary');
    if (state._batch.length === 0) { grid.innerHTML = ''; summary.textContent = '尚未选择图片'; return; }
    summary.textContent = '共 ' + state._batch.length + ' 张';
    grid.innerHTML = state._batch.map((b, i) => `
      <div class="batch-card" data-i="${i}">
        <div class="batch-thumb"><img src="${b.dataUrl}" alt=""></div>
        <select data-i="${i}" data-field="cat">${state.categories.map((c) => `<option value="${c}" ${b.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
        <input type="text" data-i="${i}" data-field="sub" list="batchSubList" placeholder="二级分类" value="${esc(b.subCategory || '')}">
        <select data-i="${i}" data-field="size">${sizeOptionsHtml(b.category, b.size)}</select>
        <input type="text" data-i="${i}" data-field="location" list="batchLocList" placeholder="位置" value="${esc(b.location || '')}">
      </div>`).join('');
    $$('#batchGrid select[data-field="cat"]').forEach((sel) => sel.addEventListener('change', (e) => {
      const idx = Number(e.target.dataset.i);
      state._batch[idx].category = e.target.value;
      state._batch[idx].subCategory = '';
      const sizeSel = e.target.parentElement.querySelector('select[data-field="size"]');
      if (sizeSel) { sizeSel.innerHTML = sizeOptionsHtml(e.target.value, '不填'); state._batch[idx].size = '不填'; }
      $('#batchSubList').innerHTML = subSuggestionsHtml(e.target.value);
    }));
    $$('#batchGrid input[data-field="sub"]').forEach((inp) => inp.addEventListener('input', (e) => {
      state._batch[Number(e.target.dataset.i)].subCategory = e.target.value.trim();
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
    wearLog: state.wearLog,
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
    if (data.wearLog) for (const w of data.wearLog) await WardrobeDB.putWearLog(w);
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
  $('#filterBtn').addEventListener('click', openFilterModal);
  $('#editGridBtn').addEventListener('click', toggleMultiSelect);
  $('#batchDeleteSel').addEventListener('click', batchDeleteSelected);
  $('#batchCancelSel').addEventListener('click', () => { state.multiSelect = false; state.selectedIds.clear(); renderCloset(); });
  $('#itemGrid').addEventListener('click', (e) => {
    const c = e.target.closest('.item-card');
    if (!c) return;
    if (state.multiSelect) {
      const id = c.dataset.id;
      if (state.selectedIds.has(id)) state.selectedIds.delete(id); else state.selectedIds.add(id);
      renderItemGrid();
      const bar = $('#batchBar');
      if (bar) $('#batchCount').textContent = '已选 ' + state.selectedIds.size + ' 件';
      return;
    }
    const it = state.items.find((x) => x.id === c.dataset.id); if (it) openItemEditor(it);
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
