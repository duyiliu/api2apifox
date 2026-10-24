/**
 * 串行化同一资源的异步操作:已有任务执行时,后续调用复用同一个 in-flight promise,
 * 不再启动第二次执行(single-flight)。用于 Apifox 同步等不可并发重入的流程。
 */
export interface SingleFlight<T> {
  /**
   * 执行任务;并发调用返回同一个 promise。
   * @param onBusy 已有任务执行时的回调(用于提示/禁用入口),不会启动新任务
   */
  run(task: () => Promise<T>, onBusy?: () => void): Promise<T>;
  /** 是否有任务正在执行 */
  isRunning(): boolean;
}

export function createSingleFlight<T>(onActiveChange?: (active: boolean) => void): SingleFlight<T> {
  let inFlight: Promise<T> | undefined;
  return {
    isRunning: () => inFlight !== undefined,
    run(task, onBusy) {
      if (inFlight) {
        onBusy?.();
        return inFlight;
      }
      // 先登记 in-flight promise,再同步启动 task:
      // task 若在返回 Promise 前重入 run(),必须看到并复用当前 flight。
      let resolveFlight!: (value: T | PromiseLike<T>) => void;
      let rejectFlight!: (reason?: unknown) => void;
      const flight = new Promise<T>((resolve, reject) => {
        resolveFlight = resolve;
        rejectFlight = reject;
      });
      inFlight = flight;
      onActiveChange?.(true);
      (async () => task())().then(
        (value) => {
          inFlight = undefined;
          onActiveChange?.(false);
          resolveFlight(value);
        },
        (reason) => {
          inFlight = undefined;
          onActiveChange?.(false);
          rejectFlight(reason);
        }
      );
      return flight;
    },
  };
}
