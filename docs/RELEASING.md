# Build and release

A release is a tested source change with its generated userscript **committed to the repository**. The default branch's `dist/` file is the installation artifact. Do not create GitHub Releases or upload separate release assets.

## Prepare

1. Install locked dependencies with `npm ci` using Node.js 22.12 or newer.
2. Make source changes. For a versioned release, use `npm version patch --no-git-tag-version` (or an explicitly chosen version). This updates `package.json` and `package-lock.json` without creating a commit or tag. Vite reads the package version for userscript metadata.
3. Run:

   ```sh
   npm run release
   ```

   Tests run first. The build then checks Svelte and TypeScript, bundles the userscript and CSS, and verifies metadata, package-version agreement, permissions, and JavaScript syntax. A failed step stops the command.
4. Replace the installed script with the generated file and smoke-test the real website: current category/custom list, cross-page draw, new-tab reading, reroll, copying, close/Escape, and error recovery. Keep account mutations separate from synthetic tests and report any untested behavior.
5. Review the source, lockfile, metadata, documentation, and generated distribution together. Include relevant README or screenshots when behavior changes.

## Publish

Commit the source and generated artifact together, then push the reviewed changes through the repository's normal delivery flow. For example:

```sh
git add src/ package.json package-lock.json vite.config.ts dist/ README.md docs/
git diff --cached --check
git diff --cached --stat
git commit -m "Release random reader update"
git push
```

Include other intentionally changed tests or build files in the commit. Do not add local dependencies or temporary browser data. `dist/` is intentionally tracked and must never be added to ignore rules.

The **Build** workflow runs `npm ci` and `npm run release` on pushes, pull requests, and manual dispatch. It then runs `git diff --exit-code -- dist/` so stale committed output fails CI. The workflow has read-only repository permission; it neither commits nor publishes a GitHub Release.

Once the default branch contains the validated distribution and CI passes, users install or manually update from its Raw userscript file.

## Verify the artifact

```sh
npm run release
git diff --exit-code -- dist/
```

The second command passes when the committed userscript matches a fresh build. An initial, uncommitted build must be reviewed and staged first; Git cannot compare untracked files with a committed artifact.
