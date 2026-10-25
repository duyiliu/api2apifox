/**
 * 保存 Java 文件后自动同步 Apifox 的调度逻辑。
 *
 * 这里不依赖 vscode,便于在 node 单测中验证防抖、抑制与串行行为:
 *  - `off`:不调度;
 *  - `file`:保存防抖后同步该文件中的接口;
 *  - `checked`:保存防抖后同步接口列表中当前勾选的接口;
 *  - 手动/大范围同步进行中时直接跳过,避免并发写 Apifox。
 */

export type AutoSyncMode = "off" | "file" | "checked";

/** 一次自动同步请求;`action` 即生效的 autoSync 模式 */
export interface AutoSyncRequest {
  action: Exclude<AutoSyncMode, "off">;
  /** 最近一次保存的 Java 文件路径(`checked` 模式仅用于日志) */
  fsPath: string;
}

/** 配置值归一化:历史/手写配置中的非法值一律按关闭处理 */
export function normalizeAutoSyncMode(value: unknown): AutoSyncMode {
  return value === "file" || value === "checked" ? value : "off";
}

export interface AutoSyncTimers {
  setTimeout(handler: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

const DEFAULT_TIMERS: AutoSyncTimers = {
  setTimeout: (handler, ms) => setTimeout(handler, ms),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export interface AutoSyncSchedulerOptions {
  /** 防抖时长(默认 800ms,与接口树保存刷新一致) */
  debounceMs?: number;
  /** 每次保存时重新读取配置,设置变更后无需重建调度器 */
  getMode: () => AutoSyncMode;
  /** 是否有手动/大范围同步正在执行;为 true 时抑制自动同步 */
  isBusy: () => boolean;
  /** 执行同步;抛错表示失败,由 onError 弱提示,不影响后续保存 */
  run: (request: AutoSyncRequest) => void | Promise<void>;
  /** 同步失败回调(错误详情由调用方写入输出面板) */
  onError?: (error: unknown, request: AutoSyncRequest) => void;
  /** 测试可注入的定时器 */
  timers?: AutoSyncTimers;
}

/**
 * 保存触发的自动同步调度器。
 *
 * 多次保存通过防抖合并为一次;自动同步自身串行执行,执行期间的新保存只保留
 * 最后一次,待当前同步结束后再补一次,避免同一时间并发写 Apifox。
 */
export class AutoSyncScheduler {
  private readonly debounceMs: number;
  private readonly timers: AutoSyncTimers;
  private timer: unknown;
  private running = false;
  private pendingFsPath: string | undefined;

  constructor(private readonly options: AutoSyncSchedulerOptions) {
    this.debounceMs = options.debounceMs ?? 800;
    this.timers = options.timers ?? DEFAULT_TIMERS;
  }

  /** Java 文件保存后调用;非 Java 文件忽略 */
  noteSave(fsPath: string, languageId = "java"): void {
    if (languageId !== "java") {
      return;
    }
    if (normalizeAutoSyncMode(this.options.getMode()) === "off") {
      return;
    }
    // 大范围同步进行中直接丢弃本次保存,避免用户在同步结束后被动触发上传
    if (this.options.isBusy()) {
      return;
    }
    if (this.timer !== undefined) {
      this.timers.clearTimeout(this.timer);
    }
    this.timer = this.timers.setTimeout(() => {
      this.timer = undefined;
      this.dispatch(fsPath);
    }, this.debounceMs);
  }

  dispose(): void {
    if (this.timer !== undefined) {
      this.timers.clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.pendingFsPath = undefined;
  }

  private dispatch(fsPath: string): void {
    if (this.running) {
      this.pendingFsPath = fsPath;
      return;
    }
    // 防抖窗口内可能已开始手动同步或关闭自动同步,执行前再判断一次
    if (this.options.isBusy()) {
      return;
    }
    const mode = normalizeAutoSyncMode(this.options.getMode());
    if (mode === "off") {
      return;
    }
    const request: AutoSyncRequest = { action: mode, fsPath };
    this.running = true;
    Promise.resolve()
      .then(() => this.options.run(request))
      .catch((error) => {
        this.options.onError?.(error, request);
      })
      .finally(() => {
        this.running = false;
        const pending = this.pendingFsPath;
        this.pendingFsPath = undefined;
        if (pending !== undefined) {
          this.dispatch(pending);
        }
      });
  }
}
