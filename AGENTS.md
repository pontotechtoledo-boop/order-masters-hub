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

- Keep all PontoTech visual roles centralized as semantic tokens in `src/styles.css` so every screen stays theme-consistent.
- Keep subscription rules in a shared domain module and enforce writes in database triggers; client UI is never an access boundary.
- Process signed Paddle events transactionally through a service-role-only database function with event deduplication and chronological subscription updates.
- Resolve checkout through authenticated server-created transactions bound to the organization's authorized billing manager; never trust checkout custom data supplied directly by the browser.
- Reuse the subscription page in the dashboard and dedicated authenticated billing route so both entry points share checkout and status behavior.
