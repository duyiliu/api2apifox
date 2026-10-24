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
