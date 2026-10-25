import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  AutoSyncRequest,
  AutoSyncScheduler,
  AutoSyncTimers,
  normalizeAutoSyncMode,
} from "../ui/autoSync";

/** 手动推进的定时器,避免测试依赖真实等待时间 */
class FakeTimers implements AutoSyncTimers {
  private handlers = new Map<number, () => void>();
  private nextId = 1;

  setTimeout(handler: () => void): unknown {
    const id = this.nextId++;
    this.handlers.set(id, handler);
    return id;
  }

  clearTimeout(handle: unknown): void {
    this.handlers.delete(handle as number);
  }

  tick(): void {
    const pending = [...this.handlers.values()];
    this.handlers.clear();
    for (const handler of pending) {
      handler();
    }
  }

  get size(): number {
    return this.handlers.size;
  }
}

const flush = async (): Promise<void> => {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
};

test("autoSync 配置值归一化:非法值回退 off", () => {
  assert.equal(normalizeAutoSyncMode("off"), "off");
  assert.equal(normalizeAutoSyncMode("file"), "file");
  assert.equal(normalizeAutoSyncMode("checked"), "checked");
  assert.equal(normalizeAutoSyncMode("on"), "off");
  assert.equal(normalizeAutoSyncMode(undefined), "off");
});

test("package.json 暴露 autoSync 配置且默认 off", () => {
  const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8")) as {
    contributes: { configuration: { properties: Record<string, { default?: unknown; enum?: unknown[] }> } };
  };
  const prop = pkg.contributes.configuration.properties["apifoxHelper.autoSync"];
  assert.ok(prop, "缺少 apifoxHelper.autoSync 配置");
  assert.equal(prop.default, "off");
  assert.deepEqual(prop.enum, ["off", "file", "checked"]);
});

test("off 模式保存后不调度", async () => {
  const timers = new FakeTimers();
  const calls: AutoSyncRequest[] = [];
  const scheduler = new AutoSyncScheduler({
    getMode: () => "off",
    isBusy: () => false,
    run: (request) => {
      calls.push(request);
    },
    timers,
  });
  scheduler.noteSave("/src/UserController.java");
  assert.equal(timers.size, 0);
  timers.tick();
  await flush();
  assert.deepEqual(calls, []);
});

test("file 模式防抖合并多次保存,只同步最后一次保存的文件", async () => {
  const timers = new FakeTimers();
  const calls: AutoSyncRequest[] = [];
  const scheduler = new AutoSyncScheduler({
    getMode: () => "file",
    isBusy: () => false,
    run: (request) => {
      calls.push(request);
    },
    timers,
  });
  scheduler.noteSave("/src/A.java");
  scheduler.noteSave("/src/B.java");
  assert.equal(timers.size, 1);
  timers.tick();
  await flush();
  assert.deepEqual(calls, [{ action: "file", fsPath: "/src/B.java" }]);
});

test("checked 模式保存后同步当前勾选集", async () => {
  const timers = new FakeTimers();
  const calls: AutoSyncRequest[] = [];
  const scheduler = new AutoSyncScheduler({
    getMode: () => "checked",
    isBusy: () => false,
    run: (request) => {
      calls.push(request);
    },
    timers,
  });
  scheduler.noteSave("/src/UserController.java");
  timers.tick();
  await flush();
  assert.deepEqual(calls, [{ action: "checked", fsPath: "/src/UserController.java" }]);
});

test("非 Java 文件保存不触发自动同步", async () => {
  const timers = new FakeTimers();
  const calls: AutoSyncRequest[] = [];
  const scheduler = new AutoSyncScheduler({
    getMode: () => "file",
    isBusy: () => false,
    run: (request) => {
      calls.push(request);
    },
    timers,
  });
  scheduler.noteSave("/src/application.yml", "yaml");
  timers.tick();
  await flush();
  assert.deepEqual(calls, []);
});

test("大范围同步进行中抑制自动同步:保存时已忙", async () => {
  const timers = new FakeTimers();
  const calls: AutoSyncRequest[] = [];
  const scheduler = new AutoSyncScheduler({
    getMode: () => "file",
    isBusy: () => true,
    run: (request) => {
      calls.push(request);
    },
    timers,
  });
  scheduler.noteSave("/src/A.java");
  assert.equal(timers.size, 0);
  timers.tick();
  await flush();
  assert.deepEqual(calls, []);
});

test("大范围同步进行中抑制自动同步:防抖结束后才变忙", async () => {
  const timers = new FakeTimers();
  const calls: AutoSyncRequest[] = [];
  let busy = false;
  const scheduler = new AutoSyncScheduler({
    getMode: () => "file",
    isBusy: () => busy,
    run: (request) => {
      calls.push(request);
    },
    timers,
  });
  scheduler.noteSave("/src/A.java");
  busy = true;
  timers.tick();
  await flush();
  assert.deepEqual(calls, []);
});

test("自动同步串行执行:执行中的多次保存只补最后一次", async () => {
  const timers = new FakeTimers();
  const calls: AutoSyncRequest[] = [];
  let releaseFirst: (() => void) | undefined;
  const scheduler = new AutoSyncScheduler({
    getMode: () => "file",
    isBusy: () => false,
    run: (request) => {
      calls.push(request);
      if (calls.length === 1) {
        return new Promise<void>((resolve) => {
          releaseFirst = resolve;
        });
      }
      return undefined;
    },
    timers,
  });
  scheduler.noteSave("/src/A.java");
  timers.tick();
  await flush();
  assert.equal(calls.length, 1);

  scheduler.noteSave("/src/B.java");
  timers.tick();
  scheduler.noteSave("/src/C.java");
  timers.tick();
  await flush();
  assert.equal(calls.length, 1, "同步执行期间不应并发上传");

  releaseFirst?.();
  await flush();
  assert.deepEqual(calls.map((c) => c.fsPath), ["/src/A.java", "/src/C.java"]);
});

test("同步失败走 onError 且不阻塞后续保存", async () => {
  const timers = new FakeTimers();
  const calls: AutoSyncRequest[] = [];
  const errors: string[] = [];
  let failNext = true;
  const scheduler = new AutoSyncScheduler({
    getMode: () => "file",
    isBusy: () => false,
    run: (request) => {
      calls.push(request);
      if (failNext) {
        failNext = false;
        throw new Error("network down");
      }
    },
    onError: (error) => {
      errors.push((error as Error).message);
    },
    timers,
  });
  scheduler.noteSave("/src/A.java");
  timers.tick();
  await flush();
  assert.deepEqual(errors, ["network down"]);

  scheduler.noteSave("/src/B.java");
  timers.tick();
  await flush();
  assert.deepEqual(calls.map((c) => c.fsPath), ["/src/A.java", "/src/B.java"]);
  assert.deepEqual(errors, ["network down"]);
});
