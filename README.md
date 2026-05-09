# TezTap

Mobile MVP for short-term jobs in Bishkek, Kyrgyzstan.

Users open the app and see one approved job card at a time. They can skip, save, or contact the employer. Employers can submit jobs through a guided form, and admins approve jobs before they appear in the public feed.

## Features

- **Job Feed**: one approved job at a time, without long lists
- **Saved Jobs**: bookmark interesting opportunities
- **Employer Portal**: employer onboarding, verification status, and job management
- **Submit Job**: guided multi-step form for employers
- **Worker Profile**: worker onboarding, verification, and application history
- **Admin Review**: approve or reject employers, workers, and submitted jobs

## Installation

```bash
# Clone or copy the project
cd TezTap

# Install dependencies
npm install

# Create the local environment file
cp .env.example environment.env
```

Edit `environment.env` with your local values. This file is ignored by Git and must not be committed.

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_ADMIN_CODE=change-this-local-admin-code
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in the Supabase dashboard.
3. Run `supabase/schema.sql` to create the tables, policies, triggers, and storage setup.
4. Run `supabase/seed.sql` if you want sample jobs for local testing.
5. Copy the project URL and anon key into `environment.env`.

Phone authentication requires an SMS provider in Supabase Auth settings. Email authentication may require custom SMTP for production traffic and reliable rate limits.

## Database Overview

### `jobs`

| Column       | Type        | Description                            |
| ------------ | ----------- | -------------------------------------- |
| id           | uuid        | Primary key                            |
| title        | text        | Job title                              |
| description  | text        | Job description                        |
| payment      | text        | Payment details                        |
| duration     | text        | Job duration                           |
| schedule     | text        | Work schedule                          |
| location     | text        | Job location                           |
| experience   | text        | Experience requirement                 |
| company_name | text        | Company name                           |
| contact_url  | text        | Telegram URL, username, or phone       |
| status       | text        | pending / approved / rejected          |
| is_active    | boolean     | Whether the job is visible in the feed |
| created_at   | timestamptz | Creation timestamp                     |
| closed_at    | timestamptz | Close timestamp                        |

### `saved_jobs`

| Column     | Type        | Description         |
| ---------- | ----------- | ------------------- |
| id         | uuid        | Primary key         |
| job_id     | uuid        | Reference to `jobs` |
| device_id  | text        | Device identifier   |
| created_at | timestamptz | Save timestamp      |

The schema also includes user profiles, employer profiles, worker profiles, job applications, verification flows, and storage policies for worker documents.

## Running The App

Use the npm scripts so Expo loads `environment.env`:

```bash
npm run start
```

Then:

- Press `i` for the iOS simulator.
- Press `a` for the Android emulator.
- Scan the QR code with Expo Go or use the custom development client.

For native rebuilds:

```bash
npm run ios
npm run android
```

## Code Quality

The project uses TypeScript, ESLint, Prettier, Husky, lint-staged, commitlint, and GitHub Actions.

Run the full local validation before opening a pull request:

```bash
npm run validate
```

Individual checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run audit
```

Local Git hooks run automatically:

- `pre-commit`: runs lint-staged on changed files.
- `commit-msg`: validates Conventional Commit messages.

Commit messages should follow this style:

```text
feat: add worker onboarding validation
fix: handle Supabase auth rate limit
chore: update project tooling
```

## Employer Flow

1. Open the app.
2. Sign up or sign in as an employer.
3. Complete the employer profile.
4. Wait for admin approval.
5. Submit a job through the guided job form.
6. The job is saved with `status = "pending"` and `is_active = false`.
7. After admin approval, the job appears in the public feed.

## Worker Flow

1. Open the app.
2. Sign up or sign in as a worker.
3. Complete worker onboarding.
4. Optionally upload verification documents.
5. Browse approved jobs in the feed.
6. Save jobs or apply/contact the employer depending on the job state.

## Admin Flow

1. Open the app.
2. Tap the admin lock icon in the top-right header, or long-press the TezTap logo five times.
3. Enter the admin code from `EXPO_PUBLIC_ADMIN_CODE` in `environment.env`.
4. Review pending employers, workers, and jobs.
5. Approve or reject submitted records.
6. Approved jobs immediately appear in the public feed.

## Tech Stack

- React Native + Expo
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- React Navigation
- Zustand
- Expo SecureStore
- Lucide React Native icons

## Project Structure

```text
TezTap/
├── App.tsx
├── app.json
├── index.ts
├── package.json
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── auth/
│   ├── components/
│   ├── navigation/
│   ├── screens/
│   ├── store/
│   ├── supabase/
│   ├── types/
│   └── utils/
├── .env.example
├── .env
└── README.md
```

## Design

- Dark interface with orange accent color
- Card-based mobile UI
- Large touch targets for fast job browsing
- Icon-based actions instead of emoji
- User-facing app text is currently Russian

## Security Notes

- `environment.env` is ignored by Git and should stay local.
- Do not put Supabase service role keys or private provider secrets into Expo `EXPO_PUBLIC_*` variables.
- `EXPO_PUBLIC_*` values are bundled into the client app, so they must be safe for public client usage.
