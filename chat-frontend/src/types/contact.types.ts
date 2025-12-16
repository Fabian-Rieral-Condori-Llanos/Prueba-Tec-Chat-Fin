export interface Contact {
  id: number;
  userId: number;
  contactUserId: number;
  contactUsername: string;
  contactEmail: string;
  contactPhoneNumber?: string;
  contactProfilePictureUrl?: string;
  contactStatus: "ONLINE" | "OFFLINE" | "AWAY";
  contactLastSeen?: string;
  nickname?: string;
  isBlocked: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface AddContactRequest {
  usernameOrEmail: string;
  nickname?: string;
}

export interface ContactRequest {
  contactUserId: number;
  nickname?: string;
}