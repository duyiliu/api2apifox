#!/usr/bin/env bash
# 统一交付的最终验证：清理注入 → 干净重建 → 单测/CLI/类型/skill/覆盖率/C-D4 复现，全部落日志。
set -u
cd "$(dirname "$0")/../.." || exit 1
LOG="work/统一交付/logs/verify"
mkdir -p "$LOG"

echo "[$(date +%H:%M:%S)] 1) clean injected @ts-nocheck"
python "work/统一交付/clean-ts-nocheck.py" | tee "$LOG/00-clean.log"

echo "[$(date +%H:%M:%S)] 2) rebuild out/ from clean sources"
rm -rf out
npm run build:test > "$LOG/01-build.log" 2>&1
echo "build exit=$?"

echo "[$(date +%H:%M:%S)] 3) typecheck (extension) + typecheck:cli"
npm run typecheck > "$LOG/02-typecheck.log" 2>&1; echo "typecheck exit=$?"
npm run typecheck:cli > "$LOG/03-typecheck-cli.log" 2>&1; echo "typecheck:cli exit=$?"

echo "[$(date +%H:%M:%S)] 4) npm test"
npm test > "$LOG/04-npm-test.log" 2>&1; echo "npm test exit=$?"

echo "[$(date +%H:%M:%S)] 5) npm run test:cli"
npm run test:cli > "$LOG/05-test-cli.log" 2>&1; echo "test:cli exit=$?"

echo "[$(date +%H:%M:%S)] 6) npm run test:skill"
npm run test:skill > "$LOG/06-test-skill.log" 2>&1; echo "test:skill exit=$?"

echo "[$(date +%H:%M:%S)] 7) npm run test:coverage"
npm run test:coverage > "$LOG/07-coverage.log" 2>&1; echo "coverage exit=$?"

echo "[$(date +%H:%M:%S)] 8) C-D4 runtime repro"
node scripts/qa-cd4-repro.mjs > "$LOG/08-cd4-repro.log" 2>&1; echo "cd4 repro exit=$?"

echo "[$(date +%H:%M:%S)] 9) summary"
grep -E "^ℹ (tests|pass|fail|skipped)" "$LOG/04-npm-test.log" | tail -4
grep -E "^ℹ (tests|pass|fail|skipped)" "$LOG/05-test-cli.log" | tail -4
grep -E "^ℹ (tests|pass|fail|skipped)" "$LOG/06-test-skill.log" | tail -4
tail -6 "$LOG/07-coverage.log"
cat "$LOG/08-cd4-repro.log"
