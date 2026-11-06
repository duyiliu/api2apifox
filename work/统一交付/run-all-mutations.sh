#!/usr/bin/env bash
# 8 文件逐一串行跑 Stryker（inPlace=true，绝不能并发）。单进程驱动,不再用 pgrep 等待。
set -u
cd "$(dirname "$0")/../.." || exit 1
for name in pipeline syncService config builder client jarIndex controllerParser schemaResolver; do
  echo "[$(date +%H:%M:%S)] START $name"
  npx stryker run "work/统一交付/stryker/$name.conf.json" > "work/统一交付/logs/mutation/$name.log" 2>&1
  code=$?
  echo "[$(date +%H:%M:%S)] DONE $name exit=$code"
done
echo "[$(date +%H:%M:%S)] ALL DONE"
