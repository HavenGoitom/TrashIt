const B = 'http://localhost:5000';

async function register(email, pass) {
  const r = await fetch(`${B}/api/auth/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username: email.replace(/[^a-zA-Z0-9]/g,'_'), name: email.split('@')[0], email, password: pass})
  });
  return {ok: r.ok, status: r.status, data: await r.json()};
}

async function login(email, pass) {
  const r = await fetch(`${B}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email, password: pass})
  });
  return await r.json();
}

async function createPost(token, type, title) {
  const r = await fetch(`${B}/api/posts`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', 'Authorization': `Bearer ${token}`},
    body: JSON.stringify({title, type, price: {fixed: 10}, quantity: {fixed: 1}, location: 'TestCity'})
  });
  return {ok: r.ok, status: r.status, data: await r.json()};
}

async function getMatches(token) {
  const r = await fetch(`${B}/api/matches`, {headers: {'Authorization': `Bearer ${token}`}});
  const d = await r.json();
  return {count: d.count, matches: d.matches || []};
}

const pass = 'Hg12345678@';
const results = [];
await new Promise(r => setTimeout(r, 500));

// Test 1: Buy wine <-> Sell wine
console.log('\n=== Test 1: Buy wine <-> Sell wine ===');
await register('t1buyer@test.com', pass); await register('t1seller@test.com', pass);
const t1buyer = await login('t1buyer@test.com', pass);
const t1seller = await login('t1seller@test.com', pass);
await createPost(t1seller.token, 'sell', 'wine');
await new Promise(r => setTimeout(r, 1000));
await createPost(t1buyer.token, 'buy', 'wine');
let m = await getMatches(t1buyer.token);
console.log('Buyer matches:', m.count);
results.push(['1: Buy wine <-> Sell wine', m.count >= 1 ? 'PASS' : 'FAIL']);

// Test 2: Buy wine bottle <-> Sell wine
console.log('\n=== Test 2: Buy wine bottle <-> Sell wine ===');
await register('t2buyer@test.com', pass); await register('t2seller@test.com', pass);
const t2buyer = await login('t2buyer@test.com', pass);
const t2seller = await login('t2seller@test.com', pass);
await createPost(t2seller.token, 'sell', 'wine');
await new Promise(r => setTimeout(r, 1000));
await createPost(t2buyer.token, 'buy', 'wine bottle');
m = await getMatches(t2buyer.token);
console.log('Buyer matches:', m.count);
results.push(['2: Buy wine bottle <-> Sell wine', m.count >= 1 ? 'PASS' : 'FAIL']);

// Test 3: Buy wine <-> Sell wine bottle
console.log('\n=== Test 3: Buy wine <-> Sell wine bottle ===');
await register('t3buyer@test.com', pass); await register('t3seller@test.com', pass);
const t3buyer = await login('t3buyer@test.com', pass);
const t3seller = await login('t3seller@test.com', pass);
await createPost(t3seller.token, 'sell', 'wine bottle');
await new Promise(r => setTimeout(r, 1000));
await createPost(t3buyer.token, 'buy', 'wine');
m = await getMatches(t3buyer.token);
console.log('Buyer matches:', m.count);
results.push(['3: Buy wine <-> Sell wine bottle', m.count >= 1 ? 'PASS' : 'FAIL']);

// Test 4: Buy red wine <-> Sell wine
console.log('\n=== Test 4: Buy red wine <-> Sell wine ===');
await register('t4buyer@test.com', pass); await register('t4seller@test.com', pass);
const t4buyer = await login('t4buyer@test.com', pass);
const t4seller = await login('t4seller@test.com', pass);
await createPost(t4seller.token, 'sell', 'wine');
await new Promise(r => setTimeout(r, 1000));
await createPost(t4buyer.token, 'buy', 'red wine');
m = await getMatches(t4buyer.token);
console.log('Buyer matches:', m.count);
results.push(['4: Buy red wine <-> Sell wine', m.count >= 1 ? 'PASS' : 'FAIL']);

