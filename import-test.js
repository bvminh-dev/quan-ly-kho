const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:4000/api/v1';

const toCode = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '');
};

const roundNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 0;
  const multiplier = Math.pow(10, decimals);
  return Math.round(num * multiplier) / multiplier;
};

async function importData() {
  let accessToken = '';

  const signin = async () => {
    try {
      const resp = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email: 'xxxxxx',
        password: 'xxxxxx'
      });
      accessToken = resp.data.data.accessToken;
      console.log('Signed in successfully');
    } catch (e) {
      console.error('Signin failed:', e.response?.data?.message || e.message);
    }
  };

  await signin();

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const dataContent = fs.readFileSync('./3.js', 'utf8');
  const aMatch = dataContent.match(/const a = (\[[\s\S]*?\]);/);
  if (!aMatch) {
    console.error('Could not find data array "a" in 3.js');
    return;
  }
  
  let a;
  try {
    a = eval(aMatch[1]);
  } catch (e) {
    console.error('Error parsing data array:', e);
    return;
  }

  const catalogs = {
    inchs: new Map(),
    items: new Map(),
    qualitys: new Map(),
    styles: new Map(),
    colors: new Map()
  };

  const fetchCatalog = async (type) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/catalog/${type}?pageSize=1000`, getHeaders());
      const items = resp.data.data.items;
      items.forEach(item => {
        catalogs[type].set(item.name, item._id);
      });
      console.log(`Fetched ${items.length} ${type}`);
    } catch (e) {
      console.error(`Error fetching catalog ${type}:`, e.message);
    }
  };

  await Promise.all([
    fetchCatalog('inchs'),
    fetchCatalog('items'),
    fetchCatalog('qualitys'),
    fetchCatalog('styles'),
    fetchCatalog('colors')
  ]);

  const ensureItem = async (type, name) => {
    if (catalogs[type].has(name)) return catalogs[type].get(name);
    
    const code = toCode(name);
    try {
      const resp = await axios.post(`${API_BASE_URL}/catalog/${type}`, { code, name }, getHeaders());
      const id = resp.data.data._id;
      catalogs[type].set(name, id);
      console.log(`Created ${type}: ${name} (${id})`);
      return id;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        const resp = await axios.get(`${API_BASE_URL}/catalog/${type}?pageSize=1000`, getHeaders());
        const item = resp.data.data.items.find(i => i.name === name || i.code === code);
        if (item) {
          catalogs[type].set(name, item._id);
          return item._id;
        }
      }
      console.error(`Error ensuring ${type} "${name}":`, e.response?.data?.message || e.message);
      return null;
    }
  };

  for (const entry of a) {
    const inchId = await ensureItem('inchs', entry.Inches);
    const itemId = await ensureItem('items', entry.LoaiSanPham);
    const qualityId = await ensureItem('qualitys', entry.ChatLuong);
    const styleId = await ensureItem('styles', entry.Kieu);
    const colorId = await ensureItem('colors', entry.MauSac);

    if (!inchId || !itemId || !qualityId || !styleId || !colorId) {
      console.error(`Missing IDs for entry: ${JSON.stringify(entry)}`);
      continue;
    }

    const payload = {
      inchId,
      itemId,
      qualityId,
      styleId,
      colorId,
      totalAmount: entry.DonViTinh === 'Pcs' ? Math.round(entry.TongSoLuong) : roundNumber(entry.TongSoLuong),
      unitOfCalculation: entry.DonViTinh,
      priceHigh: roundNumber(entry.GiaCao),
      priceLow: roundNumber(entry.GiaThap),
      sale: roundNumber(entry.GiamGia)
    };

    try {
      const resp = await axios.post(`${API_BASE_URL}/warehouses`, payload, getHeaders());
      console.log(`Success: ${entry.LoaiSanPham} ${entry.Inches}" ${entry.ChatLuong} - ${resp.data.data._id}`);
    } catch (e) {
      console.error(`Error creating warehouse for ${entry.LoaiSanPham} ${entry.Inches}":`, e.response?.data?.message || e.message);
    }
  }
}

importData();
