# Supabase Magic Link MVP

A small, deployable, passwordless authentication MVP. The code is split by responsibility and uses no build step or frontend framework.

## Project structure

```text
supabase-magic-link-mvp/
├── index.html       # Page structure
├── css/
│   └── styles.css   # Responsive styling
├── js/
│   ├── config.js    # Public Supabase project config
│   └── app.js       # Auth and UI logic
├── .gitignore
└── README.md
```

## 1. Configure Supabase

1. Create a project at https://supabase.com/dashboard.
2. In `js/config.js`, replace:
   - `SUPABASE_URL` with the Project URL.
   - `SUPABASE_PUBLISHABLE_KEY` with the project's publishable key or legacy anon key.
3. In Supabase Authentication settings, enable the Email provider.
4. Under Authentication → URL Configuration, add your local and deployed URLs to the allowed redirect URLs.
5. Configure custom SMTP for reliable production email delivery, if required.

**Security:** The publishable/anon key is intended for browser use. Never expose the `service_role` key or any secret key in this app. Apply Row Level Security (RLS) to any tables containing user data.

## 2. Run locally

You need Python 3 or another static HTTP server. From this project folder run:

```bash
python -m http.server 8000
```

Open http://localhost:8000

Opening the HTML file directly with `file://` is not recommended because browser module imports and auth redirects work best over HTTP.

## 3. Deploy

This is a static site; no build command is needed.

### Netlify
- Import the folder/repository or drag the project folder into Netlify's manual deploy UI.
- Build command: leave blank.
- Publish directory: `.` (the project root).
- Add the final site URL to Supabase's allowed redirect URLs.

### Vercel
- Import the Git repository.
- Framework preset: Other.
- Build command: leave blank.
- Output directory: `.`.
- Add the final site URL to Supabase's allowed redirect URLs.

You can also host the files on any static web host that serves HTML, CSS, and JavaScript modules over HTTPS.

## MVP behavior

- Email magic-link sign-in through Supabase Auth.
- Session restore and auth callback detection.
- Signed-in state with email display.
- Sign-out.
- Responsive UI, accessible status announcements, and loading state.

## Before production

- Use HTTPS and configure your own domain.
- Configure SMTP and review the email template.
- Add RLS policies for protected data.
- Add any required privacy, terms, abuse protection, and monitoring for your use case.
