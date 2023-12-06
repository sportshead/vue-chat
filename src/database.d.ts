export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            messages: {
                Row: {
                    author: string;
                    created_at: string;
                    id: number;
                    message: string | null;
                };
                Insert: {
                    author: string;
                    created_at?: string;
                    id?: number;
                    message?: string | null;
                };
                Update: {
                    author?: string;
                    created_at?: string;
                    id?: number;
                    message?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "messages_author_fkey";
                        columns: ["author"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
