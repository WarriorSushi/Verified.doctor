-- Add columns to messages table for admin messages and soft delete
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_admin_message BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS admin_sender_name TEXT;
