## Summary

Please describe the purpose of this PR and the areas of the app changed.

## Checklist

- [ ] I ran `npm run dev` and verified the UI looks correct.
- [ ] I ran `npm run validate` and resolved any reported issues.
- [ ] I ran `npm run validate` and `npm test` and resolved any reported issues.
- [ ] If I added commands/scripts, I verified they use placeholder tokens (`target.com`, `ASXXXXX`, `Target Org`) where appropriate.
- [ ] I did not commit secrets or `.env.local` in the PR.
- [ ] I created a focused PR: content updates vs UI/logic changes kept separate.

## Testing Notes

- Run `npm run dev` and use the search and terminal copy features to confirm behavior.
- If adding a terminal/script, preview how it displays in the editor and test if it executes in local dev environment (requires COOP/COEP headers which are set in `vite.config.ts` for dev server).

## Additional Info

- If this PR includes updates to `constants.ts`, remember to update icons in `App.tsx` if `section.id` values changed.
