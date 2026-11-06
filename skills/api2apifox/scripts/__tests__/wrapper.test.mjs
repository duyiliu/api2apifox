import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const source = resolve('skills/api2apifox');
function fixture(t) {
 const dir = mkdtempSync(join(tmpdir(), 'api2apifox-skill-'));
 cpSync(source, dir, { recursive: true });
 t.after(() => rmSync(dir, { recursive: true, force: true }));
 return dir;
}
function run(dir, script, ...args) { return spawnSync(process.execPath, [join(dir, 'scripts', script), ...args], { encoding: 'utf8', timeout: 30000 }); }
test('runtime check succeeds repeatedly and wrapper forwards version and bad arguments', t => {
 const d = fixture(t);
 for (let i = 0; i < 2; i++) { const r = run(d, 'check-runtime.mjs'); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /校验通过/); }
 const version = run(d, 'api2apifox.mjs', '--version');
 assert.equal(version.status, 0); assert.equal(version.stdout.trim(), JSON.parse(readFileSync(join(d,'runtime','release.json'))).version);
 const bad = run(d, 'api2apifox.mjs', '--definitely-invalid-option'); assert.notEqual(bad.status, 0);
});
test('integrity failures are reported and restoring runtime recovers', t => {
 const d = fixture(t); const entry = join(d,'runtime','api2apifox.cjs'); const original = readFileSync(entry);
 writeFileSync(entry, Buffer.concat([original, Buffer.from('\n// corruption')]));
 let r = run(d, 'check-runtime.mjs'); assert.equal(r.status, 1); assert.match(r.stderr, /文件校验失败/);
 rmSync(entry); r = run(d, 'check-runtime.mjs'); assert.equal(r.status, 1); assert.match(r.stderr, /缺少运行时文件/);
 writeFileSync(entry, original); r = run(d, 'check-runtime.mjs'); assert.equal(r.status, 0, r.stderr);
});
test('invalid manifest and version mismatch fail closed', t => {
 const d = fixture(t); const p = join(d,'runtime','release.json'); const release = JSON.parse(readFileSync(p));
 writeFileSync(p, '{'); let r = run(d, 'check-runtime.mjs'); assert.equal(r.status, 1); assert.match(r.stderr, /运行时检查失败/);
 writeFileSync(p, JSON.stringify({...release, sha256: {}})); r = run(d, 'check-runtime.mjs'); assert.equal(r.status, 1); assert.match(r.stderr, /缺少 sha256/);
 writeFileSync(p, JSON.stringify({...release, version: '0.0.0-invalid'})); r = run(d, 'check-runtime.mjs'); assert.equal(r.status, 1); assert.match(r.stderr, /不一致/);
});
test('old Node is rejected before starting runtime', t => {
 const d = fixture(t); const preload = join(d, 'old-node.cjs');
 writeFileSync(preload, `Object.defineProperty(process.versions, 'node', { value: '18.20.0' });`);
 const r = spawnSync(process.execPath, ['--require', preload, join(d, 'scripts', 'api2apifox.mjs')], {encoding:'utf8', timeout:30000});
 assert.equal(r.status, 7); assert.match(r.stderr, /Node\.js >= 20/);
});
test('missing runtime exits nonzero', t => {
 const d = fixture(t); rmSync(join(d,'runtime','api2apifox.cjs'));
 const r = run(d, 'api2apifox.mjs', '--version'); assert.notEqual(r.status, 0); assert.match(r.stderr, /MODULE_NOT_FOUND|Cannot find module/);
});
test('spawn error reports launch failure and exits 7', t => {
 const d = fixture(t); const preload = join(d, 'spawn-failure.cjs');
 writeFileSync(preload, `const cp = require('node:child_process'); const {EventEmitter} = require('node:events'); cp.spawn = () => { const child = new EventEmitter(); process.nextTick(() => child.emit('error', new Error('simulated spawn failure'))); return child; }; require('node:module').syncBuiltinESMExports();`);
 const r = spawnSync(process.execPath, ['--require', preload, join(d,'scripts','api2apifox.mjs')], {encoding:'utf8',timeout:30000});
 assert.equal(r.status, 7, r.stderr); assert.match(r.stderr, /运行时启动失败.*simulated spawn failure/);
});
