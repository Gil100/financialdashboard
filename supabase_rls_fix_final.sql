-- FINAL FIX: Complete RLS policy replacement to eliminate infinite recursion
-- This replaces ALL policies with non-recursive versions

-- ============================================================================
-- STEP 1: Drop ALL existing policies to start clean
-- ============================================================================

-- Drop all workspace_users policies
DROP POLICY IF EXISTS "Workspace admins can manage memberships" ON workspace_users;
DROP POLICY IF EXISTS "Users can view workspace memberships they're part of" ON workspace_users;
DROP POLICY IF EXISTS "Users can view their own workspace memberships" ON workspace_users;
DROP POLICY IF EXISTS "Users can insert workspace memberships when creating workspace" ON workspace_users;
DROP POLICY IF EXISTS "Workspace creators can manage all memberships" ON workspace_users;

-- Drop all workspaces policies  
DROP POLICY IF EXISTS "Users can view workspaces they have access to" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they created or are members of" ON workspaces;
DROP POLICY IF EXISTS "Users can insert workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update workspaces they own" ON workspaces;
DROP POLICY IF EXISTS "Users can delete workspaces they own" ON workspaces;

-- ============================================================================
-- STEP 2: Create simple, non-recursive policies
-- ============================================================================

-- WORKSPACE_USERS policies (no reference to workspaces table)
CREATE POLICY "workspace_users_select" ON workspace_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "workspace_users_insert" ON workspace_users  
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_users_update" ON workspace_users
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "workspace_users_delete" ON workspace_users
    FOR DELETE USING (user_id = auth.uid());

-- WORKSPACES policies (ONLY check created_by, NO workspace_users reference)
CREATE POLICY "workspaces_select" ON workspaces
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "workspaces_insert" ON workspaces
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "workspaces_update" ON workspaces  
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "workspaces_delete" ON workspaces
    FOR DELETE USING (created_by = auth.uid());

-- ============================================================================
-- STEP 3: Ensure RLS is enabled
-- ============================================================================

ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION: Test the policies
-- ============================================================================

-- These queries should work without recursion:
-- SELECT * FROM workspace_users WHERE user_id = auth.uid();
-- SELECT * FROM workspaces WHERE created_by = auth.uid();