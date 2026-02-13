export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  rooms?: Room[];
}

export interface Room {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  users?: any[];
}

export interface Message {
  id: number;
  room_id: number;
  user_id: number;
  content: string;
  file_path: string | null;
  file_name: string | null;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  user?: any;
  reads?: MessageRead[];
}

export interface MessageRead {
  id: number;
  message_id: number;
  user_id: number;
  read_at: string;
  created_at: string;
  updated_at: string;
}
