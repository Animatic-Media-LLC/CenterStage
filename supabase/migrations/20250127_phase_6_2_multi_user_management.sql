-- =====================================================
-- PHASE 6.2: MULTI-USER MANAGEMENT SYSTEM
-- =====================================================
-- This migration adds:
-- 1. Project-user assignment table
-- 2. Password management for super admins
-- 3. Updated RLS policies for role-based access control
-- =====================================================

-- =====================================================
-- ADD PASSWORD STORAGE FOR SUPER ADMIN MANAGEMENT
-- =====================================================
-- Super admins need to view/change user passwords
-- Store plaintext password alongside hash (encrypted at app layer)
ALTER TABLE users ADD COLUMN password_plain VARCHAR(255);

-- Update existing users to have NULL password_plain
-- Super admins will need to reset passwords for existing users
COMMENT ON COLUMN users.password_plain IS 'Plaintext password for super admin management - should be encrypted at application layer';

-- =====================================================
-- PROJECT-USER ASSIGNMENT TABLE
-- =====================================================
CREATE TABLE project_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Prevent duplicate assignments
    UNIQUE(project_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_project_users_project_id ON project_users(project_id);
CREATE INDEX idx_project_users_user_id ON project_users(user_id);
CREATE INDEX idx_project_users_assigned_by ON project_users(assigned_by);

-- =====================================================
-- HELPER FUNCTION: Check if user is super admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Check if user has access to project
-- =====================================================
CREATE OR REPLACE FUNCTION has_project_access(user_id UUID, project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admins have access to all projects
    IF is_super_admin(user_id) THEN
        RETURN true;
    END IF;

    -- Check if user is assigned to project
    RETURN EXISTS (
        SELECT 1 FROM project_users
        WHERE project_users.user_id = user_id
        AND project_users.project_id = project_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE RLS POLICIES FOR ROLE-BASED ACCESS
-- =====================================================

-- DROP OLD POLICIES
DROP POLICY IF EXISTS "Authenticated users can view all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update all projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can view all presentation configs" ON presentation_config;
DROP POLICY IF EXISTS "Authenticated users can create presentation configs" ON presentation_config;
DROP POLICY IF EXISTS "Authenticated users can update presentation configs" ON presentation_config;
DROP POLICY IF EXISTS "Authenticated users can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON submissions;
DROP POLICY IF EXISTS "Authenticated users can delete submissions" ON submissions;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Super admins can view all users
CREATE POLICY "Super admins can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

-- Users can view themselves
CREATE POLICY "Users can view themselves"
    ON users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Super admins can update all users
CREATE POLICY "Super admins can update all users"
    ON users FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

-- Super admins can create new users
CREATE POLICY "Super admins can create users"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

-- Super admins can delete users
CREATE POLICY "Super admins can delete users"
    ON users FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

-- =====================================================
-- PROJECT_USERS TABLE POLICIES
-- =====================================================

ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;

-- Super admins can view all project assignments
CREATE POLICY "Super admins can view all project assignments"
    ON project_users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
    ON project_users FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Super admins can create project assignments
CREATE POLICY "Super admins can create project assignments"
    ON project_users FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Super admins can delete project assignments
CREATE POLICY "Super admins can delete project assignments"
    ON project_users FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================

-- Super admins can view all projects
CREATE POLICY "Super admins can view all projects"
    ON projects FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can view projects they're assigned to
CREATE POLICY "Users can view assigned projects"
    ON projects FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = projects.id
            AND project_users.user_id = auth.uid()
        )
    );

-- Super admins can create projects
CREATE POLICY "Super admins can create projects"
    ON projects FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Super admins can update all projects
CREATE POLICY "Super admins can update all projects"
    ON projects FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can update projects they're assigned to
CREATE POLICY "Users can update assigned projects"
    ON projects FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = projects.id
            AND project_users.user_id = auth.uid()
        )
    );

-- Super admins can delete projects
CREATE POLICY "Super admins can delete projects"
    ON projects FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- =====================================================
-- PRESENTATION_CONFIG TABLE POLICIES
-- =====================================================

-- Super admins can view all presentation configs
CREATE POLICY "Super admins can view all presentation configs"
    ON presentation_config FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can view configs for assigned projects
CREATE POLICY "Users can view assigned project configs"
    ON presentation_config FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = presentation_config.project_id
            AND project_users.user_id = auth.uid()
        )
    );

-- Super admins can create presentation configs
CREATE POLICY "Super admins can create presentation configs"
    ON presentation_config FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can create configs for assigned projects
CREATE POLICY "Users can create configs for assigned projects"
    ON presentation_config FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = presentation_config.project_id
            AND project_users.user_id = auth.uid()
        )
    );

-- Super admins can update all presentation configs
CREATE POLICY "Super admins can update all presentation configs"
    ON presentation_config FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can update configs for assigned projects
CREATE POLICY "Users can update configs for assigned projects"
    ON presentation_config FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = presentation_config.project_id
            AND project_users.user_id = auth.uid()
        )
    );

-- =====================================================
-- SUBMISSIONS TABLE POLICIES
-- =====================================================

-- Keep public policies unchanged
-- "Public can insert submissions" - already exists
-- "Public can view approved submissions" - already exists

-- Super admins can view all submissions
CREATE POLICY "Super admins can view all submissions"
    ON submissions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can view submissions for assigned projects
CREATE POLICY "Users can view assigned project submissions"
    ON submissions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = submissions.project_id
            AND project_users.user_id = auth.uid()
        )
    );

-- Super admins can update all submissions
CREATE POLICY "Super admins can update all submissions"
    ON submissions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can update submissions for assigned projects
CREATE POLICY "Users can update assigned project submissions"
    ON submissions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = submissions.project_id
            AND project_users.user_id = auth.uid()
        )
    );

-- Super admins can delete all submissions
CREATE POLICY "Super admins can delete all submissions"
    ON submissions FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can delete submissions for assigned projects
CREATE POLICY "Users can delete assigned project submissions"
    ON submissions FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = submissions.project_id
            AND project_users.user_id = auth.uid()
        )
    );

-- =====================================================
-- TEAMS TABLE POLICIES (Keep unchanged)
-- =====================================================
-- Teams are optional and not part of Phase 6.2
-- Keep existing policies for backward compatibility

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE project_users IS 'Assignment table linking users to projects they can access';
COMMENT ON COLUMN project_users.assigned_by IS 'Super admin who created this assignment';

COMMENT ON FUNCTION is_super_admin IS 'Helper function to check if a user has super_admin role';
COMMENT ON FUNCTION has_project_access IS 'Helper function to check if a user can access a specific project';
