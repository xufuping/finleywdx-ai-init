---
name: finley-memory
description: "在工作阶段结束时记录可供后续协作使用的结果、决策和提交；在新会话开始时恢复近期上下文。"
---

# Finley 工作记录

Finley 把需要长期保留的协作信息放进可读的工作日志，而不是依赖对话上下文。

## 开始工作

阅读当前记录人的 `.finley/workspace/<开发者>/worklog.md` 末尾，确认上次完成的结果、关联分支和未解决问题。

## 完成工作

先完成交付检查，再记录一次工作结果：

```bash
python .finley/tools/record_work.py \
  --title "工作标题" \
  --summary "做了什么，以及结果是什么" \
  --commit "abc1234"
```

- `--title` 和 `--summary` 必填，应让未参与当前会话的人也能理解。
- 需要保留推理或验收细节时，使用 `--file note.md` 或 `--stdin`。
- 记录人默认依次取 `FINLEY_DEVELOPER`、git 用户名和系统用户名；可用 `--developer` 覆盖。
- 一个完整的工作阶段写一条，避免把不相关的任务混在一起。
