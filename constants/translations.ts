export type Language = 'he' | 'en';

type TranslationKeys = {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    yes: string;
    no: string;
  };
  dashboard: {
    greeting: string;
    credits: string;
    modeWork: string;
    modeHire: string;
    monthlyEarnings: string;
    upcomingShifts: string;
    openInvitations: string;
    myTenders: string;
    noInvitations: string;
    noInvitationsDesc: string;
    noTenders: string;
    noTendersDesc: string;
    createTenderCTA: string;
    createTenderDesc: string;
    clickToRespond: string;
    workers: string;
    creditsLow: string;
    creditsOut: string;
    creditsLowDesc: string;
    creditsOutDesc: string;
    by: string;
    statusPending: string;
    statusAccepted: string;
    statusRejected: string;
  };
  settings: {
    title: string;
    subtitle: string;
    myCredits: string;
    general: string;
    editProfile: string;
    tokens: string;
    notifications: string;
    contact: string;
    logout: string;
    logoutConfirm: string;
    logoutMessage: string;
    about: string;
    appDescription: string;
    version: string;
    dangerZone: string;
    deleteAccount: string;
    deleteAccountDesc: string;
    deleteAccountConfirm: string;
    deleteAccountMessage: string;
    notificationsComingSoon: string;
    contactEmail: string;
  };
  contacts: {
    title: string;
    addContact: string;
    importFromDevice: string;
    orAddManually: string;
    fullName: string;
    phone: string;
    email: string;
    tag: string;
    notes: string;
    saveContact: string;
    noContacts: string;
    noContactsDesc: string;
    noGroups: string;
    noGroupsDesc: string;
    searchPlaceholder: string;
    contactsTab: string;
    groupsTab: string;
    selectContacts: string;
    importSelected: string;
    permissionRequired: string;
    permissionMessage: string;
    noContactsInDevice: string;
    importSuccess: string;
    contactAdded: string;
    errorSaving: string;
    errorImporting: string;
    errorLoading: string;
    fillRequired: string;
    tagPlaceholder: string;
    notesPlaceholder: string;
    optional: string;
    required: string;
    noPhone: string;
    members: string;
  };
  archive: {
    title: string;
    totalCompleted: string;
    organized: string;
    worked: string;
    totalEarned: string;
    filterAll: string;
    filterOrganized: string;
    filterWorked: string;
    noItems: string;
    noItemsDesc: string;
    noItemsOrganizedDesc: string;
    noItemsWorkedDesc: string;
    tenders: string;
    tender: string;
    organizedBadge: string;
    participatedBadge: string;
    rejectedBadge: string;
  };
  tender: {
    title: string;
    description: string;
    date: string;
    time: string;
    quota: string;
    pay: string;
    location: string;
    status: string;
    candidates: string;
    accept: string;
    reject: string;
    statusOpen: string;
    statusClosed: string;
    statusActive: string;
    createTitle: string;
    selectCandidates: string;
    invited: string;
    available: string;
  };
};

