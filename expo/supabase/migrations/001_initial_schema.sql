-- Jobii Database Schema Migration
-- Single Database Strategy with is_test flag for test data separation
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('organizer', 'participant')),
  credits INTEGER DEFAULT 6,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_test BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Index for faster phone lookups
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_test ON public.users(is_test);

-- ============================================
-- TENDERS TABLE (Jobs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tenders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  pay INTEGER NOT NULL,
  quota INTEGER NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_test BOOLEAN DEFAULT FALSE
);

-- Indexes for faster queries
CREATE INDEX idx_tenders_organizer ON public.tenders(organizer_id);
CREATE INDEX idx_tenders_status ON public.tenders(status);
CREATE INDEX idx_tenders_date ON public.tenders(date);
CREATE INDEX idx_tenders_is_test ON public.tenders(is_test);

-- ============================================
-- INVITES TABLE (Linking Users <-> Tenders)
-- ============================================
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_test BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_invites_tender ON public.invites(tender_id);
CREATE INDEX idx_invites_user ON public.invites(user_id);
CREATE INDEX idx_invites_status ON public.invites(status);
CREATE INDEX idx_invites_is_test ON public.invites(is_test);

-- Unique constraint: One user can't be invited to the same tender twice
CREATE UNIQUE INDEX idx_invites_unique ON public.invites(tender_id, user_phone);

-- ============================================
-- CONTACTS TABLE (Address Book)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  linked_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tag TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_test BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_contacts_owner ON public.contacts(owner_id);
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_contacts_linked_user ON public.contacts(linked_user_id);
CREATE INDEX idx_contacts_is_test ON public.contacts(is_test);

-- Unique constraint: Owner can't have duplicate phone numbers in their contacts
CREATE UNIQUE INDEX idx_contacts_unique ON public.contacts(owner_id, phone);

-- ============================================
-- GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_test BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_groups_owner ON public.groups(owner_id);
CREATE INDEX idx_groups_is_test ON public.groups(is_test);

-- ============================================
-- GROUP_MEMBERS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_test BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_contact ON public.group_members(contact_id);
CREATE INDEX idx_group_members_is_test ON public.group_members(is_test);

-- Unique constraint: A contact can't be added to the same group twice
CREATE UNIQUE INDEX idx_group_members_unique ON public.group_members(group_id, contact_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON public.tenders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON public.invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Public Access for Development)
-- TODO: Restrict these policies in production!
-- ============================================

-- Users: Public access for now
CREATE POLICY "Public access for users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Tenders: Public access for now
CREATE POLICY "Public access for tenders" ON public.tenders
  FOR ALL USING (true) WITH CHECK (true);

-- Invites: Public access for now
CREATE POLICY "Public access for invites" ON public.invites
  FOR ALL USING (true) WITH CHECK (true);

-- Contacts: Public access for now
CREATE POLICY "Public access for contacts" ON public.contacts
  FOR ALL USING (true) WITH CHECK (true);

-- Groups: Public access for now
CREATE POLICY "Public access for groups" ON public.groups
  FOR ALL USING (true) WITH CHECK (true);

-- Group Members: Public access for now
CREATE POLICY "Public access for group_members" ON public.group_members
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SAMPLE SEED DATA (Test Mode)
-- ============================================
-- Insert test users
INSERT INTO public.users (id, name, phone, role, credits, is_test) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'דני המארגן', '+972501234567', 'organizer', 100, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'שרה המשתתפת', '+972502345678', 'participant', 50, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'יוסי העובד', '+972503456789', 'participant', 20, true)
ON CONFLICT (phone) DO NOTHING;

-- Insert test tender
INSERT INTO public.tenders (id, organizer_id, title, description, location, date, start_time, end_time, pay, quota, status, is_test) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'מלצרים לאירוע', 'דרושים מלצרים מנוסים', 'תל אביב', CURRENT_DATE + INTERVAL '7 days', '18:00', '23:00', 150, 5, 'open', true)
ON CONFLICT DO NOTHING;

-- Insert test contact
INSERT INTO public.contacts (id, owner_id, name, phone, tag, notes, is_test) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'משה המלצר', '+972504567890', 'מלצר', 'עובד מצוין, זמין בסופי שבוע', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS (Optional - for easier querying)
-- ============================================

-- View: Tenders with organizer info and invite counts
CREATE OR REPLACE VIEW public.tenders_with_details AS
SELECT 
  t.*,
  u.name AS organizer_name,
  u.phone AS organizer_phone,
  COUNT(CASE WHEN i.status = 'accepted' THEN 1 END) AS accepted_count,
  COUNT(CASE WHEN i.status = 'pending' THEN 1 END) AS pending_count
FROM public.tenders t
LEFT JOIN public.users u ON t.organizer_id = u.id
LEFT JOIN public.invites i ON t.id = i.tender_id
GROUP BY t.id, u.name, u.phone;

-- View: Groups with member counts
CREATE OR REPLACE VIEW public.groups_with_counts AS
SELECT 
  g.*,
  u.name AS owner_name,
  COUNT(gm.id) AS member_count
FROM public.groups g
LEFT JOIN public.users u ON g.owner_id = u.id
LEFT JOIN public.group_members gm ON g.id = gm.group_id
GROUP BY g.id, u.name;

-- ============================================
-- FUNCTIONS (Utility)
-- ============================================

-- Function: Get available tenders for a user (not already invited)
CREATE OR REPLACE FUNCTION get_available_tenders(user_phone_param TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  date DATE,
  start_time TEXT,
  end_time TEXT,
  pay INTEGER,
  quota INTEGER,
  status TEXT,
  organizer_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.location,
    t.date,
    t.start_time,
    t.end_time,
    t.pay,
    t.quota,
    t.status,
    u.name AS organizer_name
  FROM public.tenders t
  LEFT JOIN public.users u ON t.organizer_id = u.id
  WHERE t.status = 'open'
    AND t.is_test = false
    AND NOT EXISTS (
      SELECT 1 FROM public.invites i 
      WHERE i.tender_id = t.id 
      AND i.user_phone = user_phone_param
    )
  ORDER BY t.date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.users IS 'User accounts for both organizers and participants';
COMMENT ON TABLE public.tenders IS 'Job postings created by organizers';
COMMENT ON TABLE public.invites IS 'Invitations sent to users for specific tenders';
COMMENT ON TABLE public.contacts IS 'User address book for quick access to frequently contacted people';
COMMENT ON TABLE public.groups IS 'Contact groups for bulk operations';
COMMENT ON TABLE public.group_members IS 'Many-to-many relationship between groups and contacts';
COMMENT ON COLUMN public.users.credits IS 'Token balance for creating tenders (2 tokens per tender)';
COMMENT ON COLUMN public.users.is_test IS 'Flag to separate test data from production data';
COMMENT ON COLUMN public.tenders.quota IS 'Maximum number of participants needed';
COMMENT ON COLUMN public.invites.is_guest IS 'True if the invited person is not a registered user';
COMMENT ON COLUMN public.contacts.linked_user_id IS 'Reference to users table if contact is a registered user';
COMMENT ON COLUMN public.contacts.tag IS 'User-defined label like "Waiter", "Manager"';
COMMENT ON COLUMN public.contacts.notes IS 'Free text notes about the contact';
