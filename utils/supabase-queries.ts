import { supabase } from '@/lib/supabase';
import { User, Tender, Contact, Group, Invite, InviteStatus } from '@/types';

export const supabaseQueries = {
  users: {
    getByPhone: async (phone: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (error) throw error;
      return mapUserFromDB(data);
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return mapUserFromDB(data);
    },
    
    create: async (user: { name: string; phone: string; role: 'organizer' | 'participant' }) => {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: user.name,
          phone: user.phone,
          role: user.role,
          credits: user.role === 'organizer' ? 100 : 50,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapUserFromDB(data);
    },
    
    updateCredits: async (userId: string, credits: number) => {
      const { data, error } = await supabase
        .from('users')
        .update({ credits })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return mapUserFromDB(data);
    },
    
    delete: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
  },
  
  tenders: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('tenders')
        .select(`
          *,
          users!tenders_organizer_id_fkey(name, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const tendersWithInvites = await Promise.all(
        data.map(async (tender) => {
          const { data: invites } = await supabase
            .from('invites')
            .select('*')
            .eq('tender_id', tender.id);
          
          return mapTenderFromDB(tender, invites || []);
        })
      );
      
      return tendersWithInvites;
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('tenders')
        .select(`
          *,
          users!tenders_organizer_id_fkey(name, phone)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const { data: invites } = await supabase
        .from('invites')
        .select('*')
        .eq('tender_id', id);
      
      return mapTenderFromDB(data, invites || []);
    },
    
    create: async (tender: {
      organizerId: string;
      title: string;
      description?: string;
      location: string;
      date: Date;
      startTime: string;
      endTime: string;
      pay: number;
      quota: number;
      invites: { userName: string; userPhone: string; userId?: string }[];
    }) => {
      const { data: tenderData, error: tenderError } = await supabase
        .from('tenders')
        .insert({
          organizer_id: tender.organizerId,
          title: tender.title,
          description: tender.description,
          location: tender.location,
          date: tender.date.toISOString().split('T')[0],
          start_time: tender.startTime,
          end_time: tender.endTime,
          pay: tender.pay,
          quota: tender.quota,
        })
        .select(`
          *,
          users!tenders_organizer_id_fkey(name, phone)
        `)
        .single();
      
      if (tenderError) throw tenderError;
      
      if (tender.invites.length > 0) {
        const { error: invitesError } = await supabase
          .from('invites')
          .insert(
            tender.invites.map((invite) => ({
              tender_id: tenderData.id,
              user_id: invite.userId || null,
              user_name: invite.userName,
              user_phone: invite.userPhone,
              is_guest: !invite.userId,
            }))
          );
        
        if (invitesError) throw invitesError;
      }
      
      return supabaseQueries.tenders.getById(tenderData.id);
    },
  },
  
  invites: {
    updateStatus: async (tenderId: string, userId: string, status: InviteStatus) => {
      const { error } = await supabase
        .from('invites')
        .update({ status })
        .eq('tender_id', tenderId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const { data: invites } = await supabase
        .from('invites')
        .select('status')
        .eq('tender_id', tenderId);
      
      const { data: tender } = await supabase
        .from('tenders')
        .select('quota')
        .eq('id', tenderId)
        .single();
      
      if (invites && tender) {
        const acceptedCount = invites.filter((inv) => inv.status === 'accepted').length;
        const newStatus = acceptedCount >= tender.quota ? 'full' : 'open';
        
        await supabase
          .from('tenders')
          .update({ status: newStatus })
          .eq('id', tenderId);
      }
    },
  },
  
  contacts: {
    getByOwner: async (ownerId: string) => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('owner_id', ownerId)
        .order('name');
      
      if (error) throw error;
      return data.map(mapContactFromDB);
    },
    
    create: async (ownerId: string, contact: { name: string; phone: string; tag?: string; notes?: string }) => {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('phone', contact.phone)
        .single();
      
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          owner_id: ownerId,
          name: contact.name,
          phone: contact.phone,
          tag: contact.tag,
          notes: contact.notes,
          linked_user_id: userData?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapContactFromDB(data);
    },
    
    createMultiple: async (ownerId: string, contacts: { name: string; phone: string; tag?: string }[]) => {
      const contactsWithLinkedUsers = await Promise.all(
        contacts.map(async (contact) => {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('phone', contact.phone)
            .single();
          
          return {
            owner_id: ownerId,
            name: contact.name,
            phone: contact.phone,
            tag: contact.tag,
            linked_user_id: userData?.id || null,
          };
        })
      );
      
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsWithLinkedUsers)
        .select();
      
      if (error) throw error;
      return data.map(mapContactFromDB);
    },
    
    update: async (contactId: string, updates: { name?: string; phone?: string; tag?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();
      
      if (error) throw error;
      return mapContactFromDB(data);
    },
    
    delete: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) throw error;
    },
  },
  
  groups: {
    getByOwner: async (ownerId: string) => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(contact_id)
        `)
        .eq('owner_id', ownerId)
        .order('name');
      
      if (error) throw error;
      return data.map(mapGroupFromDB);
    },
  },
};

function mapUserFromDB(data: any): User {
  return {
    id: data.id,
    phone: data.phone,
    name: data.name,
    role: data.role,
    createdAt: new Date(data.created_at),
    credits: data.credits,
  };
}

function mapTenderFromDB(data: any, invitesData: any[]): Tender {
  return {
    id: data.id,
    organizerId: data.organizer_id,
    organizerName: data.users?.name || '',
    title: data.title,
    description: data.description,
    location: data.location,
    date: new Date(data.date),
    startTime: data.start_time,
    endTime: data.end_time,
    pay: data.pay,
    quota: data.quota,
    status: data.status,
    createdAt: new Date(data.created_at),
    invites: invitesData.map(mapInviteFromDB),
  };
}

function mapInviteFromDB(data: any): Invite {
  return {
    userId: data.user_id,
    userName: data.user_name,
    userPhone: data.user_phone,
    status: data.status,
    updatedAt: new Date(data.updated_at),
    isGuest: data.is_guest,
  };
}

function mapContactFromDB(data: any): Contact {
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    groups: [],
    linkedUserId: data.linked_user_id,
    tag: data.tag,
    notes: data.notes,
  };
}

function mapGroupFromDB(data: any): Group {
  return {
    id: data.id,
    name: data.name,
    contactIds: data.group_members?.map((m: any) => m.contact_id) || [],
  };
}
