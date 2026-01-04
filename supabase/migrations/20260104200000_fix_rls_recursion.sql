-- Migration: Fix Infinite Recursion in RLS policies by using SECURITY DEFINER function

-- 1. Create a function to check user role that bypasses RLS
CREATE OR REPLACE FUNCTION public.check_user_role(required_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct query on accounts table, bypassing RLS due to SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 FROM accounts
    WHERE id = auth.uid()
    AND role = required_role
  );
END;
$$;

-- 2. Update cyclic policies on appointments table
DROP POLICY "ministry_view_appointments" ON "public"."appointments";
CREATE POLICY "ministry_view_appointments" ON "public"."appointments"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (check_user_role('ministry'));

-- 3. Update cyclic policies on hospitals table
DROP POLICY "ministry_manage_hospitals" ON "public"."hospitals";
CREATE POLICY "ministry_manage_hospitals" ON "public"."hospitals"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (check_user_role('ministry'))
    WITH CHECK (check_user_role('ministry'));

-- 4. Update cyclic policies on hospital_departments table
DROP POLICY "ministry_manage_departments" ON "public"."hospital_departments";
CREATE POLICY "ministry_manage_departments" ON "public"."hospital_departments"
    AS PERMISSIVE FOR ALL TO authenticated
    USING (check_user_role('ministry'))
    WITH CHECK (check_user_role('ministry'));
