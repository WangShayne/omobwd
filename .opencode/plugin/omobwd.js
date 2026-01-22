/**
 * omobwd plugin for OpenCode.ai
 *
 * Provides skill discovery and loading for omobwd skills.
 * Integrates with existing superpowers plugin.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { tool } from '@opencode-ai/plugin/tool';
import * as skillsCore from '../../lib/skills-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const OmobwdPlugin = async ({ client, directory }) => {
  const homeDir = os.homedir();
  
  // omobwd skills directory (relative to plugin location)
  const omobwdSkillsDir = path.resolve(__dirname, '../../skills');
  
  // Personal skills (same as superpowers uses)
  const personalSkillsDir = path.join(homeDir, '.config/opencode/skills');
  
  // Project skills
  const projectSkillsDir = path.join(directory, '.opencode/skills');

  return {
    tool: {
      use_omobwd_skill: tool({
        description: 'Load omobwd skills (brainstorming, write-docs, do) for development workflow.',
        args: {
          skill_name: tool.schema.string().describe('Name of the omobwd skill (e.g., "omobwd:brainstorming", "omobwd:do", "omobwd:write-docs")')
        },
        execute: async (args, context) => {
          const { skill_name } = args;

          // Only handle omobwd: prefixed skills
          if (!skill_name.startsWith('omobwd:')) {
            return `Error: This tool only handles omobwd: prefixed skills. Got "${skill_name}".`;
          }

          const actualSkillName = skill_name.replace(/^omobwd:/, '');
          
          // Resolve skill path in omobwd skills directory (supports nested structure)
          const resolved = skillsCore.resolveSkillPath(actualSkillName, omobwdSkillsDir, null);

          if (!resolved) {
            // Try nested paths (workflow/brainstorm, documentation/write-docs, etc.)
            const nestedPaths = [
              path.join(omobwdSkillsDir, 'workflow', actualSkillName),
              path.join(omobwdSkillsDir, 'documentation', actualSkillName)
            ];

            // Also check for 'brainstorming' when 'brainstorm' is requested (backward compat)
            const aliasMap = { 'brainstorm': 'brainstorming' };
            if (aliasMap[actualSkillName]) {
              nestedPaths.unshift(
                path.join(omobwdSkillsDir, 'workflow', aliasMap[actualSkillName]),
                path.join(omobwdSkillsDir, 'documentation', aliasMap[actualSkillName])
              );
            }

            for (const nestedPath of nestedPaths) {
              const skillFile = path.join(nestedPath, 'SKILL.md');
              if (fs.existsSync(skillFile)) {
                const fullContent = fs.readFileSync(skillFile, 'utf8');
                const { name, description } = skillsCore.extractFrontmatter(skillFile);
                const content = skillsCore.stripFrontmatter(fullContent);
                const skillDirectory = path.dirname(skillFile);

                const skillHeader = `# ${name || actualSkillName}
# ${description || ''}
# Supporting tools and docs are in ${skillDirectory}
# ============================================`;

                try {
                  await client.session.prompt({
                    path: { id: context.sessionID },
                    body: {
                      noReply: true,
                      parts: [
                        { type: "text", text: `Loading skill: ${skill_name}`, synthetic: true },
                        { type: "text", text: `${skillHeader}\n\n${content}`, synthetic: true }
                      ]
                    }
                  });
                } catch (err) {
                  return `${skillHeader}\n\n${content}`;
                }

                return `Launching skill: ${skill_name}`;
              }
            }

            return `Error: Skill "${skill_name}" not found.\n\nAvailable omobwd skills:\n- omobwd:brainstorming\n- omobwd:write-docs\n- omobwd:do`;
          }

          const fullContent = fs.readFileSync(resolved.skillFile, 'utf8');
          const { name, description } = skillsCore.extractFrontmatter(resolved.skillFile);
          const content = skillsCore.stripFrontmatter(fullContent);
          const skillDirectory = path.dirname(resolved.skillFile);

          const skillHeader = `# ${name || skill_name}
# ${description || ''}
# Supporting tools and docs are in ${skillDirectory}
# ============================================`;

          try {
            await client.session.prompt({
              path: { id: context.sessionID },
              body: {
                noReply: true,
                parts: [
                  { type: "text", text: `Loading skill: ${skill_name}`, synthetic: true },
                  { type: "text", text: `${skillHeader}\n\n${content}`, synthetic: true }
                ]
              }
            });
          } catch (err) {
            return `${skillHeader}\n\n${content}`;
          }

          return `Launching skill: ${skill_name}`;
        }
      }),

      find_omobwd_skills: tool({
        description: 'List all available omobwd skills.',
        args: {},
        execute: async (args, context) => {
          // Find skills in nested structure
          const workflowSkills = skillsCore.findSkillsInDir(
            path.join(omobwdSkillsDir, 'workflow'), 
            'omobwd', 
            2
          );
          const documentationSkills = skillsCore.findSkillsInDir(
            path.join(omobwdSkillsDir, 'documentation'), 
            'omobwd', 
            2
          );

          const allSkills = [...workflowSkills, ...documentationSkills];

          if (allSkills.length === 0) {
            return 'No omobwd skills found.';
          }

          let output = 'Available omobwd skills:\n\n';

          for (const skill of allSkills) {
            const skillName = skill.name || path.basename(skill.path);
            output += `omobwd:${skillName}\n`;
            if (skill.description) {
              output += `  ${skill.description}\n`;
            }
            output += `  Directory: ${skill.path}\n\n`;
          }

          return output;
        }
      })
    }
  };
};
