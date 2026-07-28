/**
 * Smoke test da T-3.1 (rode com: pnpm --filter @findash/domain smoke).
 *
 * Node não tem localStorage; este shim implementa a mesma interface com
 * write-through para um arquivo JSON — o que permite simular o "reload"
 * (novo shim lendo o mesmo arquivo = nova aba lendo o mesmo storage).
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BACKING_FILE = join(tmpdir(), 'findash-domain-smoke.json');

class FileBackedLocalStorage {
  private data: Record<string, string>;

  constructor(private file: string) {
    this.data = existsSync(file)
      ? (JSON.parse(readFileSync(file, 'utf8')) as Record<string, string>)
      : {};
  }

  getItem(key: string): string | null {
    return key in this.data ? this.data[key] : null;
  }

  setItem(key: string, value: string): void {
    this.data = { ...this.data, [key]: value };
    writeFileSync(this.file, JSON.stringify(this.data));
  }

  removeItem(key: string): void {
    const { [key]: _removed, ...rest } = this.data;
    this.data = rest;
    writeFileSync(this.file, JSON.stringify(this.data));
  }
}

rmSync(BACKING_FILE, { force: true }); // começa limpo
globalThis.localStorage = new FileBackedLocalStorage(BACKING_FILE) as unknown as Storage;

// Import dinâmico DEPOIS do shim: os repositórios encontram o "localStorage".
const { transactionRepository, goalRepository, formatCents } = await import('../src/index');

// ---- CRUD de transações -----------------------------------------------
const tx = await transactionRepository.add({
  type: 'expense',
  amountCents: 4990,
  category: 'food',
  description: 'Pizza',
  date: '2026-07-28',
});
assert.equal((await transactionRepository.list()).length, 1, 'add deve persistir');

const updated = await transactionRepository.update(tx.id, { amountCents: 5990 });
assert.equal(updated.amountCents, 5990, 'update deve aplicar o patch');
assert.equal(updated.id, tx.id, 'update não pode trocar o id');

await assert.rejects(
  transactionRepository.update('id-inexistente', {}),
  /não encontrada/,
  'update de id inexistente deve falhar explicitamente',
);

// ---- Metas + aporte -----------------------------------------------------
const goal = await goalRepository.add({ name: 'Reserva', targetCents: 100000, color: 'emerald' });
assert.equal(goal.savedCents, 0, 'meta nasce zerada');
await goalRepository.addContribution(goal.id, 25000);
const [goalAfter] = await goalRepository.list();
assert.equal(goalAfter.savedCents, 25000, 'aporte deve somar');
await assert.rejects(goalRepository.addContribution(goal.id, -5), /inválido/);

// ---- Formatação na borda -------------------------------------------------
assert.match(formatCents(123456), /1\.234,56/, 'formatCents deve formatar pt-BR');

// ---- "Reload": novo shim lendo o mesmo arquivo ---------------------------
globalThis.localStorage = new FileBackedLocalStorage(BACKING_FILE) as unknown as Storage;
const afterReload = await transactionRepository.list();
assert.equal(afterReload.length, 1, 'dados devem sobreviver ao reload');
assert.equal(afterReload[0].amountCents, 5990);

// ---- Validação leve descarta dado corrompido sem quebrar -----------------
localStorage.setItem('findash:transactions', '{corrompido!!!');
assert.deepEqual(await transactionRepository.list(), [], 'corrompido → lista vazia, sem throw');

// ---- remove ---------------------------------------------------------------
await goalRepository.remove(goal.id);
assert.equal((await goalRepository.list()).length, 0, 'remove deve excluir');

rmSync(BACKING_FILE, { force: true });
console.log('✅ SMOKE OK — CRUD, aporte, formatação, reload e leitura defensiva');
