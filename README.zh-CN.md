# omobwd

[English](./README.md) | 中文

面向 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 的轻量技能库，提供个人开发工作流支持。

## 技能列表

| 技能 | 用途 |
|------|------|
| `omobwd:brainstorm` | 对话式需求澄清，可选输出设计文档 |
| `omobwd:write-docs` | 生成 oh-my-opencode 规范文档 |
| `omobwd:do` | 智能任务路由与执行监督 |

## 安装

### 全局安装（推荐）

```bash
git clone https://github.com/WangShayne/omobwd ~/.config/opencode/omobwd
ln -sf ~/.config/opencode/omobwd/.opencode/plugin/omobwd.js ~/.config/opencode/plugin/omobwd.js
```

### 项目级安装

```bash
git clone https://github.com/WangShayne/omobwd .opencode/omobwd
ln -sf .opencode/omobwd/.opencode/plugin/omobwd.js .opencode/plugin/omobwd.js
```

安装后需重启 opencode。

## 卸载

```bash
# 全局安装
rm -rf ~/.config/opencode/omobwd
rm -f ~/.config/opencode/plugin/omobwd.js

# 项目级安装
rm -rf .opencode/omobwd
rm -f .opencode/plugin/omobwd.js
```

无残留设计：删除目录和符号链接即完全卸载，生成的文档保留。

## 使用

### 列出可用技能

```
find_omobwd_skills
```

### 直接调用

```
use_omobwd_skill omobwd:brainstorm
use_omobwd_skill omobwd:write-docs
use_omobwd_skill omobwd:do
```

### 通过 do 路由

```
use_omobwd_skill omobwd:do
# 然后描述你的任务，do 会自动路由到合适的技能或 agent
```

### 链式调用

do 会自动编排：
1. 调用 brainstorm 澄清需求
2. 调用 write-docs 生成 SKILL.md
3. 验证文件格式正确

## 项目结构

```
omobwd/
├── .opencode/
│   └── plugin/
│       └── omobwd.js           # 插件入口
├── lib/
│   └── skills-core.js          # 技能发现核心库
├── skills/
│   ├── workflow/
│   │   ├── brainstorm/SKILL.md
│   │   └── do/SKILL.md
│   └── documentation/
│       └── write-docs/SKILL.md
├── templates/
│   ├── skill.md.tmpl
│   ├── hook.md.tmpl
│   ├── command.md.tmpl
│   └── agent.md.tmpl
├── docs/
│   └── plans/
├── README.md
└── README.zh-CN.md
```

## 技能关系

```
┌─────────────────────────────────────────┐
│              omobwd:do                  │
│         (智能路由 + 监督)                │
└──────────┬───────────────┬──────────────┘
           │               │
           ▼               ▼
┌──────────────────┐ ┌──────────────────┐
│ omobwd:brainstorm│ │ omobwd:write-docs│
│   (需求澄清)      │ │   (文档生成)      │
└──────────────────┘ └──────────────────┘
```

- **brainstorm** 和 **write-docs** 可独立使用
- **do** 作为编排器，按需调用其他技能

## 兼容性

```yaml
requires:
  opencode: ">=0.15.18"
  oh-my-opencode: ">=1.0.0"

compatible_with:
  - superpowers  # 可共存
```

## License

MIT
