-- Financial Dashboard Database Schema for Supabase
-- Run these commands in Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    order_date DATE NOT NULL,
    client_name TEXT NOT NULL,
    order_details TEXT NOT NULL,
    transaction_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    vat_percent DECIMAL(5,2) NOT NULL DEFAULT 17,
    total_payment DECIMAL(10,2) NOT NULL DEFAULT 0,
    project_receipts DECIMAL(10,2) NOT NULL DEFAULT 0,
    remaining_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    project_notes TEXT,
    invoice_issued BOOLEAN DEFAULT FALSE,
    activation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create workspace_users table for multi-user access
CREATE TABLE IF NOT EXISTS workspace_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(workspace_id, user_id)
);

-- Create user_profiles table to store additional user info
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they have access to" ON workspaces
    FOR SELECT USING (
        id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Workspace owners can update workspaces" ON workspaces
    FOR UPDATE USING (
        id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Workspace owners can delete workspaces" ON workspaces
    FOR DELETE USING (
        id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their workspaces" ON projects
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create projects in their workspaces" ON projects
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update projects in their workspaces" ON projects
    FOR UPDATE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete projects in their workspaces" ON projects
    FOR DELETE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for workspace_users
CREATE POLICY "Users can view workspace memberships they're part of" ON workspace_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Workspace admins can manage memberships" ON workspace_users
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to automatically add workspace creator as owner
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.workspace_users (workspace_id, user_id, role)
    VALUES (new.id, new.created_by, 'owner');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add workspace creator as owner
CREATE TRIGGER on_workspace_created
    AFTER INSERT ON workspaces
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_workspace();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();