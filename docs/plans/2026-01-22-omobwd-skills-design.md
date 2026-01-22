# omobwd 技能库设计文档

> 日期：2026-01-22  
> 状态：已确认  
> 目标用户：个人开发者

## 概述

omobwd 是一个面向 oh-my-opencode 的轻量技能库，提供三个核心技能用于个人开发工作流：

| 技能 | 用途 |
|------|------|
| `omobwd:brainstorm` | 对话式需求澄清，可选输出设计文档 |
| `omobwd:write-docs` | 生成 oh-my-opencode 规范文档 |
| `omobwd:do` | 智能任务路由与执行监督 |

### 技能关系

**混合模式**：brainstorm 和 write-docs 可独立使用，do 作为编排器可串联它们。

---

## 项目结构

```
omobwd/
├── skills/
│   ├── workflow/
│   │   ├── brainstorm/
│   │   │   └── SKILL.md
│   │   └── do/
│   │       └── SKILL.md
│   └── documentation/
│       └── write-docs/
│           └── SKILL.md
├── templates/
│   ├── skill.md.tmpl
│   ├── hook.md.tmpl
│   ├── command.md.tmpl
│   └── agent.md.tmpl
├── docs/
│   └── plans/
└── README.md
```

### 核心理念

1. **技能层只做编排** - 不实现具体功能，定义"何时触发"和"如何协调" oh-my-opencode 已有能力
2. **模板驱动文档生成** - 通过模板确保输出符合 oh-my-opencode 规范
3. **渐进式复杂度** - 简单任务直接完成，复杂任务触发完整流程
4. **失败即学习** - 监督机制处理失败并总结原因

---

## 技能设计

### omobwd:brainstorm

```yaml
name: brainstorm
description: 通过对话探索想法，澄清需求，可选输出设计文档
when_to_use: 当开始新功能、不确定实现方向、或需要理清思路时
```

#### 核心流程

```
1. 理解阶段
   ├── 读取当前项目上下文（文件结构、最近提交）
   ├── 单次提问，逐步澄清目标
   └── 优先多选题，降低回答负担

2. 探索阶段
   ├── 提出 2-3 个可行方案
   ├── 说明各方案 trade-offs
   └── 给出推荐并解释理由

3. 收敛阶段
   ├── 分段呈现设计（每段 200-300 字）
   ├── 每段后确认是否正确
   └── 根据反馈调整

4. 输出阶段（可选）
   ├── 用户说"生成文档" → 写入 docs/plans/YYYY-MM-DD-<topic>.md
   └── 用户说"继续实现" → 调用 omobwd:do
```

#### 与 superpowers:brainstorming 的区别

| superpowers | omobwd |
|-------------|--------|
| 必须输出设计文档 | 默认对话式，文档可选 |
| 面向通用开发 | 面向 oh-my-opencode 生态 |
| 完成后建议用 git-worktree | 完成后可直接调用 do |

#### 退出条件

- 用户明确表示思路清晰
- 用户选择生成文档或开始实现
- 用户手动终止

---

### omobwd:write-docs

```yaml
name: write-docs
description: 生成符合 oh-my-opencode 规范的功能文档（技能、hooks、命令、agent配置）
when_to_use: 当需要创建 oh-my-opencode 可用的配置文档或扩展技能时
```

#### 支持的文档类型

| 类型 | 模板 | 输出位置 |
|------|------|----------|
| Skill | `skill.md.tmpl` | `.opencode/skills/<name>/SKILL.md` |
| Hook | `hook.md.tmpl` | `.opencode/hooks/<name>.md` |
| Command | `command.md.tmpl` | `.opencode/commands/<name>.md` |
| Agent | `agent.md.tmpl` | `.opencode/agents/<name>.md` |

#### 核心流程

```
1. 识别意图
   ├── 用户明确指定类型 → 直接使用对应模板
   └── 用户描述模糊 → 提问确认文档类型

2. 收集信息
   ├── 根据模板字段逐项询问
   ├── name、description、when_to_use 等必填项
   └── 可从 brainstorm 对话中提取已有信息

3. 生成文档
   ├── 填充模板，生成符合规范的 YAML frontmatter + Markdown
   ├── 展示预览，确认后写入文件
   └── 可选：验证 frontmatter 格式正确性

4. 后续动作
   ├── 用户说"测试一下" → 调用 omobwd:do 验证技能可用
   └── 用户说"继续添加" → 循环创建更多文档
```

