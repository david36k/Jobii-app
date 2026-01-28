import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import { Tender, Contact, InviteStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseQueries } from '@/utils/supabase-queries';

export const [AppProvider, useApp] = createContextHook(() => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadCurrentUserId();
  }, []);

  const loadCurrentUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('currentUserId');
      if (storedUserId) {
        console.log('[AppContext] Found stored user:', storedUserId);
        setCurrentUserId(storedUserId);
      }
    } catch (error) {
      console.error('[AppContext] Failed to load user:', error);
    }
  };

  const currentUserQuery = useQuery({
    queryKey: ['user', currentUserId],
    queryFn: () => supabaseQueries.users.getById(currentUserId!),
    enabled: !!currentUserId,
  });

  const tendersQuery = useQuery({
    queryKey: ['tenders'],
    queryFn: () => supabaseQueries.tenders.getAll(),
  });

  const contactsQuery = useQuery({
    queryKey: ['contacts', currentUserId],
    queryFn: () => supabaseQueries.contacts.getByOwner(currentUserId!),
    enabled: !!currentUserId,
  });

  const groupsQuery = useQuery({
    queryKey: ['groups', currentUserId],
    queryFn: () => supabaseQueries.groups.getByOwner(currentUserId!),
    enabled: !!currentUserId,
  });

  const switchUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await AsyncStorage.setItem('currentUserId', userId);
      return userId;
    },
    onSuccess: (userId) => {
      setCurrentUserId(userId);
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['contacts', userId] });
      queryClient.invalidateQueries({ queryKey: ['groups', userId] });
    },
  });

  const updateCreditsMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) => {
      const currentUser = currentUserQuery.data;
      if (!currentUser) throw new Error('No user found');
      return supabaseQueries.users.updateCredits(userId, currentUser.credits + amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', currentUserId] });
    },
  });

  const createTenderMutation = useMutation({
    mutationFn: (tender: {
      organizerId: string;
      organizerName: string;
      title: string;
      description?: string;
      location: string;
      date: Date;
      startTime: string;
      endTime: string;
      pay: number;
      quota: number;
      invites: { userName: string; userPhone: string; userId?: string }[];
    }) => supabaseQueries.tenders.create(tender),
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

  const deductCredit = (userId: string) => {
    updateCreditsMutation.mutate({ userId, amount: -1 });
  };

  const addCredits = (userId: string, amount: number) => {
    updateCreditsMutation.mutate({ userId, amount });
  };

  const createTender = async (tender: Omit<Tender, 'id' | 'createdAt' | 'status'>) => {
    if (!tender.location) {
      throw new Error('Location is required');
    }
    const result = await createTenderMutation.mutateAsync(tender as any);
    return result;
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
      setCurrentUserId(null);
      queryClient.clear();
    } catch (error) {
      console.error('[AppContext] Logout failed:', error);
    }
  };

  return {
    currentUser: currentUserQuery.data || null,
    switchUser,
    tenders: tendersQuery.data || [],
    contacts: contactsQuery.data || [],
    groups: groupsQuery.data || [],
    createTender,
    updateInviteStatus,
    getTenderById,
    mockUsers: [],
    isInitialized: !currentUserQuery.isLoading,
    deductCredit,
    addCredits,
    addContact,
    addMultipleContacts,
    deleteContact,
    updateContact,
    deleteAccount,
    logout,
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
