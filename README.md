# my-dev-workflow-skills

Workflow instalable: **Backlog + OpenSpec por historia**. Skills desacopladas; OpenSpec se instala aparte; el workflow entra en el AGENTS.md de cada proyecto vía comando.

## Estructura

- `skills/backlog/SKILL.md` — `/backlog`: divide una idea en historias verticales. No le importa qué pasa después.
- `skills/story/SKILL.md` — `/story`: refina UNA historia (criterios, plan mínimo, out of scope). No le importa qué pasa después.
- `workflow/backlog-openspec.md` — sección canónica del workflow (única fuente de verdad).
- `commands/<host>/init-workflow.md` — comando que instala o actualiza la sección del workflow en el AGENTS.md de un proyecto.

## Instalación

Skills globales (una vez, por agente):

```sh
cp -r skills /home/juan/.agents/skills/
```

Comando por host:

```sh
cp commands/opencode/init-workflow.md ~/.config/opencode/command/init-workflow.md
cp commands/claude/init-workflow.md ~/.claude/commands/init-workflow.md
cp commands/kilo/init-workflow.md ~/.kilo/commands/init-workflow.md
```

Kilo: verificar la ruta real de comandos del host. Cada archivo difiere solo en el frontmatter; el cuerpo es el mismo.

OpenSpec: se instala aparte, por proyecto.

## Uso

En cada proyecto que adopte el flujo:

1. Ejecuta `/init-workflow`.
2. El agente lee el AGENTS.md del proyecto, detecta conflictos (los reporta, no decide), y añade o reemplaza la sección delimitada `<!-- workflow:backlog-openspec -->`.
3. Revisa el reporte; resuelve conflictos a mano.
4. Después, el flujo: `/backlog` → `/story` → OpenSpec por historia (proposal → spec → design → tasks → apply) → archivar spec.

## Actualización

Cambios al workflow: editar `workflow/backlog-openspec.md` y el bloque embebido en `commands/<host>/init-workflow.md` (todo a la vez), subir la versión en ambos, re-ejecutar `/init-workflow` en cada proyecto.
