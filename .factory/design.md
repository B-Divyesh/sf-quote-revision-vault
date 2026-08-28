# Quote Revision Vault — visual thesis

## Direction

**Art-deco transit poster for a dependable paper trail.** A quote revision is treated as a new stop on a clear route. Strong rails, stepped corners, ticket punches, and numbered platforms make history feel ordered and durable. This is a working ledger, not a generic finance dashboard.

The interface is deliberately single-mode. A warm ticket-stock background, dark ink, oxblood red, and brass accents reproduce a 1930s station poster without lowering contrast or obscuring the quote itself.

## Tokens

- `--paper: #F4E7CB` — warm ticket stock and page background
- `--paper-2: #FFF8E8` — editable sheets and raised surfaces
- `--ink: #142D32` — primary type and outlines (12.2:1 on paper)
- `--muted: #526266` — secondary type (5.1:1 on paper)
- `--oxblood: #8A2634` — primary actions and removed values
- `--brass: #C08A27` — active route, focus, and new values
- `--green: #1F684F` — saved and acknowledged states
- `--danger: #A52934` — destructive action and errors
- `--night: #0C2328` — header/footer and poster frame

Spacing follows an 8px base: 4, 8, 12, 16, 24, 32, 48, 64, and 96px. Content measure is 68 characters. Controls are at least 44px tall. Panels use clipped or stepped corners rather than generic rounded cards.

## Type

- Display: `Arial Narrow`, `Avenir Next Condensed`, `Roboto Condensed`, sans-serif. Tall uppercase letterforms evoke platform boards without a font download.
- Body: `Georgia`, `Times New Roman`, serif for readable, invoice-like detail.
- UI labels and numbers use the display stack with tabular figures.

No external or downloaded fonts are needed. This protects offline use and keeps first load small.

## Layout and shape

The first screen is asymmetric: plain job copy sits left, while a framed poster and short rail facts sit right. A vertical route line becomes the revision timeline inside the app. Panels have double-line borders and clipped corners. Buttons look like punched transit tickets. Fine paper grain is CSS-only and decorative.

On phones, the route becomes a compact horizontal stop list, the editor becomes one column, and comparison tables become stacked before/after records. Nothing requires horizontal scrolling.

## Interaction grammar

- Saving a revision adds one physical “stop” to the route.
- Selecting two stops draws the comparison between them.
- New values use brass with a `New` label; removed values use oxblood with a `Before` label. Color is never the only cue.
- Confirmation and error messages appear beside the action that caused them and in a polite live region.
- Destructive actions name the quote or link and require confirmation.

## Motion

The signature motion is a 240ms route-stamp: a new revision settles vertically by 8px while its stop dot scales from 0.85 to 1. Motion uses only opacity and transform. Navigation fades in for 160ms. Nothing loops.

With `prefers-reduced-motion: reduce`, all movement is removed, scrolling is instant, and state changes use borders and labels only.

## Original asset plan and provenance

Hero art is generated once with the factory image model, then reviewed and optimized to WebP. It shows two abstract quote sheets traveling through an art-deco station gate, connected by a precise revision route. It contains no required text, people, brands, logos, signatures, or UI claims.

Prompt sheet: “Vertical 1930s art-deco railway poster illustration, abstract document revision archive, two cream paper quote sheets as geometric forms passing through a monumental brass station gate, a clear route line with numbered circular stops connecting old sheet to revised sheet, deep teal ink, oxblood red, warm parchment, aged brass, crisp screen-print shapes, subtle paper grain, symmetrical architectural perspective, dramatic flat light, no people, no legible text, no letters, no numbers, no logos, no watermark, no modern computer screens, no gradients.”

Model: factory image deployment via `/opt/fleet/lib/gen-image.sh`. Generated 2026-08-28. Original output is product-specific generated art. The final optimized derivative ships with the app; source prompt metadata is stored beside it.

The wordmark and favicon use hand-authored SVG geometry. PWA icons and the social card are crops of the generated poster, with no added third-party material.
