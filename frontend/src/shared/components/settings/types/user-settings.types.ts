export type SettingsRole = "chef" | "customer";

export type UserSettingsFormState = {
  name: string;
  lastName: string;
  username: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  chefDisplayName?: string;
};