export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            [_ in string]: {
                Row: {
                    [_ in string]: Json | null
                }
                Insert: {
                    [_ in string]: Json | null
                }
                Update: {
                    [_ in string]: Json | null
                }
            }
        }
        Views: {
            [_ in string]: {
                Row: {
                    [_ in string]: Json | null
                }
            }
        }
        Functions: {
            [_ in string]: {
                Args: {
                    [_ in string]: Json | null
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in string]: string
        }
        CompositeTypes: {
            [_ in string]: string
        }
    }
}
