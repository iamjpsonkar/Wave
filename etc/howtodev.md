# How to be a developer for this project

## READ Below MD files first
[DEV_CONTEXT](../DEV_CONTEXT.md)
[README](../README.md)
[WIKI](../WIKI.md)

## Open Issues
On github issues https://github.com/iamjpsonkar/Wave/issues, Pick any open issue
- Create or Checkout to the branch
    make sure to ahve latest pull of main branch, if no pull and merge it
    branch will be WAVE-XXXX, where XXXX is the issue id, i.e. 1 -> WAVE-0001 
- Fix, and add proper commit in shape of below
    `ID: WAVE-XXXX; DONE: 100; HOURS: 10; message`
- Update to the Pull Request
    https://github.com/iamjpsonkar/Wave/pulls
- Add comments in the issues, mentioning what was the fixed and what not, and why

## Main-to-feature branch synchronization (required workflow)

Use this procedure whenever an issue/feature branch needs the latest `main`. The goal is to bring current `origin/main` into the feature branch while preserving both histories. Do not use a PR whose direction is `main` → feature as a substitute for doing the local merge and conflict resolution.

### Before starting

1. Confirm the intended feature branch name and target. Never assume the target is `manager`; use the branch explicitly assigned to the task.
2. Check the working tree and current branch:
   ```bash
   git status --short --branch
   git branch --show-current
   ```
3. Commit or safely stash all unrelated local work. Do not start a merge with uncommitted changes that could be overwritten.
4. Fetch remote refs:
   ```bash
   git fetch origin --prune
   ```

### Refresh local main, then merge it into the feature branch

Run the steps in this order:

```bash
# 1. Switch to main and fast-forward it; do not create a local merge on main.
git switch main
git pull --ff-only origin main

# 2. Switch to the intended feature branch.
git switch WAVE-XXXX

# 3. Merge the freshly updated main into the feature branch.
git merge origin/main
```

Replace `WAVE-XXXX` with the actual feature branch. If the feature branch is not tracking the remote, verify its remote counterpart before proceeding. Do not merge the feature branch into `main` as part of this synchronization task.

### Resolve conflicts safely

If Git reports conflicts:

1. Run `git status` and list every unmerged path. Read both versions and the surrounding implementation/tests before choosing a resolution.
2. Resolve each conflict by preserving the intent of both sides. Do not blindly accept `ours` or `theirs`, delete a test, drop a feature, or replace a file with a stale copy merely to finish the merge.
3. For each resolved file, remove all conflict markers and verify the resulting code/docs are coherent. Pay special attention to package manifests/lockfiles, CI workflows, tests, storage formats, product scope and Markdown links/IDs.
4. Stage only reviewed paths, then complete the merge:
   ```bash
   git add <reviewed-paths>
   git diff --check
   git diff --cached
   git commit   # only if Git did not already create the merge commit
   ```
5. If the conflict cannot be resolved confidently, stop and report the exact paths and competing intent. Do not discard either side or force-push around the conflict.

### Verify before pushing

```bash
git status --short --branch
git log --oneline --graph --decorate -12
git merge-base --is-ancestor origin/main HEAD
git diff --check
./test.sh
```

The ancestry command must exit successfully, proving the feature HEAD contains the fetched `origin/main` history. Run the full project quality gate (`./test.sh`) unless the task's documented constraints require a narrower check; report every skipped stage. Inspect the final diff against the feature branch's pre-sync tip and confirm no unrelated work or product scope was lost. Check the GitHub Actions run for the exact pushed commit.

### Push policy

```bash
git push origin WAVE-XXXX
```

Use a normal push whenever possible. Never use `--force` as a routine merge-conflict solution. If a rewrite is explicitly approved by the product owner and genuinely required, first inspect the remote branch and use `--force-with-lease` (never blind `--force`); explain the rewritten commits and verify the remote HEAD afterward. Do not rewrite shared branches such as `main` or another person's feature branch.

### Completion report

Record the source `main` SHA, feature branch name and pre/post-sync SHAs, merge commit SHA, conflict files and how each was resolved, tests/CI tied to the final SHA, and any unverified items. Update the appropriate development/QA log and keep this workflow documentation current. Main synchronization is complete only when the feature branch contains the latest fetched `main`, the merge is pushed, and verification status is accurately reported.
