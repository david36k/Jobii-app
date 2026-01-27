import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Tender, Contact, Group, InviteStatus } from '@/types';
import { MOCK_USERS, MOCK_TENDERS, MOCK_CONTACTS, MOCK_GROUPS } from '@/constants/mock-data';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const [AppProvider, useApp] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [groups] = useState<Group[]>(MOCK_GROUPS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[AppContext] Loading data...');
      
      const storedUsers = await AsyncStorage.getItem('users');
      const loadedUsers = storedUsers ? JSON.parse(storedUsers) : MOCK_USERS;
      setUsers(loadedUsers);

      const storedUserId = await AsyncStorage.getItem('currentUserId');
      if (storedUserId) {
        const user = loadedUsers.find((u: User) => u.id === storedUserId);
        if (user) {
          console.log('[AppContext] Found user:', user.id);
          setCurrentUser(user);
        }
      } else {
        console.log('[AppContext] No stored user found');
      }

      const storedTenders = await AsyncStorage.getItem('tenders');
      if (storedTenders) {
        const parsedTenders = JSON.parse(storedTenders);
        const tendersWithDates = parsedTenders.map((tender: any) => ({
          ...tender,
          date: new Date(tender.date),
          createdAt: new Date(tender.createdAt),
          invites: tender.invites.map((invite: any) => ({
            ...invite,
            updatedAt: new Date(invite.updatedAt),
          })),
        }));
        setTenders(tendersWithDates);
      } else {
        setTenders(MOCK_TENDERS);
        await AsyncStorage.setItem('tenders', JSON.stringify(MOCK_TENDERS));
      }
    } catch (error) {
      console.error('[AppContext] Failed to load data:', error);
      setTenders(MOCK_TENDERS);
    } finally {
      setIsInitialized(true);
      console.log('[AppContext] Initialization complete');
    }
  };

  const switchUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      await AsyncStorage.setItem('currentUserId', userId);
      setCurrentUser(user);
    }
  };

  const deductCredit = useCallback(
    async (userId: string) => {
      const updatedUsers = users.map((u) =>
        u.id === userId ? { ...u, credits: Math.max(0, u.credits - 1) } : u
      );
      setUsers(updatedUsers);

      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...currentUser, credits: Math.max(0, currentUser.credits - 1) });
      }

      try {
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (error) {
        console.error('Failed to save users:', error);
      }
    },
    [users, currentUser]
  );

  const addCredits = useCallback(
    async (userId: string, amount: number) => {
      const updatedUsers = users.map((u) =>
        u.id === userId ? { ...u, credits: u.credits + amount } : u
      );
      setUsers(updatedUsers);

      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...currentUser, credits: currentUser.credits + amount });
      }

      try {
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (error) {
        console.error('Failed to save users:', error);
      }
    },
    [users, currentUser]
  );

  const createTender = useCallback(
    async (tender: Omit<Tender, 'id' | 'createdAt' | 'status'>) => {
      const newTender: Tender = {
        ...tender,
        id: `tender-${Date.now()}`,
        status: 'open',
        createdAt: new Date(),
      };
      const updatedTenders = [newTender, ...tenders];
      setTenders(updatedTenders);
      try {
        await AsyncStorage.setItem('tenders', JSON.stringify(updatedTenders));
      } catch (error) {
        console.error('Failed to save tender:', error);
      }
      return newTender;
    },
    [tenders]
  );

  const updateInviteStatus = useCallback(
    async (tenderId: string, userId: string, status: InviteStatus) => {
      const updatedTenders = tenders.map((tender) => {
        if (tender.id !== tenderId) return tender;

        const updatedInvites = tender.invites.map((invite) =>
          invite.userId === userId
            ? { ...invite, status, updatedAt: new Date() }
            : invite
        );

        const acceptedCount = updatedInvites.filter((inv) => inv.status === 'accepted').length;
        const newStatus = acceptedCount >= tender.quota ? 'full' : tender.status;

        return {
          ...tender,
          invites: updatedInvites,
          status: newStatus,
        };
      });

      setTenders(updatedTenders);
      try {
        await AsyncStorage.setItem('tenders', JSON.stringify(updatedTenders));
      } catch (error) {
        console.error('Failed to save invite status:', error);
      }
    },
    [tenders]
  );

  const getTenderById = useCallback(
    (tenderId: string) => {
      return tenders.find((t) => t.id === tenderId);
    },
    [tenders]
  );

  const addContact = useCallback(
    async (contact: Omit<Contact, 'id'>) => {
      const newContact: Contact = {
        ...contact,
        id: `contact-${Date.now()}`,
      };
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      try {
        await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
      } catch (error) {
        console.error('Failed to save contact:', error);
      }
      return newContact;
    },
    [contacts]
  );

  const addMultipleContacts = useCallback(
    async (newContacts: Omit<Contact, 'id'>[]) => {
      const contactsWithIds = newContacts.map((contact, index) => ({
        ...contact,
        id: `contact-${Date.now()}-${index}`,
      }));
      const updatedContacts = [...contacts, ...contactsWithIds];
      setContacts(updatedContacts);
      try {
        await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
      } catch (error) {
        console.error('Failed to save contacts:', error);
      }
      return contactsWithIds;
    },
    [contacts]
  );

  const deleteContact = useCallback(
    async (contactId: string) => {
      const updatedContacts = contacts.filter((c) => c.id !== contactId);
      setContacts(updatedContacts);
      try {
        await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    },
    [contacts]
  );

  const updateContact = useCallback(
    async (contactId: string, updates: Partial<Contact>) => {
      const updatedContacts = contacts.map((c) =>
        c.id === contactId ? { ...c, ...updates } : c
      );
      setContacts(updatedContacts);
      try {
        await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
      } catch (error) {
        console.error('Failed to update contact:', error);
      }
    },
    [contacts]
  );

  const deleteAccount = useCallback(
    async (userId: string) => {
      try {
        const updatedUsers = users.filter((u) => u.id !== userId);
        setUsers(updatedUsers);
        
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(null);
          await AsyncStorage.removeItem('currentUserId');
        }
        
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log('[AppContext] Account deleted:', userId);
      } catch (error) {
        console.error('[AppContext] Failed to delete account:', error);
      }
    },
    [users, currentUser]
  );

  return {
    currentUser,
    switchUser,
    tenders,
    contacts,
    groups,
    createTender,
    updateInviteStatus,
    getTenderById,
    mockUsers: users,
    isInitialized,
    deductCredit,
    addCredits,
    addContact,
    addMultipleContacts,
    deleteContact,
    updateContact,
    deleteAccount,
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
