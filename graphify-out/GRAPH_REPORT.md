# Graph Report - .  (2026-06-02)

## Corpus Check
- Corpus is ~7,914 words - fits in a single context window. You may not need a graph.

## Summary
- 65 nodes · 89 edges · 8 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_YouTube API Routes|YouTube API Routes]]
- [[_COMMUNITY_Multi-Platform API Routes|Multi-Platform API Routes]]
- [[_COMMUNITY_Core Platform Utilities|Core Platform Utilities]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_Agent Configuration|Agent Configuration]]
- [[_COMMUNITY_File Icon|File Icon]]
- [[_COMMUNITY_Globe Icon|Globe Icon]]
- [[_COMMUNITY_Window Icon|Window Icon]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 14 edges
2. `GET()` - 12 edges
3. `OPTIONS()` - 11 edges
4. `OPTIONS()` - 11 edges
5. `buildMp4Response()` - 7 edges
6. `README.md - Project README` - 6 edges
7. `buildMp3Response()` - 5 edges
8. `getCookiesPath()` - 4 edges
9. `buildInfoResponse()` - 4 edges
10. `Next.js Framework` - 4 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `buildMp4Response()`  [INFERRED]
  app\api\youtube\download\route.ts → app\api\_lib\platform.ts
- `GET()` --calls--> `buildMp3Response()`  [INFERRED]
  app\api\youtube\download\route.ts → app\api\_lib\platform.ts
- `GET()` --calls--> `qualityToBitrate()`  [INFERRED]
  app\api\youtube\download\route.ts → app\api\_lib\platform.ts
- `OPTIONS()` --calls--> `optionsResponse()`  [INFERRED]
  app\api\youtube\info\route.ts → app\api\_lib\platform.ts
- `GET()` --calls--> `getParam()`  [INFERRED]
  app\api\youtube\info\route.ts → app\api\_lib\platform.ts

## Hyperedges (group relationships)
- **Next.js Project Ecosystem** — readme_doc, readme_nextjs_framework, readme_create_next_app, readme_next_font, readme_geist_font, readme_vercel_platform, readme_rda, next_icon, vercel_icon [INFERRED 0.85]
- **Agent Configuration Files** — agents_doc, claude_doc, agents_nextjs_rules [EXTRACTED 1.00]
- **Public SVG Icon Assets** — file_icon, globe_icon, next_icon, vercel_icon, window_icon [INFERRED 0.95]

## Communities

### Community 0 - "YouTube API Routes"
Cohesion: 0.22
Nodes (5): GET(), OPTIONS(), getParam(), optionsResponse(), qualityToBitrate()

### Community 1 - "Multi-Platform API Routes"
Cohesion: 0.3
Nodes (2): GET(), OPTIONS()

### Community 2 - "Core Platform Utilities"
Cohesion: 0.5
Nodes (8): addCorsToHeaders(), buildInfoResponse(), buildMp3Response(), buildMp4Response(), cleanupCookies(), fetchFromCobalt(), getCookiesPath(), runYtDlp()

### Community 3 - "Project Documentation"
Cohesion: 0.25
Nodes (9): Next.js Wordmark Logo, create-next-app, README.md - Project README, Geist Font, next/font, Next.js Framework, RDA Project, Vercel Platform (+1 more)

### Community 5 - "Agent Configuration"
Cohesion: 0.67
Nodes (4): AGENTS.md - Next.js Agent Rules, Next.js Agent Rules, node_modules/next/dist/docs/, CLAUDE.md - Claude Configuration

### Community 12 - "File Icon"
Cohesion: 1.0
Nodes (1): Document/File Icon

### Community 13 - "Globe Icon"
Cohesion: 1.0
Nodes (1): Globe/World Icon

### Community 14 - "Window Icon"
Cohesion: 1.0
Nodes (1): Window UI Icon

## Knowledge Gaps
- **10 isolated node(s):** `CLAUDE.md - Claude Configuration`, `create-next-app`, `next/font`, `Geist Font`, `RDA Project` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Multi-Platform API Routes`** (12 nodes): `route.ts`, `route.ts`, `route.ts`, `route.ts`, `route.ts`, `route.ts`, `route.ts`, `route.ts`, `route.ts`, `route.ts`, `GET()`, `OPTIONS()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `File Icon`** (1 nodes): `Document/File Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Globe Icon`** (1 nodes): `Globe/World Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Window Icon`** (1 nodes): `Window UI Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `YouTube API Routes` to `Core Platform Utilities`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `GET()` connect `Multi-Platform API Routes` to `YouTube API Routes`, `Core Platform Utilities`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `OPTIONS()` connect `Multi-Platform API Routes` to `YouTube API Routes`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `GET()` (e.g. with `getParam()` and `buildMp4Response()`) actually correct?**
  _`GET()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `GET()` (e.g. with `getParam()` and `buildInfoResponse()`) actually correct?**
  _`GET()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `CLAUDE.md - Claude Configuration`, `create-next-app`, `next/font` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._