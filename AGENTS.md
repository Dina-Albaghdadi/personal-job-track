<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI calls go through `src/lib/extraction.functions.ts` (createServerFn + requireSupabaseAuth) into `src/lib/extraction.server.ts` (Lovable AI Gateway, model `openai/gpt-6-astra`); the browser never sees `LOVABLE_API_KEY`.
- `src/start.ts` registers `attachSupabaseAuth` as global functionMiddleware so server functions receive the user's bearer token; keep it when editing start.ts.
