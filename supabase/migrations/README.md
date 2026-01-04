# Supabase Migrations

This directory contains SQL migrations for the Verified.Doctor database.

## Current Remote Migrations

The following migrations exist in the production Supabase database:

| Version | Name | Description |
|---------|------|-------------|
| 20251230171857 | create_profiles_table | Core profiles table |
| 20251230171917 | create_connections_table | Doctor-to-doctor connections |
| 20251230171919 | create_invites_table | Invite system |
| 20251230171920 | create_recommendations_table | Patient recommendations |
| 20251230171943 | create_messages_table | Patient-to-doctor messaging |
| 20251230171944 | create_verification_documents_table | Verification uploads |
| 20251230171946 | create_profile_views_table | Profile view tracking |
| 20251230171958 | create_increment_functions | Counter functions |
| 20251230173713 | add_profiles_insert_policy | RLS for profile creation |
| 20251230174110 | add_recommendations_messages_policies | RLS policies |
| 20251230180516 | add_connection_count_functions | Connection counter functions |
| 20251230180529 | add_invites_connections_rls | RLS for invites/connections |
| 20251230182639 | add_profile_enhancements | Bio, qualifications, etc |
| 20251231034201 | create_analytics_events_table | Event tracking |
| 20251231034212 | create_analytics_daily_stats_table | Daily aggregated stats |
| 20251231034227 | add_admin_message_columns | Admin messaging features |
| 20251231034245 | create_update_daily_stats_function | Stats aggregation function |
| 20251231043328 | add_account_freeze_and_automation | Account freeze, email automation |
| 20260101080010 | enable_rls_automation_tables | RLS for automation tables |
| 20260101080042 | fix_function_search_paths | Security: function search paths |
| 20260101100141 | add_profile_builder_fields | Profile builder fields |
| 20260103020456 | create_contact_messages_table | Contact form submissions |
| 20260103020518 | add_invites_expiration | Invite expiration feature |
| 20260103020539 | add_automation_rls_policies | RLS for automation |
| 20260103020607 | cleanup_duplicate_rls_policies | RLS cleanup |
| 20260104011608 | create_admin_audit_logs_table | Admin audit trail |
| 20260104012217 | fix_rls_policy_performance | RLS performance fixes |
| 20260104012253 | fix_function_search_path | Security: search path fix |
| 20260104014033 | add_layout_and_theme_columns | Profile layout/theme options |

## Pulling Remote Migrations Locally

To pull migrations from remote to local for version control:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref qofqsqgqhyxlwmdpqhjo

# Pull remote migrations
supabase db pull
```

## Creating New Migrations

```bash
# Create a new migration
supabase migration new your_migration_name

# Apply locally
supabase db reset

# Push to remote
supabase db push
```

## TypeScript Types

Types are generated and stored in `src/types/database.ts`. To regenerate:

```bash
pnpm db:generate
```

Or via Supabase MCP in Claude Code.
