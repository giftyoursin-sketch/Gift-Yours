# Gift Yours — Project Architecture

## Overview

This is a monorepo-style single-repository containing two independent applications:

| App | Dev Route | Production Domain |
|-----|-----------|-------------------|
| Business Management | \/business/*\ | \usiness.giftyours.com\ |
| E-commerce Website | \/*\ | \giftyours.com\ |

## Folder Structure

\\\\ngift-yours/
+-- apps/
¦   +-- business/          # Business Management System (complete)
¦   +-- ecommerce/         # Customer E-commerce Website (Phase 2)
+-- shared/                # Shared components, hooks, utils, types
+-- supabase/
¦   +-- client/            # Shared Supabase browser client
¦   +-- server/            # SSR / Edge client (future)
¦   +-- auth/              # Auth utilities (future)
¦   +-- queries/           # Shared DB queries (future)
¦   +-- storage/           # Storage helpers (future)
¦   +-- realtime/          # Realtime subscriptions (future)
+-- database/              # SQL schema and seed files
+-- packages/              # Shared npm packages (future)
+-- docs/                  # Project documentation
+-- public/                # Static assets
+-- src/                   # Vite entry point (main.jsx)
\\\\n
## Path Aliases (Vite)

| Alias | Resolves To |
|-------|------------|
| \@business\ | \pps/business\ |
| \@ecommerce\ | \pps/ecommerce\ |
| \@shared\ | \shared\ |
| \@supabaseClient\ | \supabase/client/index.js\ |

## Deployment

Both apps are deployed independently on Vercel using separate Vercel projects
pointing at the same Git repository, but with different root directories.