export const translations: Record<Language, TranslationKeys> = {
  he: {
    common: {
      save: 'שמור',
      cancel: 'ביטול',
      delete: 'מחק',
      edit: 'ערוך',
      add: 'הוסף',
      search: 'חיפוש',
      loading: 'טוען...',
      error: 'שגיאה',
      success: 'הצלחה',
      confirm: 'אישור',
      yes: 'כן',
      no: 'לא',
    },
    dashboard: {
      greeting: 'שלום',
      credits: 'קרדיטים',
      modeWork: 'מחפש עבודה',
      modeHire: 'מגייס עובדים',
      monthlyEarnings: 'רווח החודש',
      upcomingShifts: 'משמרות קרובות',
      openInvitations: 'הזמנות פתוחות',
      myTenders: 'המכרזים שלי',
      noInvitations: 'אין הזמנות פעילות',
      noInvitationsDesc: 'הזמנות לעבודה יופיעו כאן',
      noTenders: 'אין מכרזים פעילים',
      noTendersDesc: 'צור מכרז ראשון כדי להתחיל',
      createTenderCTA: 'צור מכרז חדש',
      createTenderDesc: 'גייס עובדים במהירות ובקלות',
      clickToRespond: 'לחץ לתגובה',
      workers: 'עובדים',
      creditsLow: 'קרדיטים נמוכים',
      creditsOut: 'אזלו הקרדיטים',
      creditsLowDesc: 'מומלץ להוסיף קרדיטים',
      creditsOutDesc: 'לחץ על הקרדיטים למעלה להוסיף',
      by: 'מאת',
      statusPending: 'ממתין',
      statusAccepted: 'אושר',
      statusRejected: 'נדחה',
    },
    settings: {
      title: 'הגדרות',
      subtitle: 'נהל את החשבון שלך',
      myCredits: 'הקרדיטים שלי',
      general: 'כללי',
      editProfile: 'ערוך פרופיל',
      tokens: 'טוקנים',
      notifications: 'התראות',
      contact: 'צור קשר',
      logout: 'התנתק',
      logoutConfirm: 'התנתק',
      logoutMessage: 'האם אתה בטוח שברצונך להתנתק?',
      about: 'אודות',
      appDescription: 'מערכת ניהול מכרזים חכמה לגיוס עובדים מהיר ויעיל',
      version: 'גרסה',
      dangerZone: 'אזור מסוכן',
      deleteAccount: 'מחיקת חשבון',
      deleteAccountDesc: 'פעולה זו תמחק את כל הנתונים שלך לצמיתות. לא ניתן לשחזר את החשבון לאחר המחיקה.',
      deleteAccountConfirm: 'האם אתה בטוח?',
      deleteAccountMessage: 'פעולה זו תמחק את החשבון שלך לצמיתות ולא ניתנת לביטול.',
      notificationsComingSoon: 'הגדרות התראות בקרוב...',
      contactEmail: 'ניתן ליצור קשר במייל:\nsupport@mihrazone.com',
    },
    contacts: {
      title: 'אנשי קשר',
      addContact: 'הוסף איש קשר',
      importFromDevice: 'ייבא מאנשי קשר',
      orAddManually: 'או הוסף ידנית',
      fullName: 'שם מלא',
      phone: 'טלפון',
      email: 'אימייל',
      tag: 'תגית',
      notes: 'הערות',
      saveContact: 'שמור איש קשר',
      noContacts: 'אין אנשי קשר',
      noContactsDesc: 'הוסף אנשי קשר כדי להתחיל',
      noGroups: 'אין קבוצות',
      noGroupsDesc: 'צור קבוצה כדי להתחיל',
      searchPlaceholder: 'חיפוש...',
      contactsTab: 'אנשי קשר',
      groupsTab: 'קבוצות',
      selectContacts: 'בחר אנשי קשר',
      importSelected: 'ייבא',
      permissionRequired: 'נדרשת הרשאה',
      permissionMessage: 'על מנת לייבא אנשי קשר מהמכשיר, יש לאשר גישה לאנשי הקשר.',
      noContactsInDevice: 'לא נמצאו אנשי קשר במכשיר שלך',
      importSuccess: 'אנשי קשר יובאו בהצלחה',
      contactAdded: 'איש קשר נוסף בהצלחה',
      errorSaving: 'אירעה שגיאה בשמירת איש הקשר',
      errorImporting: 'אירעה שגיאה בייבוא אנשי הקשר',
      errorLoading: 'אירעה שגיאה בטעינת אנשי הקשר מהמכשיר',
      fillRequired: 'נא למלא לפחות שם וטלפון',
      tagPlaceholder: 'למשל: "מלצר", "מנהל"',
      notesPlaceholder: 'הכנס הערות...',
      optional: '(אופציונלי)',
      required: '*',
      noPhone: 'ללא טלפון',
      members: 'אנשי קשר',
    },
    archive: {
      title: 'מידע',
      totalCompleted: 'סה״כ הושלמו',
      organized: 'ארגנתי',
      worked: 'עבדתי',
      totalEarned: 'סה״כ הרווחתי',
      filterAll: 'הכל',
      filterOrganized: 'ארגנתי',
      filterWorked: 'עבדתי',
      noItems: 'אין פריטים בארכיון',
      noItemsDesc: 'מכרזים והזמנות שהסתיימו יופיעו כאן',
      noItemsOrganizedDesc: 'מכרזים שארגנת והסתיימו יופיעו כאן',
      noItemsWorkedDesc: 'משמרות שעבדת יופיעו כאן',
      tenders: 'מכרזים',
      tender: 'מכרז',
      organizedBadge: 'ארגנתי',
      participatedBadge: 'השתתפתי',
      rejectedBadge: 'דחיתי',
    },
    tender: {
      title: 'כותרת',
      description: 'תיאור',
      date: 'תאריך',
      time: 'שעה',
      quota: 'מכסה',
      pay: 'שכר',
      location: 'מיקום',
      status: 'סטטוס',
      candidates: 'מועמדים',
      accept: 'אשר',
      reject: 'דחה',
      statusOpen: 'פתוח',
      statusClosed: 'סגור',
      statusActive: 'פעיל',
      createTitle: 'צור מכרז חדש',
      selectCandidates: 'בחר מועמדים',
      invited: 'הוזמנו',
      available: 'זמינים',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
    dashboard: {
      greeting: 'Hello',
      credits: 'Credits',
      modeWork: 'Looking for Work',
      modeHire: 'Hiring Employees',
      monthlyEarnings: 'Monthly Earnings',
      upcomingShifts: 'Upcoming Shifts',
      openInvitations: 'Open Invitations',
      myTenders: 'My Tenders',
      noInvitations: 'No Active Invitations',
      noInvitationsDesc: 'Work invitations will appear here',
      noTenders: 'No Active Tenders',
      noTendersDesc: 'Create your first tender to get started',
      createTenderCTA: 'Create New Tender',
      createTenderDesc: 'Recruit employees quickly and easily',
      clickToRespond: 'Click to Respond',
      workers: 'Workers',
      creditsLow: 'Low Credits',
      creditsOut: 'Out of Credits',
      creditsLowDesc: 'Recommended to add credits',
      creditsOutDesc: 'Tap credits above to add',
      by: 'By',
      statusPending: 'Pending',
      statusAccepted: 'Accepted',
      statusRejected: 'Rejected',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your account',
      myCredits: 'My Credits',
      general: 'General',
      editProfile: 'Edit Profile',
      tokens: 'Tokens',
      notifications: 'Notifications',
      contact: 'Contact Us',
      logout: 'Logout',
      logoutConfirm: 'Logout',
      logoutMessage: 'Are you sure you want to logout?',
      about: 'About',
      appDescription: 'Smart tender management system for fast and efficient employee recruitment',
      version: 'Version',
      dangerZone: 'Danger Zone',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'This action will permanently delete all your data. The account cannot be recovered after deletion.',
      deleteAccountConfirm: 'Are you sure?',
      deleteAccountMessage: 'This action will permanently delete your account and cannot be undone.',
      notificationsComingSoon: 'Notification settings coming soon...',
      contactEmail: 'You can contact us by email:\nsupport@mihrazone.com',
    },
    contacts: {
      title: 'Contacts',
      addContact: 'Add Contact',
      importFromDevice: 'Import from Contacts',
      orAddManually: 'Or add manually',
      fullName: 'Full Name',
      phone: 'Phone',
      email: 'Email',
      tag: 'Tag',
      notes: 'Notes',
      saveContact: 'Save Contact',
      noContacts: 'No Contacts',
      noContactsDesc: 'Add contacts to get started',
      noGroups: 'No Groups',
      noGroupsDesc: 'Create a group to get started',
      searchPlaceholder: 'Search...',
      contactsTab: 'Contacts',
      groupsTab: 'Groups',
      selectContacts: 'Select Contacts',
      importSelected: 'Import',
      permissionRequired: 'Permission Required',
      permissionMessage: 'To import contacts from your device, you need to grant access to contacts.',
      noContactsInDevice: 'No contacts found on your device',
      importSuccess: 'contacts imported successfully',
      contactAdded: 'Contact added successfully',
      errorSaving: 'An error occurred while saving the contact',
      errorImporting: 'An error occurred while importing contacts',
      errorLoading: 'An error occurred while loading contacts from device',
      fillRequired: 'Please fill in at least name and phone',
      tagPlaceholder: 'e.g: "Waiter", "Manager"',
      notesPlaceholder: 'Enter notes...',
      optional: '(optional)',
      required: '*',
      noPhone: 'No phone',
      members: 'members',
    },
    archive: {
      title: 'Info',
      totalCompleted: 'Total Completed',
      organized: 'Organized',
      worked: 'Worked',
      totalEarned: 'Total Earned',
      filterAll: 'All',
      filterOrganized: 'Organized',
      filterWorked: 'Worked',
      noItems: 'No Items in Archive',
      noItemsDesc: 'Completed tenders and invitations will appear here',
      noItemsOrganizedDesc: 'Tenders you organized that ended will appear here',
      noItemsWorkedDesc: 'Shifts you worked will appear here',
      tenders: 'tenders',
      tender: 'tender',
      organizedBadge: 'Organized',
      participatedBadge: 'Participated',
      rejectedBadge: 'Rejected',
    },
    tender: {
      title: 'Title',
      description: 'Description',
      date: 'Date',
      time: 'Time',
      quota: 'Quota',
      pay: 'Pay',
      location: 'Location',
      status: 'Status',
      candidates: 'Candidates',
      accept: 'Accept',
      reject: 'Reject',
      statusOpen: 'Open',
      statusClosed: 'Closed',
      statusActive: 'Active',
      createTitle: 'Create New Tender',
      selectCandidates: 'Select Candidates',
      invited: 'Invited',
      available: 'Available',
    },
  },
};