// Test 5: Buy wine bottle <-> Sell red wine bottle
console.log('\n=== Test 5: Buy wine bottle <-> Sell red wine bottle ===');
await register('t5buyer@test.com', pass); await register('t5seller@test.com', pass);
const t5buyer = await login('t5buyer@test.com', pass);
const t5seller = await login('t5seller@test.com', pass);
await createPost(t5seller.token, 'sell', 'red wine bottle');
await new Promise(r => setTimeout(r, 1000));
await createPost(t5buyer.token, 'buy', 'wine bottle');
m = await getMatches(t5buyer.token);
console.log('Buyer matches:', m.count);
results.push(['5: Buy wine bottle <-> Sell red wine bottle', m.count >= 1 ? 'PASS' : 'FAIL']);

// Test 6: Unrelated items should NOT match
console.log('\n=== Test 6: Unrelated items should NOT match ===');
await register('t6buyer@test.com', pass); await register('t6seller@test.com', pass);
const t6buyer = await login('t6buyer@test.com', pass);
const t6seller = await login('t6seller@test.com', pass);
await createPost(t6seller.token, 'sell', 'old furniture');
await new Promise(r => setTimeout(r, 1000));
await createPost(t6buyer.token, 'buy', 'electronics');
m = await getMatches(t6buyer.token);
console.log('Buyer matches (should be 0):', m.count);
results.push(['6: Unrelated should NOT match', m.count === 0 ? 'PASS' : 'FAIL']);

// Test 7: Buy <-> Buy should NOT match
console.log('\n=== Test 7: Buy <-> Buy should NOT match ===');
await register('t7a@test.com', pass); await register('t7b@test.com', pass);
const t7a = await login('t7a@test.com', pass);
const t7b = await login('t7b@test.com', pass);
await createPost(t7a.token, 'buy', 'wine');
await new Promise(r => setTimeout(r, 1000));
await createPost(t7b.token, 'buy', 'wine bottle');
m = await getMatches(t7a.token);
console.log('Buyer A matches (should be 0):', m.count);
results.push(['7: Buy <-> Buy should NOT match', m.count === 0 ? 'PASS' : 'FAIL']);

// Test 8: Sell <-> Sell should NOT match
console.log('\n=== Test 8: Sell <-> Sell should NOT match ===');
await register('t8a@test.com', pass); await register('t8b@test.com', pass);
const t8a = await login('t8a@test.com', pass);
const t8b = await login('t8b@test.com', pass);
await createPost(t8a.token, 'sell', 'wine');
await new Promise(r => setTimeout(r, 1000));
await createPost(t8b.token, 'sell', 'wine bottle');
m = await getMatches(t8a.token);
console.log('Seller A matches (should be 0):', m.count);
results.push(['8: Sell <-> Sell should NOT match', m.count === 0 ? 'PASS' : 'FAIL']);

// Test 10: Capitalization and spacing differences
console.log('\n=== Test 10: Capitalization and spacing ===');
await register('t10buyer@test.com', pass); await register('t10seller@test.com', pass);
const t10buyer = await login('t10buyer@test.com', pass);
const t10seller = await login('t10seller@test.com', pass);
await createPost(t10seller.token, 'sell', 'WINE');
await new Promise(r => setTimeout(r, 1000));
await createPost(t10buyer.token, 'buy', '  Wine  ');
m = await getMatches(t10buyer.token);
console.log('Buyer matches:', m.count);
results.push(['10: Capitalization and spacing', m.count >= 1 ? 'PASS' : 'FAIL']);

// Summary
console.log('\n========== RESULTS ==========');
let passes = 0;
for (const [name, status] of results) {
  console.log(`[${status}] ${name}`);
  if (status === 'PASS') passes++;
}
console.log(`\n${passes}/${results.length} tests passed`);


