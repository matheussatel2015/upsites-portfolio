/* Testes da lógica do store.js (Node v18+, runner nativo).
   Rodar:  node --test    (de dentro de projetos/10-imobiliaria) */
const { test } = require('node:test');
const assert = require('node:assert');

// --- shim de ambiente de navegador antes de carregar o store ---
function freshLocalStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    clear: () => m.clear(),
    _map: m,
  };
}

const SEED = [
  { id: 'a', titulo: 'A', finalidade: 'venda', tipo: 'Casa', bairro: 'X', cidade: 'C', preco: 100, condominio: 0, iptu: 0, quartos: 2, suites: 0, banheiros: 1, vagas: 1, area: 50, destaque: false, resumo: 'r', descricao: 'd', caracteristicas: ['q'], fotos: ['fotos/a/1.jpg'] },
  { id: 'b', titulo: 'B', finalidade: 'aluguel', tipo: 'Studio', bairro: 'Y', cidade: 'C', preco: 50, condominio: 0, iptu: 0, quartos: 1, suites: 0, banheiros: 1, vagas: 0, area: 30, destaque: true, resumo: 'r', descricao: 'd', caracteristicas: [], fotos: ['fotos/b/1.jpg'] },
];

function loadStore() {
  delete require.cache[require.resolve('../assets/store.js')];
  global.window = { IMOVEIS: JSON.parse(JSON.stringify(SEED)) };
  global.localStorage = freshLocalStorage();
  return require('../assets/store.js');
}

// ---------- Task 1: lógica pura ----------
test('slugify normaliza acentos, espaços e símbolos', () => {
  const S = loadStore();
  assert.strictEqual(S.slugify('Casa no Batel!'), 'casa-no-batel');
  assert.strictEqual(S.slugify('Cobertura  Água Verde'), 'cobertura-agua-verde');
});

test('ensureUniqueId sufixa quando colide', () => {
  const S = loadStore();
  assert.strictEqual(S.ensureUniqueId('x', ['x', 'x-2']), 'x-3');
  assert.strictEqual(S.ensureUniqueId('novo', ['a', 'b']), 'novo');
});

test('mergeData aplica updated, created e deleted', () => {
  const S = loadStore();
  const overlay = {
    version: 1,
    updated: { a: { ...SEED[0], titulo: 'A editado' } },
    created: [{ ...SEED[0], id: 'c', titulo: 'C novo' }],
    deleted: ['b'],
  };
  const out = S.mergeData(SEED, overlay);
  const ids = out.map((i) => i.id).sort();
  assert.deepStrictEqual(ids, ['a', 'c']); // b removido
  assert.strictEqual(out.find((i) => i.id === 'a').titulo, 'A editado');
  assert.strictEqual(out.find((i) => i.id === 'c').titulo, 'C novo');
});

// ---------- Task 2: serialização / validação / backup ----------
test('serializeImoveisJs gera arquivo reproduzível', () => {
  const S = loadStore();
  const out = S.serializeImoveisJs(SEED);
  assert.ok(out.includes('window.IMOVEIS'));
  // executa o conteúdo gerado e confere que reproduz a lista
  const sandbox = { window: {} };
  const fn = new Function('window', out + '\nreturn window.IMOVEIS;');
  const parsed = fn(sandbox.window);
  assert.strictEqual(parsed.length, SEED.length);
  assert.strictEqual(parsed[0].id, 'a');
});

test('validateImovel rejeita inválidos e aceita válido', () => {
  const S = loadStore();
  const bad = S.validateImovel({ titulo: '', finalidade: 'venda', tipo: 'Casa', bairro: '', preco: -1, fotos: [] }, []);
  assert.strictEqual(bad.ok, false);
  assert.ok(bad.errors.titulo && bad.errors.bairro && bad.errors.preco && bad.errors.fotos);

  const ok = S.validateImovel({ id: 'novo', titulo: 'T', finalidade: 'venda', tipo: 'Casa', bairro: 'B', preco: 10, quartos: 1, suites: 0, banheiros: 1, vagas: 0, area: 10, fotos: ['x'] }, ['a']);
  assert.strictEqual(ok.ok, true);

  const dup = S.validateImovel({ id: 'a', titulo: 'T', finalidade: 'venda', tipo: 'Casa', bairro: 'B', preco: 10, fotos: ['x'] }, ['a']);
  assert.strictEqual(dup.ok, false);
  assert.ok(dup.errors.id);
});

test('validateBackup checa estrutura', () => {
  const S = loadStore();
  assert.strictEqual(S.validateBackup({}), false);
  assert.strictEqual(S.validateBackup({ version: 1, updated: {}, created: [], deleted: [] }), true);
});

// ---------- Task 3: storage + API ----------
test('upsert/getAll/remove/resetOverlay/hasOverlay', () => {
  const S = loadStore();
  assert.strictEqual(S.hasOverlay(), false);
  assert.strictEqual(S.getAll().length, 2);

  S.upsert({ ...SEED[0], id: 'c', titulo: 'C novo' });
  assert.strictEqual(S.getAll().length, 3);
  assert.strictEqual(S.getById('c').titulo, 'C novo');
  assert.strictEqual(S.hasOverlay(), true);

  S.remove('a');
  assert.strictEqual(S.getById('a'), null);
  assert.strictEqual(S.getAll().length, 2); // b, c

  S.resetOverlay();
  assert.strictEqual(S.getAll().length, 2); // a, b
  assert.strictEqual(S.hasOverlay(), false);
});

test('editar item do seed mantém seed intacto e usa updated', () => {
  const S = loadStore();
  S.upsert({ ...SEED[0], titulo: 'A editado' });
  assert.strictEqual(S.getById('a').titulo, 'A editado');
  assert.strictEqual(global.window.IMOVEIS[0].titulo, 'A'); // seed intacto
});

test('usage retorna bytes e pct', () => {
  const S = loadStore();
  S.upsert({ ...SEED[0], id: 'c' });
  const u = S.usage();
  assert.ok(typeof u.bytes === 'number' && u.bytes > 0);
  assert.ok(typeof u.pct === 'number' && u.pct >= 0);
});
