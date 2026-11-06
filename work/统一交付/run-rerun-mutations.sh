#!/usr/bin/env bash
# 补测落地后重跑受影响的 2 个变异目标（pipeline: pipelineCacheOverloads；jarIndex: jarDiscovery/jarDependencyResolution）。
# 串行、单进程，绝不并发（inPlace=true）。
set -u
cd "$(dirname "$0")/../.." || exit 1
mkdir -p "work/统一交付/logs/mutation-rerun"
for name in pipeline jarIndex; do
  echo "[$(date +%H:%M:%S)] START $name" >> "work/统一交付/logs/mutation-rerun/_driver.log"
  npx stryker run "work/统一交付/stryker/$name.conf.json" > "work/统一交付/logs/mutation-rerun/$name.log" 2>&1
  code=$?
  echo "[$(date +%H:%M:%S)] DONE $name exit=$code" >> "work/统一交付/logs/mutation-rerun/_driver.log"
done
echo "[$(date +%H:%M:%S)] ALL DONE" >> "work/统一交付/logs/mutation-rerun/_driver.log"
