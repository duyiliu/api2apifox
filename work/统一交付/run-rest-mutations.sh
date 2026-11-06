#!/usr/bin/env bash
# 顺序跑剩余 7 个文件的 Stryker（pipeline 由前一步单独启动）。inPlace=true，必须串行。
set -u
cd "$(dirname "$0")/../.."
for name in syncService config builder client jarIndex controllerParser schemaResolver; do
  echo "[$(date +%H:%M:%S)] START $name"
  npx stryker run "work/统一交付/stryker/$name.conf.json" > "work/统一交付/logs/mutation/$name.log" 2>&1
  echo "[$(date +%H:%M:%S)] DONE $name exit=$?"
done
echo "[$(date +%H:%M:%S)] ALL DONE"
