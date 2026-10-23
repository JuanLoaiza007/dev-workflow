# Workflow: Backlog + OpenSpec por historia

## Objetivo
Combinar la disciplina de alcance de un flujo iterativo con la autonomía y persistencia de OpenSpec. OpenSpec se aplica **por historia de usuario**, no por proyecto completo.

## Skills personalizadas

**`/backlog`**
Genera y mantiene un backlog de historias de usuario pequeñas, cada una entregando valor verificable de punta a punta. Reemplaza el backlog temporal por el sistema de tickets que uses (GitHub Issues, Jira, etc.). Cada historia debe caber en una sola rebanada vertical.

**`/story`**
Refina una historia del backlog antes de implementarla. Produce:
- Criterios de aceptación funcionales.
- Plan mínimo de implementación.
- **Out-of-scope explícito** (sección crítica: delimita el alcance y evita que OpenSpec invente requerimientos).

No incluye detalle técnico de implementación; ese corresponde a OpenSpec.

## Integración con OpenSpec

1. El `backlog.md` generado por `/backlog` es la idea general de la aplicación que satisface los requisitos del cliente.
1. El `story.md` generado por `/story` es el input del change de OpenSpec.
2. OpenSpec genera proposal → spec → design → tasks acotados a esa historia.
3. `apply` de OpenSpec implementa con autonomía y verificación propia.
4. Al cerrar el change, **archivar la spec** en el directorio persistente de OpenSpec. Ese archivo es la documentación viva del sistema.
5. Ofrecer al usuario hacer autonomamente el commit pequeño por historia o seguir refinando la especificación (podría ampliar el cambio, sin embargo debe alertarse si el cambio se esta volviendo excesivamente grande o interfiere con otras historias de usuario en el backlog).

## Separación de responsabilidades

| Artefacto                           | Responsable | Contenido                             |
|-------------------------------------|-------------|---------------------------------------|
| Backlog                             | `/backlog`  | Qué construir y en qué orden          |
| Historia + criterios + out-of-scope | `/story`    | Qué significa "terminado"             |
| Spec / design / tasks               | OpenSpec    | Cómo construirlo y verificarlo        |
| Specs archivadas                    | OpenSpec    | Documentación persistente del sistema |

## Reglas de calibración

- Una historia = una rebanada vertical con valor verificable.
- El usuario invoca los modos por su cuenta, el agente no. (No cambiar a backlog, story, apply, archive autonomamente)
- El out-of-scope es obligatorio: es lo que impide que el agente rellene huecos.
- Cada cambio archivado en OpenSpec es documentación permanente; el `plan.md` de la historia es desechable. El backlog también es desechable (pero se debe dedicar un commit a desechar el backend).  