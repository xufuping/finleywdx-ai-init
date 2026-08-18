import { executeCommand } from "../platform/command-runner.js";
import { checkSpecify } from "./inspect-environment.js";
import { consoleUi } from "../presentation/console.js";
import pc from "picocolors";

/** 一次为这些 agent 安装 spec-kit 命令。 */
export const DEFAULT_INTEGRATIONS = [
  "cursor-agent",
  "claude",
  "codex",
  "gemini",
  "copilot",
] as const;

export interface SpecKitProvisionRequest {
  cwd: string;
  integrations?: readonly string[];
  /** 跳过 agent 工具的可用性检查（透传 --ignore-agent-tools）。 */
  ignoreAgentTools?: boolean;
  /** 仅打印将要执行的命令，不真正调用 specify（用于自检 / dry-run）。 */
  dryRun?: boolean;
}

export interface SpeckitResult {
  ok: boolean;
  installed: string[];
  failed: string[];
  skipped: boolean;
}

/**
 * 编排 spec-kit。
 *
 * 核实结论（spec-kit 0.12.4）：`specify init` 每次调用只接受**单个** `--integration`
 * （旧的 `--ai` 已废弃），并不存在稳定可依赖的一条命令传多个 integration 的参数。
 * 因此这里采用**循环逐个 integration**的稳健方式：
 *   1. 首个 integration：specify init . --integration <first> --force [--ignore-agent-tools]
 *   2. 其余 integration：specify integration install <name> --force
 *      （多装受控：非 multi-install-safe 组合需要 --force 显式确认）
 *
 * 全程处理 specify 缺失 / 单条失败并给出友好中文报错，不静默吞异常。
 */
export async function provisionSpecKit(options: SpecKitProvisionRequest): Promise<SpeckitResult> {
  const {
    cwd,
    integrations = DEFAULT_INTEGRATIONS,
    ignoreAgentTools = true,
    dryRun = false,
  } = options;

  consoleUi.step("阶段 2/4：准备 spec-kit");

  const list = [...integrations];
  if (list.length === 0) {
    consoleUi.warn("未指定任何 integration，跳过 spec-kit 编排。");
    return { ok: true, installed: [], failed: [], skipped: true };
  }

  // 缺失 specify：给出指引并把这一步标记为跳过（仍可安装 Finley 工具）。
  const specify = await checkSpecify();
  if (!specify.available && !dryRun) {
    consoleUi.error("未找到 specify CLI，无法编排 spec-kit。");
    console.log(
      pc.dim(
        "    请先安装 spec-kit（替换 <tag> 为最新版本，如 v0.12.4）：\n" +
          "    uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@<tag>\n" +
          "    安装后重跑 ai-init init。本次将跳过 spec-kit，仅安装 Finley 工具。",
      ),
    );
    return { ok: false, installed: [], failed: [...list], skipped: true };
  }

  const installed: string[] = [];
  const failed: string[] = [];

  const [first, ...rest] = list;

  // 1) 首个 integration 用 specify init 初始化到当前目录
  const initArgs = ["init", ".", "--integration", first, "--force"];
  if (ignoreAgentTools) initArgs.push("--ignore-agent-tools");

  consoleUi.info(`初始化 spec-kit（首个 integration）：${pc.bold(first)}`);
  consoleUi.detail(`$ specify ${initArgs.join(" ")}`);

  if (dryRun) {
    installed.push(first);
  } else {
    const res = await executeCommand("specify", initArgs, { cwd, stdio: "inherit" });
    if (res.ok) {
      consoleUi.success(`spec-kit 已初始化并安装 integration：${first}`);
      installed.push(first);
    } else {
      consoleUi.error(`specify init 失败（integration=${first}，退出码 ${res.exitCode ?? "?"}）。`);
      if (res.stderr) consoleUi.detail(res.stderr.split("\n").slice(0, 8).join("\n"));
      failed.push(first);
      // init 失败则后续 integration install 也无从谈起
      return { ok: false, installed, failed: [...list], skipped: false };
    }
  }

  // 2) 其余 integration 逐个通过 specify integration install 追加
  for (const name of rest) {
    const args = ["integration", "install", name, "--force"];
    consoleUi.info(`追加 integration：${pc.bold(name)}`);
    consoleUi.detail(`$ specify ${args.join(" ")}`);

    if (dryRun) {
      installed.push(name);
      continue;
    }

    const res = await executeCommand("specify", args, { cwd, stdio: "inherit" });
    if (res.ok) {
      consoleUi.success(`已安装 integration：${name}`);
      installed.push(name);
    } else {
      consoleUi.warn(`integration 安装失败：${name}（退出码 ${res.exitCode ?? "?"}），继续其余项。`);
      if (res.stderr) consoleUi.detail(res.stderr.split("\n").slice(0, 6).join("\n"));
      failed.push(name);
    }
  }

  const ok = failed.length === 0;
  if (ok) {
    consoleUi.success(`spec-kit 编排完成，已安装 integration：${installed.join(", ")}`);
  } else {
    consoleUi.warn(
      `spec-kit 编排部分完成。成功：${installed.join(", ") || "无"}；失败：${failed.join(", ")}。`,
    );
  }

  return { ok, installed, failed, skipped: false };
}
