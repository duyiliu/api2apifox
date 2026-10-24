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
      onActiveChange?.(true);
      const flight = (async () => task())().finally(() => {
        inFlight = undefined;
        onActiveChange?.(false);
      });
      inFlight = flight;
      return flight;
    },
  };
}
