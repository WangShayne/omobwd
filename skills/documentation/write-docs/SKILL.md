---
name: write-docs
description: 生成符合 oh-my-opencode 规范的功能文档（技能、hooks、命令、agent 配置）
when_to_use: 当需要创建 oh-my-opencode 可用的配置文档或扩展技能时
version: 1.0.0
---

# Write-Docs - 文档生成器

生成符合 oh-my-opencode 规范的各类功能文档，通过模板确保格式正确。

## 支持的文档类型

| 类型 | 模板 | 输出位置 |
|------|------|----------|
| Skill | `skill.md.tmpl` | `.opencode/skills/<name>/SKILL.md` |
| Hook | `hook.md.tmpl` | `.opencode/hooks/<name>.md` |
| Command | `command.md.tmpl` | `.opencode/commands/<name>.md` |
| Agent | `agent.md.tmpl` | `.opencode/agents/<name>.md` |

## 流程

### 1. 识别意图

判断用户需要的文档类型：

**明确指定**：
- "创建一个技能" → Skill
- "写个 hook" → Hook
- "添加命令" → Command

**模糊描述**：
询问确认：
```
你想创建哪种类型的文档？
A) Skill - 可复用的技能定义
B) Hook - 工作流自动化钩子
C) Command - 自定义斜杠命令
D) Agent - agent 配置文件
```

### 2. 收集信息

根据文档类型收集必填字段：

**Skill 必填项**：
- `name` - 技能名称（小写、连字符）
- `description` - 一句话描述
- `when_to_use` - 触发条件

**Hook 必填项**：
- `name` - hook 名称
- `trigger` - 触发时机
- `action` - 执行动作

**Command 必填项**：
- `name` - 命令名称（斜杠命令）
- `description` - 命令描述
- `template` - 命令模板

**Agent 必填项**：
- `name` - agent 名称
- `description` - agent 描述
- `capabilities` - 能力列表

### 3. 生成文档

1. 加载对应模板
2. 填充收集的信息
3. 生成完整文档
4. 展示预览

预览格式：
```
即将创建文件：.opencode/skills/my-skill/SKILL.md

---
name: my-skill
description: ...
when_to_use: ...
---

# My Skill
...

确认创建？(Y/n)
```

### 4. 写入文件

确认后：
1. 创建目录（如需要）
2. 写入文件
3. 验证格式正确

### 5. 后续动作

| 用户说 | 动作 |
|--------|------|
| "测试一下" | 调用 `omobwd:do` 验证技能可用 |
| "继续添加" | 循环创建更多文档 |
| "完成" | 结束 |

## 模板规范

### YAML Frontmatter

所有文档必须包含 YAML frontmatter：

```yaml
---
name: kebab-case-name
description: 一句话描述，不超过 200 字符
when_to_use: 触发条件描述
version: 1.0.0
---
```

### 命名规则

- 只能使用小写字母、数字、连字符
- 长度 1-64 字符
- 不能以连字符开头或结尾
- 目录名必须与 `name` 字段一致

### Markdown 内容

frontmatter 之后是 Markdown 指令：

```markdown
# 标题

## 概述
简要说明功能

## 流程
分步骤说明

## 示例
具体用法示例
```

## 示例

### 创建 Skill

```
用户：帮我创建一个代码审查技能

write-docs：
  1. 类型：Skill
  2. 收集信息：
     - name: code-review
     - description: 对代码变更进行审查，检查质量和潜在问题
     - when_to_use: 当完成代码修改需要审查时
  3. 生成预览
  4. 确认后写入 .opencode/skills/code-review/SKILL.md
```

### 创建 Hook

```
用户：我想在每次提交前自动运行 lint

write-docs：
  1. 类型：Hook
  2. 收集信息：
     - name: pre-commit-lint
     - trigger: before:commit
     - action: npm run lint
  3. 生成预览
  4. 确认后写入 .opencode/hooks/pre-commit-lint.md
```

## 与其他技能的关系

- 可独立使用
- 可被 `omobwd:do` 调用
- 可接收 `omobwd:brainstorm` 的输出作为输入
- 生成后可调用 `omobwd:do` 测试
