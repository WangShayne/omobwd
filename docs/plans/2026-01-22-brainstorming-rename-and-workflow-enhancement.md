# Brainstorming 重命名与工作流增强设计

日期：2026-01-22

## 概述

对 omobwd 技能库进行三项改动：
1. 将 `brainstorm` 重命名为 `brainstorming`
2. brainstorming 完成后提示用户调用 write-docs 编写项目设计文档
3. do 执行开发任务时询问是否使用 `/ulw` (ultrawork)

## 改动详情

### 1. 重命名 brainstorm → brainstorming

**改动范围**：

| 文件/目录 | 改动 |
|-----------|------|
| `skills/workflow/brainstorm/` | 重命名为 `skills/workflow/brainstorming/` |
| `skills/workflow/brainstorming/SKILL.md` | `name: brainstorm` → `name: brainstorming` |
| `.opencode/plugin/omobwd.js` | 更新嵌套路径引用 |
| `README.md` | 更新技能表格和示例 |
| `README.zh-CN.md` | 更新技能表格和示例 |

### 2. 修改 brainstorming 技能

在"输出阶段"增加主动提示逻辑：

```markdown
### 4. 输出阶段

当设计方案收敛确定后，主动提示用户：

> 设计方案已明确。建议调用 `omobwd:write-docs` 将方案写入项目设计文档。

根据用户意愿选择后续动作：

| 用户说 | 动作 |
|--------|------|
| "生成文档" / "好的" | 调用 `omobwd:write-docs` 生成项目设计文档 |
| "继续实现" | 调用 `omobwd:do` 开始执行 |
| "就这样" | 结束对话，结论留在对话中 |
```

### 3. 修改 do 技能

在"任务分发"阶段增加 `/ulw` 询问：

```markdown
### 3. 任务分发

**开发任务执行前询问**：

当任务需要实际编码/开发执行时，询问用户：

> 需要执行开发任务。是否使用 oh-my-opencode 的 `/ulw` (ultrawork) 来执行？
> A) 是 - 使用 /ulw 执行
> B) 否 - 当前 agent 直接执行

根据用户选择：
- A → 调用 `/ulw` 命令执行开发任务
- B → 使用内置工具或 agents 直接执行
```

## 实现步骤

1. 重命名目录 `brainstorm` → `brainstorming`
2. 更新 `skills/workflow/brainstorming/SKILL.md`
3. 更新 `skills/workflow/do/SKILL.md`
4. 更新 `.opencode/plugin/omobwd.js`
5. 更新 `README.md`
6. 更新 `README.zh-CN.md`

## 验证

- [ ] `find_omobwd_skills` 显示 `omobwd:brainstorming`
- [ ] `use_omobwd_skill omobwd:brainstorming` 正常加载
- [ ] `use_omobwd_skill omobwd:do` 正常加载
