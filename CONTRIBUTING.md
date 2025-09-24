Contributing

Thanks for your interest in contributing to 8thwallmcp!

Workflow

- Fork the repo and create a feature branch.
- Install Node 18+ and run:
  - `npm ci`
  - `npm run typecheck`
  - `npm run build`
- Keep changes focused and include a short rationale in the PR.
- For features, add/update README sections when appropriate.

Conventions

- TypeScript, ES modules, Node 18+.
- Minimal dependencies; keep the server fast to boot.
- Prefer small tools with clear input/output over monoliths.

Tests

- This repo does not include a formal test suite yet.
- Where reasonable, add small runtime checks or sample usage in README.

Security

- Do not include secrets or credentials in PRs.
- Report vulnerabilities privately per SECURITY.md.

License

By contributing, you agree that your contributions will be licensed under the MIT License.

