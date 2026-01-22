# omobwd

English | [中文](./README.zh-CN.md)

A lightweight skills library for [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), providing personal development workflow support.

## Skills

| Skill | Purpose |
|-------|---------|
| `omobwd:brainstorm` | Conversational requirement clarification with optional design document output |
| `omobwd:write-docs` | Generate oh-my-opencode compliant documentation |
| `omobwd:do` | Intelligent task routing and execution supervision |

## Installation

### Global Installation (Recommended)

```bash
git clone https://github.com/WangShayne/omobwd ~/.config/opencode/omobwd
ln -sf ~/.config/opencode/omobwd/.opencode/plugin/omobwd.js ~/.config/opencode/plugin/omobwd.js
```

### Project-level Installation

```bash
git clone https://github.com/WangShayne/omobwd .opencode/omobwd
ln -sf .opencode/omobwd/.opencode/plugin/omobwd.js .opencode/plugin/omobwd.js
```

Restart opencode after installation.

## Uninstallation

```bash
# Global installation
rm -rf ~/.config/opencode/omobwd
rm -f ~/.config/opencode/plugin/omobwd.js

# Project-level installation
rm -rf .opencode/omobwd
rm -f .opencode/plugin/omobwd.js
```

Zero residue design: removing the directory and symlink completely uninstalls it. Generated documents are preserved.

## Usage

### List Available Skills

```
find_omobwd_skills
```

### Direct Invocation

```
use_omobwd_skill omobwd:brainstorm
use_omobwd_skill omobwd:write-docs
use_omobwd_skill omobwd:do
```

### Route via do

```
use_omobwd_skill omobwd:do
# Then describe your task, do will automatically route to the appropriate skill or agent
```

### Chained Invocation

do will automatically orchestrate:
1. Call brainstorm to clarify requirements
2. Call write-docs to generate SKILL.md
3. Verify file format correctness

## Project Structure

```
omobwd/
├── .opencode/
│   └── plugin/
│       └── omobwd.js           # Plugin entry
├── lib/
│   └── skills-core.js          # Skills discovery core library
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

## Skills Relationship

```
┌─────────────────────────────────────────┐
│              omobwd:do                  │
│      (Intelligent Routing + Supervision)│
└──────────┬───────────────┬──────────────┘
           │               │
           ▼               ▼
┌──────────────────┐ ┌──────────────────┐
│ omobwd:brainstorm│ │ omobwd:write-docs│
│ (Clarification)  │ │ (Doc Generation) │
└──────────────────┘ └──────────────────┘
```

- **brainstorm** and **write-docs** can be used independently
- **do** serves as orchestrator, invoking other skills as needed

## Compatibility

```yaml
requires:
  opencode: ">=0.15.18"
  oh-my-opencode: ">=1.0.0"

compatible_with:
  - superpowers  # Can coexist
```

## License

MIT
