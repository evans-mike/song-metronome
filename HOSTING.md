# Hosting

This repo is deployed as a Netlify project and exposed at a subdomain of
`putchapajamazon.com`, a domain managed in Cloudflare DNS.

## Current configuration

| Item | Value |
|---|---|
| Netlify project | `tempo-notes-e1c513` (site id `6fb9fbe0-0b1c-4c99-9a33-b9d0a6134301`) |
| Default Netlify URL | `https://tempo-notes-e1c513.netlify.app` |
| Custom domain | `https://tempo-notes.putchapajamazon.com` |
| Linked repo | `github.com/evans-mike/song-metronome` |
| DNS zone | `putchapajamazon.com` in Cloudflare (zone id `585d2d65f401be48aa6d327d3d427dc5`) |
| DNS record | `CNAME tempo-notes.putchapajamazon.com -> tempo-notes-e1c513.netlify.app` (DNS-only / grey-clouded, TTL 3600) |
| TLS | Netlify-managed Let's Encrypt certificate, auto-provisioned after DNS resolved |

This follows the same pattern used for other `putchapajamazon.com`
subdomains (see `dotfiles/HOSTING.md` for the reference writeup): a plain
CNAME pointed at the project's `*.netlify.app` hostname, with Netlify's
`custom_domain` field set on the site so Netlify terminates TLS and serves
the project there. The record is **not proxied through Cloudflare**
(`proxied: false`) so Netlify can see the real client and issue its own
certificate.

## How it was set up

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/<zone_id>/dns_records" \
  -H "Authorization: Bearer <cloudflare_api_token>" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"tempo-notes.putchapajamazon.com","content":"tempo-notes-e1c513.netlify.app","ttl":3600,"proxied":false}'

netlify api updateSite --data '{
  "site_id": "6fb9fbe0-0b1c-4c99-9a33-b9d0a6134301",
  "body": { "custom_domain": "tempo-notes.putchapajamazon.com" }
}'

netlify api provisionSiteTLSCertificate --data '{ "site_id": "6fb9fbe0-0b1c-4c99-9a33-b9d0a6134301" }'
```

Netlify's account-level API also enforces a **`custom_domain_changes_per_hour`
limit of 3** across the whole team; if a future domain change 422s, that's
almost certainly why — wait for the hourly window to reset and retry.

## Reproducing / changing this elsewhere

- Do not commit API tokens to this repo. Any Cloudflare or Netlify token
  used to manage this domain should be kept in a password manager / shell
  environment only, and rotated if it is ever pasted into a terminal,
  chat log, or committed file.
- To point a different Netlify project at another `putchapajamazon.com`
  subdomain, repeat the three API calls above with that project's site id
  and desired hostname.
