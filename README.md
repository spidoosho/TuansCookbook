# Tuan's cookbook

> https://tuans-cookbook.vercel.app

Browse and enjoy my recipes on my website hosted on [Vercel](https://tuans-cookbook.vercel.app/)!

If you guess my secret, then you can add your recipe :p

Used [React.js](https://react.dev/) + [Vite](https://vite.dev/), with recipes stored in DynamoDB.

## How it fits together

- `src/` is the React app. It only talks to `/api`; it never sees AWS keys or the secret code.
- `api/` holds the Vercel serverless functions that read and write DynamoDB:
  - `GET /api/recipes` lists every recipe, `GET /api/recipes?name=…` fetches one.
  - `POST /api/recipes` with `{ code, recipe }` adds a recipe. The code is checked on the server and existing recipes are never overwritten.
  - `POST /api/unlock` with `{ code }` checks the code before showing the add form.

## Environment variables

Set these in Vercel (Project → Settings → Environment Variables) and in a local `.env`:

| Name | What |
| --- | --- |
| `DYNAMODB_REGION` | AWS region of the `Recipes` table |
| `DYNAMODB_ACCESS_KEY_ID` | IAM access key |
| `DYNAMODB_SECRET_ACCESS_KEY` | IAM secret key |
| `RECIPE_CODE` | The secret code needed to add recipes |

Don't prefix these with `VITE_`: Vite copies every `VITE_*` variable the app uses into the public JavaScript bundle. The old `VITE_DYNAMODB_*` / `VITE_CODE` names are still read by the server as a fallback so an existing deployment keeps working, but rename them when you can.

The IAM user only needs `dynamodb:Scan`, `dynamodb:GetItem` and `dynamodb:PutItem` on the `Recipes` table.

## Running locally

```bash
npm install
npm run dev
```

`npm run dev` serves the `api/` functions too, using the variables in `.env`, so `vercel dev` isn't required.

Locally, the AWS keys can come from `~/.aws/credentials` (the standard AWS file; note it has no `.txt` extension) instead of `.env`. The region and code still need setting, e.g. a `.env` with:

```
DYNAMODB_REGION=eu-central-1
RECIPE_CODE=your-code
```
