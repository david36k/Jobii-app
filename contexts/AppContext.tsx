import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import { Tender, Contact, InviteStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseQueries } from '@/utils/supabase-queries';
import { supabase } from '@/lib/supabase';

export const [AppProvider, useApp] = createContextHook(() => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    hydrateAuthState();
  }, []);

  const hydrateAuthState = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('currentUserId');
      if (storedUserId) {
        console.log('[AppContext] Found stored user:', storedUserId);
        setCurrentUserId(storedUserId);
        setGuestMode(false);
      }

      const storedGuestMode = await AsyncStorage.getItem('guestMode');
      if (!storedUserId && storedGuestMode === 'true') {
        setGuestMode(true);
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('[AppContext] Failed to load user:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const currentUserQuery = useQuery({
    queryKey: ['user', currentUserId],
    queryFn: () => supabaseQueries.users.getById(currentUserId!),
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes — user profile changes infrequently
  });

  const tendersQuery = useQuery({
    queryKey: ['tenders'],
    queryFn: () => supabaseQueries.tenders.getAll(),
    staleTime: 1000 * 60 * 2, // 2 minutes — supplemented by realtime invalidation
  });

  const contactsQuery = useQuery({
    queryKey: ['contacts', currentUserId],
    queryFn: () => supabaseQueries.contacts.getByOwner(currentUserId!),
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes — contacts rarely change mid-session
  });

  const groupsQuery = useQuery({
    queryKey: ['groups', currentUserId],
    queryFn: () => supabaseQueries.groups.getByOwner(currentUserId!),
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    console.log('[AppContext] Setting up Realtime subscriptions...');

    let tendersChannel: any;
    let invitesChannel: any;
    let contactsChannel: any;

    try {
      tendersChannel = supabase
        .channel('tenders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tenders',
          },
          (payload) => {
            console.log('[Realtime] Tenders change detected:', payload.eventType);
            queryClient.invalidateQueries({ queryKey: ['tenders'] });
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('[Realtime] Tenders channel error - continuing without realtime');
          }
        });

      invitesChannel = supabase
        .channel('invites-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invites',
          },
          (payload) => {
            console.log('[Realtime] Invites change detected:', payload.eventType);
            queryClient.invalidateQueries({ queryKey: ['tenders'] });
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('[Realtime] Invites channel error - continuing without realtime');
          }
        });

      contactsChannel = supabase
        .channel('contacts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contacts',
          },
          (payload) => {
            console.log('[Realtime] Contacts change detected:', payload.eventType);
            if (currentUserId) {
              queryClient.invalidateQueries({ queryKey: ['contacts', currentUserId] });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('[Realtime] Contacts channel error - continuing without realtime');
          }
        });
    } catch (error) {
      console.error('[Realtime] Failed to setup channels:', error);
    }

    return () => {
      console.log('[AppContext] Cleaning up Realtime subscriptions...');
      try {
        if (tendersChannel) supabase.removeChannel(tendersChannel);
        if (invitesChannel) supabase.removeChannel(invitesChannel);
        if (contactsChannel) supabase.removeChannel(contactsChannel);
      } catch (error) {
        console.error('[Realtime] Cleanup error:', error);
      }
    };
  }, [queryClient, currentUserId]);

  const switchUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await AsyncStorage.setItem('currentUserId', userId);
      await AsyncStorage.removeItem('guestMode');
      return userId;
    },
    onSuccess: (userId) => {
      setCurrentUserId(userId);
      setGuestMode(false);
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['contacts', userId] });
      queryClient.invalidateQueries({ queryKey: ['groups', userId] });
    },
  });

  const addCreditsMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) => {
      return supabaseQueries.users.addCredits(userId, amount);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: { name?: string; phone?: string } }) =>
      supabaseQueries.users.update(userId, updates),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  const createTenderMutation = useMutation({
    mutationFn: (tender: Omit<Tender, 'id' | 'createdAt' | 'status'>) => {
      const { organizerName: _organizerName, invites, ...rest } = tender;
      if (!rest.location) throw new Error('Location is required');
      return supabaseQueries.tenders.create({
        organizerId: rest.organizerId,
        title: rest.title,
        description: rest.description,
        location: rest.location,
        date: rest.date,
        startTime: rest.startTime,
        endTime: rest.endTime,
        pay: rest.pay,
        quota: rest.quota,
        invites: invites.map((i) => ({
          userName: i.userName,
          userPhone: i.userPhone,
          userId: i.userId,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
    },
  });

  const updateInviteStatusMutation = useMutation({
    mutationFn: ({ tenderId, userId, status }: { tenderId: string; userId: string; status: InviteStatus }) =>
      supabaseQueries.invites.updateStatus(tenderId, userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: (contact: { name: string; phone: string; tag?: string; notes?: string }) => {
      if (!currentUserId) throw new Error('No user logged in');
      return supabaseQueries.contacts.create(currentUserId, contact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentUserId] });
    },
  });

  const addMultipleContactsMutation = useMutation({
    mutationFn: (contacts: { name: string; phone: string; tag?: string }[]) => {
      if (!currentUserId) throw new Error('No user logged in');
      return supabaseQueries.contacts.createMultiple(currentUserId, contacts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentUserId] });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ contactId, updates }: { contactId: string; updates: Partial<Contact> }) =>
      supabaseQueries.contacts.update(contactId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentUserId] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => supabaseQueries.contacts.delete(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentUserId] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (userId: string) => supabaseQueries.users.delete(userId),
    onSuccess: async (_, userId) => {
      if (currentUserId === userId) {
        await AsyncStorage.removeItem('currentUserId');
        setCurrentUserId(null);
      }
      queryClient.clear();
    },
  });

  const switchUser = (userId: string) => {
    switchUserMutation.mutate(userId);
  };

  const addCredits = (userId: string, amount: number) => {
    addCreditsMutation.mutate({ userId, amount });
  };

  const updateProfile = async (userId: string, updates: { name?: string; phone?: string }) => {
    return updateProfileMutation.mutateAsync({ userId, updates });
  };

  const createTender = async (tender: Omit<Tender, 'id' | 'createdAt' | 'status'>) => {
    if (!tender.location) {
      throw new Error('Location is required');
    }
    return createTenderMutation.mutateAsync(tender);
  };

  const updateInviteStatus = (tenderId: string, userId: string, status: InviteStatus) => {
    updateInviteStatusMutation.mutate({ tenderId, userId, status });
  };

  const getTenderById = (tenderId: string) => {
    return tendersQuery.data?.find((t) => t.id === tenderId);
  };

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    const result = await addContactMutation.mutateAsync(contact);
    return result;
  };

  const addMultipleContacts = async (contacts: { name: string; phone: string; tag?: string }[]) => {
    const result = await addMultipleContactsMutation.mutateAsync(contacts);
    return result;
  };

  const deleteContact = (contactId: string) => {
    deleteContactMutation.mutate(contactId);
  };

  const updateContact = (contactId: string, updates: Partial<Contact>) => {
    updateContactMutation.mutate({ contactId, updates });
  };

  const deleteAccount = (userId: string) => {
    deleteAccountMutation.mutate(userId);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentUserId');
      await AsyncStorage.removeItem('guestMode');
      setCurrentUserId(null);
      setGuestMode(false);
      queryClient.clear();
    } catch (error) {
      console.error('[AppContext] Logout failed:', error);
    }
  };

  const enterGuestMode = async () => {
    try {
      await AsyncStorage.removeItem('currentUserId');
      await AsyncStorage.setItem('guestMode', 'true');
      setCurrentUserId(null);
      setGuestMode(true);
      queryClient.clear();
    } catch (error) {
      console.error('[AppContext] Enter guest mode failed:', error);
    }
  };

  const exitGuestMode = async () => {
    try {
      await AsyncStorage.removeItem('guestMode');
      setGuestMode(false);
    } catch (error) {
      console.error('[AppContext] Exit guest mode failed:', error);
    }
  };

  return {
    currentUser: currentUserQuery.data || null,
    guestMode,
    switchUser,
    tenders: tendersQuery.data || [],
    contacts: contactsQuery.data || [],
    groups: groupsQuery.data || [],
    createTender,
    updateInviteStatus,
    getTenderById,
    mockUsers: [],
    isInitialized,
    addCredits,
    addContact,
    addMultipleContacts,
    deleteContact,
    updateContact,
    deleteAccount,
    logout,
    updateProfile,
    enterGuestMode,
    exitGuestMode,
  };
});

export const useParticipantTenders = () => {
  const { currentUser, tenders } = useApp();

  return useMemo(() => {
    if (!currentUser) return { active: [], history: [] };

    const now = new Date();

    const userTenders = tenders.filter((tender) =>
      tender.invites.some((invite) => invite.userId === currentUser.id)
    );

    const active = userTenders.filter((tender) => {
      const invite = tender.invites.find((inv) => inv.userId === currentUser.id);
      if (!invite) return false;

      const isPending = invite.status === 'pending';
      const isFutureAccepted = invite.status === 'accepted' && tender.date >= now;

      return isPending || isFutureAccepted;
    });

    const history = userTenders.filter((tender) => {
      const invite = tender.invites.find((inv) => inv.userId === currentUser.id);
      if (!invite) return false;

      const isPast = tender.date < now;
      const isRejected = invite.status === 'rejected';

      return isPast || isRejected;
    });

    return { active, history };
  }, [currentUser, tenders]);
};

export const useOrganizerTenders = () => {
  const { currentUser, tenders } = useApp();

  return useMemo(() => {
    if (!currentUser || currentUser.role !== 'organizer') return [];

    return tenders.filter((tender) => tender.organizerId === currentUser.id);
  }, [currentUser, tenders]);
};
