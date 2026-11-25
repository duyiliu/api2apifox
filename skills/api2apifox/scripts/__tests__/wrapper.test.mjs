import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
const source = resolve('skills/api2apifox');
function fixture(t) {
 const dir = mkdtempSync(join(tmpdir(), 'api2apifox-skill-'));
 cpSync(source, dir, { recursive: true });
 t.after(() => rmSync(dir, { recursive: true, force: true }));
 return dir;
}
function run(dir, script, args, env) { return spawnSync(process.execPath, [join(dir, 'scripts', script), ...args], { encoding: 'utf8', timeout: 30000, env: { ...process.env, ...env } }); }
// 异步版本:spawnSync 会阻塞测试进程事件循环导致本地 server 饿死,涉及下载的测试必须用它
function runAsync(dir, script, args, env) {
 return new Promise((resolvePromise) => {
 const child = spawn(process.execPath, [join(dir, 'scripts', script), ...args], { env: { ...process.env, ...env } });
 let stdout = '', stderr = '';
 child.stdout.on('data', (c) => { stdout += c; });
 child.stderr.on('data', (c) => { stderr += c; });
 child.on('exit', (status) => resolvePromise({ status, stdout, stderr }));
 });
}
// 本地 HTTP server 充当运行时下载源,测试不打真实 GitHub
function serveRuntime(t, bytes) {
 const server = createServer((req, res) => { res.writeHead(200, { 'content-type': 'application/octet-stream' }); res.end(bytes); });
 return new Promise((resolvePromise) => {
 server.listen(0, '127.0.0.1', () => {
 t.after(() => server.close());
 resolvePromise(`http://127.0.0.1:${server.address().port}/runtime.cjs`);
 });
 });
}
test('runtime check succeeds repeatedly and wrapper forwards version and bad arguments', t => {
 const d = fixture(t);
 for (let i = 0; i < 2; i++) { const r = run(d, 'check-runtime.mjs', []); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /校验通过/); }
 const version = run(d, 'api2apifox.mjs', ['--version']);
 assert.equal(version.status, 0); assert.equal(version.stdout.trim(), JSON.parse(readFileSync(join(d,'runtime','release.json'))).version);
 const bad = run(d, 'api2apifox.mjs', ['--definitely-invalid-option']); assert.notEqual(bad.status, 0);
});
test('corrupted runtime self-heals via download and recovers', async t => {
 const d = fixture(t); const entry = join(d,'runtime','api2apifox.cjs'); const original = readFileSync(entry);
 const url = await serveRuntime(t, original);
 writeFileSync(entry, Buffer.concat([original, Buffer.from('\n// corruption')]));
 // 哈希不一致 → 重新下载自愈
 let r = await runAsync(d, 'check-runtime.mjs', [], { API2APIFOX_RUNTIME_URL: url });
 assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /校验通过/);
 assert.equal(readFileSync(entry).length, original.length);
 // 删除后同样可恢复
 rmSync(entry); r = await runAsync(d, 'api2apifox.mjs', ['--version'], { API2APIFOX_RUNTIME_URL: url });
 assert.equal(r.status, 0, r.stderr);
});
test('hash mismatch of downloaded bytes is rejected closed', async t => {
 const d = fixture(t); const entry = join(d,'runtime','api2apifox.cjs'); rmSync(entry);
 const url = await serveRuntime(t, Buffer.from('wrong-bytes'));
 const r = await runAsync(d, 'check-runtime.mjs', [], { API2APIFOX_RUNTIME_URL: url });
 assert.equal(r.status, 1); assert.match(r.stderr, /哈希不一致/);
 assert.equal(existsSync(entry), false, '错误字节不得写入缓存');
});
test('unreachable download source reports actionable error', t => {
 const d = fixture(t); rmSync(join(d,'runtime','api2apifox.cjs'));
 // 指向一个必然不可达的端口
 const r = run(d, 'check-runtime.mjs', [], { API2APIFOX_RUNTIME_URL: 'http://127.0.0.1:1/runtime.cjs' });
 assert.equal(r.status, 1); assert.match(r.stderr, /下载失败|运行时检查失败/);
});
test('invalid manifest and version mismatch fail closed', t => {
 const d = fixture(t); const p = join(d,'runtime','release.json'); const release = JSON.parse(readFileSync(p));
 writeFileSync(p, '{'); let r = run(d, 'check-runtime.mjs', []); assert.equal(r.status, 1); assert.match(r.stderr, /运行时检查失败/);
 writeFileSync(p, JSON.stringify({...release, sha256: {}})); r = run(d, 'check-runtime.mjs', []); assert.equal(r.status, 1); assert.match(r.stderr, /sha256/);
 writeFileSync(p, JSON.stringify({...release, version: '0.0.0-invalid'})); r = run(d, 'check-runtime.mjs', []); assert.equal(r.status, 1); assert.match(r.stderr, /不一致/);
});
test('old Node is rejected before starting runtime', t => {
 const d = fixture(t); const preload = join(d, 'old-node.cjs');
 writeFileSync(preload, `Object.defineProperty(process.versions, 'node', { value: '18.20.0' });`);
 const r = spawnSync(process.execPath, ['--require', preload, join(d, 'scripts', 'api2apifox.mjs')], {encoding:'utf8', timeout:30000});
 assert.equal(r.status, 7); assert.match(r.stderr, /Node\.js >= 20/);
});
test('spawn error reports launch failure and exits 7', t => {
 const d = fixture(t); const preload = join(d, 'spawn-failure.cjs');
 writeFileSync(preload, `const cp = require('node:child_process'); const {EventEmitter} = require('node:events'); cp.spawn = () => { const child = new EventEmitter(); process.nextTick(() => child.emit('error', new Error('simulated spawn failure'))); return child; }; require('node:module').syncBuiltinESMExports();`);
 const r = spawnSync(process.execPath, ['--require', preload, join(d,'scripts','api2apifox.mjs')], {encoding:'utf8',timeout:30000});
 assert.equal(r.status, 7, r.stderr); assert.match(r.stderr, /运行时启动失败.*simulated spawn failure/);
});