#### 模板示例（skill.md.tmpl）

```yaml
---
name: {{name}}
description: {{description}}
when_to_use: {{when_to_use}}
version: 1.0.0
---

# {{title}}

## 概述
{{overview}}

## 流程
{{process}}

## 示例
{{examples}}
```

---

### omobwd:do

```yaml
name: do
description: 智能任务路由与执行监督，分发任务给合适的 agent，验证结果，处理失败
when_to_use: 当需要在 oh-my-opencode 中执行具体任务时
```

#### 核心能力

```
┌─────────────────────────────────────────────────┐
│                  omobwd:do                       │
├─────────────────────────────────────────────────┤
│  1. 意图解析 - 理解用户要做什么                    │
│  2. 路由决策 - 选择合适的 agent/skill             │
│  3. 任务分发 - 并行或串行调度执行                  │
│  4. 结果验证 - 检查输出是否符合预期                │
│  5. 失败处理 - 重试、降级、或上报用户              │
│  6. 进度追踪 - 通过 todo 保持可见性               │
└─────────────────────────────────────────────────┘
```

#### 路由决策表

| 任务类型 | 路由目标 | 示例 |
|----------|----------|------|
| 需要澄清需求 | `omobwd:brainstorm` | "我想加个功能但还没想好" |
| 需要创建文档 | `omobwd:write-docs` | "帮我写个技能文件" |
| 代码探索 | `explore` agent | "找到处理认证的代码" |
| 外部文档查询 | `librarian` agent | "查一下这个库怎么用" |
| 架构决策 | `oracle` agent | "这两种方案哪个好" |
| UI/样式修改 | `frontend-ui-ux-engineer` | "改一下按钮颜色" |
| 直接执行 | 内置工具 | "运行测试" |

#### 失败处理策略

```
失败 → 分析原因
       ├── 可重试错误（网络、临时失败）→ 重试 max 2 次
       ├── 需要更多信息 → 询问用户
       ├── agent 能力不足 → 升级到 oracle
       └── 根本性问题 → 停止并报告，建议调用 brainstorm 重新思考
```

#### 监督机制

- 每个子任务完成后验证输出（lsp_diagnostics、build、test）
- 维护 todo list 追踪多步骤进度
- 任务完成前必须有证据（exit code、诊断结果）

---

## 安装与卸载

### 安装

```bash
# 全局安装（推荐）
git clone https://github.com/<your-org>/omobwd ~/.config/opencode/omobwd

# 项目级安装
git clone https://github.com/<your-org>/omobwd .opencode/omobwd
```

### 卸载

```bash
# 全局安装卸载
rm -rf ~/.config/opencode/omobwd

# 项目级安装卸载
rm -rf .opencode/omobwd
```

**无残留设计**：
- 无需修改任何配置文件
- 不写入系统级依赖
- 删除目录即完全卸载
- 生成的文档保留，属于用户资产

### 与 oh-my-opencode 集成

技能通过目录结构自动发现，无需额外配置：

```
~/.config/opencode/
├── omobwd/                    # 本项目
│   └── skills/
│       ├── workflow/
│       │   ├── brainstorm/
│       │   └── do/
│       └── documentation/
│           └── write-docs/
└── superpowers/               # 可与 superpowers 共存
    └── skills/
```

### 调用方式

```
# 直接调用
使用 omobwd:brainstorm 帮我理清这个功能的需求

# 通过 do 路由
使用 omobwd:do 帮我创建一个新的 hook

# 链式调用（do 自动编排）
使用 omobwd:do 从头开始做一个 git commit 格式化技能
  → do 识别需要澄清 → 调用 brainstorm
  → 需求清晰后 → 调用 write-docs 生成 SKILL.md
  → 生成后 → 验证文件格式正确
```

---

## 版本与兼容性

```yaml
omobwd_version: 1.0.0
requires:
  opencode: ">=0.15.18"
  oh-my-opencode: ">=1.0.0"
compatible_with:
  - superpowers  # 可共存，互不冲突
```

---

## 下一步

1. 创建项目目录结构
2. 编写三个 SKILL.md 文件
3. 创建文档模板
4. 编写 README.md
5. 测试技能调用
