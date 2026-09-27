# Motion versions

Homepage animation lives here. The site always imports the current frozen version; older folders stay as rollback copies.

| Version | Status | Entry |
|---------|--------|--------|
| `v1.0/` | Frozen 2026-09-16 | `HomeStage.astro` |
| `v1.1/` | Live — hero beat copy revision | `HomeStage.astro` |

Current pointer: `src/motion/index.ts` → `CURRENT_MOTION`.

## How to iterate

1. Copy the current version folder to `v1.2/` (or `v2.0/`).
2. Edit only the new folder.
3. Point `src/pages/index.astro` at the new `HomeStage.astro` and update `CURRENT_MOTION`.
4. Leave previous versions untouched.
