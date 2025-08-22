export type Profile = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  preferences?: {
    notifications?: boolean;
    language?: string;
    units?: 'metric' | 'imperial';
    theme?: 'light' | 'dark';
  };
  created_at: string;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
    };
  };
};
