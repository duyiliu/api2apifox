export interface SyncPreflightInput {
  teamName: string;
  projectName: string;
  projectId: number;
  scopeLabel: string;
  endpointCount: number;
  endpointConflictBehavior: string;
  schemaConflictBehavior: string;
  visibleChecked?: number;
  hiddenChecked?: number;
}

const CONFLICT_LABELS: Record<string, string> = {
  OVERWRITE_EXISTING: "覆盖已有内容",
  AUTO_MERGE: "自动合并",
  KEEP_EXISTING: "保留已有内容（跳过冲突）",
  CREATE_NEW: "创建新内容",
};

export function conflictBehaviorLabel(value: string): string {
  return CONFLICT_LABELS[value] ?? value;
}

/** 目标项目展示名：团队 / 项目（ID: x），同步确认与同步结果共用同一口径。 */
export function syncTargetLabel(teamName: string, projectName: string, projectId: number): string {
  const targetName = projectName || `项目 ${projectId}`;
  const target = teamName ? `${teamName} / ${targetName}` : targetName;
  return `${target}（ID: ${projectId}）`;
}

/** 构建批量同步确认框的可读详情，集中保证目标、范围和覆盖策略不会被遗漏。 */
export function buildSyncPreflightDetail(input: SyncPreflightInput): string {
  const target = syncTargetLabel(input.teamName, input.projectName, input.projectId);
  const lines = [
    `目标：${target}`,
    `范围：${input.scopeLabel}，共 ${input.endpointCount} 个接口`,
  ];

  if (input.visibleChecked !== undefined || input.hiddenChecked !== undefined) {
    lines.push(`选择：当前可见 ${input.visibleChecked ?? 0} 个，过滤隐藏 ${input.hiddenChecked ?? 0} 个`);
  }

  lines.push(
    `接口冲突：${conflictBehaviorLabel(input.endpointConflictBehavior)}`,
    `模型冲突：${conflictBehaviorLabel(input.schemaConflictBehavior)}`
  );
  return lines.join("\n");
}
