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
- Use the shared Hotmart checkout-link catalog for subscription CTAs and read live billing records independently of Stripe browser tokens, so Hotmart access does not depend on Stripe activation.
- Route all dashboard section selections through one navigation handler so sidebar expansion and scroll reset stay consistent across menus and quick actions.
- Reuse operational-list helpers for initial limits and customer/order searches so the three operational lists follow the same rules.
- Use warranties.order_number for the public number and retain warranties.code as the unique authenticity identifier; different organizations can have the same OS number.
- Persist service-order edits through edit_service_order so equipment, totals and existing financial income update atomically.
- Store order photos in private storage with organization/order-scoped metadata and refresh signed URLs when opening documents to preserve confidentiality and printable access.
- Issue immutable quote snapshots through authenticated RPCs and accept decisions through random expiring capability tokens with locked transactional order validation to avoid approving changed amounts.
- Share paper-size settings across OS and warranty printing so standard and thermal printers use the same document content.
- Generate shareable order and warranty PDFs on demand in the browser with private photos; use native file sharing or downloads and recipient-specific WhatsApp notices, never claim wa.me attaches files or confirms delivery.
- Derive the public SVG favicon from the login's wrench icon and reference it in the root head so the site icon matches the product identity.
