import assert from "node:assert/strict";
import { test } from "node:test";
import { createSingleFlight } from "../core/singleFlight";

test("single-flight:并发调用只执行一次任务,复用同一个 promise", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let starts = 0;
  let busy = 0;
  const activeChanges: boolean[] = [];
  const flight = createSingleFlight<void>((active) => activeChanges.push(active));

  const task = async () => {
    starts += 1;
    await gate;
  };
  const first = flight.run(task);
  const second = flight.run(task, () => {
    busy += 1;
  });
  assert.equal(first, second, "并发调用必须复用同一个 in-flight promise");
  assert.equal(starts, 1, "任务只应启动一次");
  assert.equal(flight.isRunning(), true);
  assert.equal(busy, 1, "忙时回调应触发");

  release();
  await Promise.all([first, second]);
  assert.equal(flight.isRunning(), false);
  assert.deepEqual(activeChanges, [true, false], "上下文键应在开始/结束时各切换一次");

  await flight.run(async () => {
    starts += 1;
  });
  assert.equal(starts, 2, "前一次完成后应允许再次同步");
  assert.deepEqual(activeChanges, [true, false, true, false]);
});

test("single-flight:任务拒绝后释放状态,不会永久锁死", async () => {
  const flight = createSingleFlight<void>();
  await assert.rejects(
    flight.run(async () => {
      throw new Error("boom");
    }),
    /boom/
  );
  assert.equal(flight.isRunning(), false);
  await flight.run(async () => undefined);
  assert.equal(flight.isRunning(), false);
});

test("single-flight:多个同步命令入口共享同一 in-flight,忙时逐个反馈", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let starts = 0;
  const busyEntries: string[] = [];
  const flight = createSingleFlight<void>();

  // 模拟工作区/文件/勾选/目录/单接口/CodeLens 六个入口共用同一实例
  const entries = ["workspace", "file", "checked", "folder", "endpoint", "codelens"];
  const pending = entries.map((name) =>
    flight.run(
      async () => {
        starts += 1;
        await gate;
      },
      () => busyEntries.push(name)
    )
  );
  assert.equal(starts, 1, "各入口并发触发时只允许一次实际同步");
  assert.equal(new Set(pending).size, 1, "所有入口应复用同一个 promise");
  assert.deepEqual(busyEntries, entries.slice(1), "其余入口应收到忙反馈");

  release();
  await Promise.all(pending);
  assert.equal(flight.isRunning(), false);
  await flight.run(async () => {
    starts += 1;
  });
  assert.equal(starts, 2, "前一次完成后应允许新的同步");
});

test("single-flight:任意 rejection 值(含非 Error)都释放状态", async () => {
  for (const reason of ["string failure", 42, { code: "E_CUSTOM" }, undefined]) {
    const flight = createSingleFlight<void>();
    await assert.rejects(
      flight.run(async () => {
        throw reason;
      })
    );
    assert.equal(flight.isRunning(), false, `rejection=${String(reason)} 后应释放`);
    let ran = false;
    await flight.run(async () => {
      ran = true;
    });
    assert.equal(ran, true, "释放后应可再次执行");
  }
});

test("single-flight:任务在返回 Promise 前同步重入也不会启动第二次", async () => {
  let starts = 0;
  let reentered: Promise<void> | undefined;
  let busy = 0;
  const flight = createSingleFlight<void>();
  const outer = flight.run(async () => {
    starts += 1;
    // 同步重入:此时 task 尚未返回 Promise
    reentered = flight.run(
      async () => {
        starts += 1;
      },
      () => {
        busy += 1;
      }
    );
  });
  assert.equal(starts, 1, "重入不应启动第二个任务");
  assert.equal(busy, 1, "重入应命中忙分支");
  assert.ok(reentered, "重入应拿到 in-flight promise");
  assert.equal(reentered, outer, "重入必须复用同一个 promise");
  await outer;
  assert.equal(starts, 1);
  assert.equal(flight.isRunning(), false);
});
