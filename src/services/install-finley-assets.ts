import path from "node:path";
import { copyDirectoryIfMissing, fileExists, readTextFile, templateDirectory, writeTextFile } from "../platform/package-files.js";
import { consoleUi } from "../presentation/console.js";
import pc from "picocolors";

const MARKER_START = "<!-- FINLEY:START -->";
const MARKER_END = "<!-- FINLEY:END -->";

export interface AssetInstallationRequest {
  cwd: string;
}

/**
 * 安装 Finley 的项目工具：
 *   templates/finley        -> <cwd>/.finley
 *   templates/agents-skills -> <cwd>/.agents/skills
 * 并幂等合并 AGENTS.md。已存在的文件默认不覆盖，保护用户改动。
 */
export function installFinleyAssets(options: AssetInstallationRequest): void {
  const { cwd } = options;
  const tpl = templateDirectory();

  consoleUi.step("阶段 3/4：安装 Finley 工具");

  // .finley/
  const finleyResult = copyDirectoryIfMissing(path.join(tpl, "finley"), path.join(cwd, ".finley"), cwd);
  // .agents/skills/
  const skillsResult = copyDirectoryIfMissing(
    path.join(tpl, "agents-skills"),
    path.join(cwd, ".agents", "skills"),
    cwd,
  );

  const created = [...finleyResult.created, ...skillsResult.created];
  const skipped = [...finleyResult.skipped, ...skillsResult.skipped];

  for (const f of created) consoleUi.success(`创建 ${f}`);
  for (const f of skipped) consoleUi.detail(`已存在，跳过 ${pc.dim(f)}`);

  mergeAssistantGuidance(cwd, tpl);
}

/**
 * 幂等合并 AGENTS.md：
 *   - 文件不存在 -> 直接创建，写入 Finley 区块。
 *   - 已有 FINLEY 区块 -> 用最新区块替换（区块外内容保留）。
 *   - 有文件但无区块 -> 在末尾追加区块。
 */
export function mergeAssistantGuidance(cwd: string, tpl: string): void {
  const agentsPath = path.join(cwd, "AGENTS.md");
  const section = readTextFile(path.join(tpl, "AGENTS.section.md")).trim();

  consoleUi.step("阶段 4/4：更新 AI 协作说明");

  if (!fileExists(agentsPath)) {
    writeTextFile(agentsPath, section + "\n");
    consoleUi.success("创建 AGENTS.md 并写入 Finley 区块。");
    return;
  }

  const original = readTextFile(agentsPath);
  const startIdx = original.indexOf(MARKER_START);
  const endIdx = original.indexOf(MARKER_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = original.slice(0, startIdx);
    const after = original.slice(endIdx + MARKER_END.length);
    const updated = `${before}${section}${after}`;
    if (updated === original) {
      consoleUi.detail("AGENTS.md 的 Finley 区块已是最新，无需改动。");
    } else {
      writeTextFile(agentsPath, updated);
      consoleUi.success("更新 AGENTS.md 中已有的 Finley 区块。");
    }
    return;
  }

  // 有文件但无区块：末尾追加
  const sep = original.endsWith("\n") ? "\n" : "\n\n";
  writeTextFile(agentsPath, original + sep + section + "\n");
  consoleUi.success("在已有 AGENTS.md 末尾追加 Finley 区块。");
}
