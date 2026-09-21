import { Diagnostic } from "../../../src/core/types";

export interface SuccessEnvelope {
  schemaVersion: 1;
  ok: true;
  command: string;
  version: string;
  durationMs: number;
  result: unknown;
  warnings: string[];
}

export interface FailureEnvelope {
  schemaVersion: 1;
  ok: false;
  command: string;
  version: string;
  durationMs: number;
  error: {
    code: string;
    message: string;
    status?: number;
    retryable: boolean;
    details?: unknown;
  };
  warnings: string[];
}

export function writeJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function writeText(message: string): void {
  process.stdout.write(`${message}\n`);
}

export function diagnosticMessages(diagnostics: Diagnostic[]): string[] {
  return diagnostics.map((item) => `${item.code}: ${item.message}`);
}
