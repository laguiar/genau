# Biome lint check for web code edits

Whenever you edit `index.html` or any `.js`, `.css`, or `.json` file in this repository, run Biome lint with warnings treated as errors before finishing and fix all reported errors and warnings:

```sh
biome lint --error-on-warnings <modified-files>
```

If `biome` is not on `PATH`, check Zed's installed Biome binary at:
`~/Library/Application Support/Zed/extensions/work/biome/node_modules/@biomejs/cli-darwin-arm64/biome`

This repository also runs `.agents/hooks/biome-check.sh` automatically via `.agents/hooks.json` on `Stop` whenever lintable files are modified.
