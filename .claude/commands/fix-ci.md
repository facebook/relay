# Fix CI Skill

You are a specialized skill for checking GitHub CI status and fixing failing tests in the Relay project.

## Your Task

1. **Check Current CI Status**
   - Use `gh run list --branch=main --workflow=ci.yml --limit 5` to see recent workflow runs
   - If the most recent run is failing, use `gh run view <ID>` using the ID from the most recent run to get detailed status
   - Identify any failing jobs or checks

2. **Analyze Failures**
   - For each failing job, use `gh run view <run-id> --log-failed` to get failure logs
   - **Note**: If this command has no output, you may need to upgrade `gh`. See https://github.com/cli/cli/issues/10551.
   - Parse the logs to identify the specific test failures or errors

3. **Fix the Issues**
   - Based on the failure type, take appropriate action:
   - See `CONTRIBUTING.md` for instructions on how to work in this repository.

   ### Special Case: Out-of-date Cargo.lock

   If the failure is related to an out-of-date `Cargo.lock` file (look for errors like "the lock file needs to be updated but --locked was passed" or diffs showing changes to Cargo.lock), there's an automated workflow to handle this:

   1. **Check for existing PR**: Run `gh pr list --search "Update Cargo.lock" --state open --limit 5` to see if there's already a PR to update the lock file.

   2. **If a PR exists**: Report the PR number to the user and suggest they merge it to fix CI. The PR is typically titled "Update Cargo.lock" and created by the `update-cargo-lock.yml` workflow.

   3. **If no PR exists**: Trigger the workflow manually:
      ```bash
      gh workflow run update-cargo-lock.yml
      ```
      Then monitor for the PR to be created and report it to the user.

   4. **Do NOT manually update Cargo.lock**: The automated workflow ensures consistent updates. Manual updates may conflict or miss dependencies.

4. **Create a Pull Request**
   - Create a new branch: `git checkout -b fix-ci-failures-$(date +%Y%m%d-%H%M%S)`
   - Stage all changes: `git add .`
   - Commit with descriptive message about what was fixed
   - Push the branch: `git push -u origin HEAD`
   - Create PR using `gh pr create` with:
     - Title: "Fix CI failures - [Brief description]"
     - Body: Detailed explanation of:
       - Which jobs were failing
       - What the errors were
       - How you fixed them
       - Test results showing the fixes work

5. **Monitor PR and Iterate Until Passing**
   - After creating the PR, monitor the CI status in a loop
   - Use `gh run list --branch=<your-branch> --limit 1` to check the latest run
   - Use `gh run view <run-id>` to check if it's completed and its status
   - If the run is still in progress, wait 30 seconds and check again
   - If the run fails:
     - Use `gh run view <run-id> --log-failed` to get failure logs
     - Analyze the new failures (they may be different from the original ones)
     - Fix the issues following the same process as step 3
     - Commit and push the fixes: `git add . && git commit -m "Fix additional CI failures" && git push`
     - Continue monitoring the new CI run
   - Keep iterating until all CI checks pass
   - Report success when all checks are green

## Important Guidelines

- Always verify fixes locally before creating a PR
- If you can't automatically fix an issue, document it clearly in your response
- Check if there are multiple failures - fix all of them in one PR if possible
- Run the relevant test suite locally before pushing
- Make sure your fixes don't introduce new issues
- If CI is passing, report that and don't create unnecessary PRs

## Example Workflow

```bash
# 1. Check CI status
gh run list --branch=main --workflow=ci.yml --limit 5

# 2. Get details of latest run
gh run view 20949129659 --log-failed

# 3. If JS tests are failing, run locally
yarn run jest <failing-test>

# 4. Fix the code
# (Read files, make edits)

# 5. Verify fix
yarn run jest <failing-test>

# 6. Create PR
git checkout -b fix-ci-failures-20260106
git add .
git commit -m "Fix failing jest tests in MockPayloadGenerator"
git push -u origin HEAD
gh pr create --title "Fix CI: MockPayloadGenerator test failures" --body "..."
```

## Start Here

Begin by checking the current CI status and reporting what you find.
