# TezTap — Быстрые подработки в Бишкеке

Mobile MVP for short-term jobs / подработки in Bishkek, Kyrgyzstan.

Users open the app and see one short-term job card at a time. They can skip, save, or contact the employer.

## Features

- **Job Feed** — One approved job at a time (no long lists)
- **Saved Jobs** — Bookmark interesting opportunities
- **Submit Job** — Guided multi-step form for employers
- **Admin Review** — Approve/reject submitted jobs before they go public

## How to Install

```bash
# Clone or copy the project
cd TezTap

# Install dependencies
npm install

# Create local environment file
cp .env.example environment.env
```

## How to Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run `supabase/schema.sql` to create tables and policies   - This file includes `jobs`, `saved_jobs`, and `employers`4. Run `supabase/seed.sql` to add 15 sample jobs
5. Copy your project URL, anon key, and local admin code into `environment.env`.
   This file is ignored by Git and must not be committed:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_ADMIN_CODE=change-this-local-admin-code
```

## SQL Schema

### `jobs` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Job title |
| description | text | Job description |
| payment | text | Payment info (e.g. "1500 сом / день") |
| duration | text | Duration (e.g. "Сегодня", "3–7 дней") |
| schedule | text | Schedule (e.g. "09:00–18:00") |
| location | text | Location |
| experience | text | Experience requirement |
| company_name | text | Company name |
| contact_url | text | Telegram URL, username, or phone |
| status | text | pending / approved / rejected |
| is_active | boolean | Whether job is visible in feed |
| created_at | timestamptz | Creation timestamp |
| closed_at | timestamptz | When job was closed |

### `saved_jobs` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| job_id | uuid | Reference to jobs table |
| device_id | text | Device identifier |
| created_at | timestamptz | When saved |

## How to Seed Jobs

Run `supabase/seed.sql` in the Supabase SQL Editor. It inserts 15 approved, active jobs with realistic Bishkek data.

## How to Run Expo

```bash
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## How to Test Employer Submission

1. Open the app
2. Go to **Разместить** tab
3. Fill out the 9-step form (each step validates input)
4. Review the preview card
5. Tap **Отправить**
6. The job is saved with `status = "pending"` and `is_active = false`

## How to Approve Jobs

1. Open the app
2. Tap the admin lock icon in the top-right header, or long-press the TezTap logo 5 times
3. Enter the admin code from `EXPO_PUBLIC_ADMIN_CODE` in `environment.env`
4. Review pending jobs one by one
5. Tap **Опубликовать** to approve or **Отклонить** to reject
6. Approved jobs immediately appear in the public feed

## Tech Stack

- React Native + Expo
- TypeScript
- Supabase (PostgreSQL)
- React Navigation (bottom tabs + stack)
- Zustand (state management)
- Expo SecureStore (device ID storage)

## Project Structure

```
TezTap/
├── App.tsx                          # Root app with navigation
├── supabase/
│   ├── schema.sql                   # Database schema + RLS policies
│   └── seed.sql                     # 15 sample jobs
├── src/
│   ├── screens/
│   │   ├── WelcomeScreen.tsx        # Welcome / landing screen
│   │   ├── JobFeedScreen.tsx        # One job at a time feed
│   │   ├── SavedJobsScreen.tsx      # Saved jobs list
│   │   ├── SubmitJobScreen.tsx      # Multi-step employer form
│   │   ├── AdminAuthScreen.tsx      # Admin code entry
│   │   └── AdminReviewScreen.tsx    # Approve/reject pending jobs
│   ├── components/
│   │   ├── JobCard.tsx              # Public job card component
│   │   └── AdminJobCard.tsx         # Admin review job card
│   ├── store/
│   │   └── appStore.ts              # Zustand state management
│   ├── supabase/
│   │   └── client.ts                # Supabase client + queries
│   ├── types/
│   │   ├── index.ts                 # TypeScript types
│   │   └── navigation.ts            # Navigation type definitions
│   ├── utils/
│   │   ├── theme.ts                 # Design tokens (colors, spacing)
│   │   └── deviceId.ts              # Device ID generation + storage
│   └── navigation/
│       └── MainTabs.tsx             # Bottom tab navigator
├── .env.example                     # Environment variables template
├── environment.env                  # Local ignored environment variables
└── app.json                         # Expo configuration
```

## Design

- Dark background (#0F0F0F) with orange accent (#FF8C00)
- Card-based, premium look
- Large typography, strong CTA buttons
- All user-facing text in Russian
