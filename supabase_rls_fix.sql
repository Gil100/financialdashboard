-- Fix infinite recursion in workspace_users RLS policies
-- Run this in Supabase SQL Editor

-- First, drop all existing policies on workspace_users
DROP POLICY IF EXISTS "Users can view their workspace memberships" ON workspace_users;
DROP POLICY IF EXISTS "Users can insert their workspace memberships" ON workspace_users;
DROP POLICY IF EXISTS "Users can update their workspace memberships" ON workspace_users;
DROP POLICY IF EXISTS "Users can delete their workspace memberships" ON workspace_users;
DROP POLICY IF EXISTS "Workspace users policy" ON workspace_users;

-- Create simple, non-recursive policies for workspace_users
CREATE POLICY "workspace_users_select_policy" ON workspace_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "workspace_users_insert_policy" ON workspace_users
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_users_update_policy" ON workspace_users
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "workspace_users_delete_policy" ON workspace_users
    FOR DELETE USING (user_id = auth.uid());

-- Also check workspaces policies - make them simple
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON workspaces;
DROP POLICY IF EXISTS "Users can insert workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update workspaces they own" ON workspaces;
DROP POLICY IF EXISTS "Users can delete workspaces they own" ON workspaces;

-- Create simple workspace policies
CREATE POLICY "workspaces_select_policy" ON workspaces
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "workspaces_insert_policy" ON workspaces
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "workspaces_update_policy" ON workspaces
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "workspaces_delete_policy" ON workspaces
    FOR DELETE USING (created_by = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;