import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = '@user_profile';

interface UserProfile {
    name: string;
}

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: UserProfile = {
    name: 'Sarah Son'
};

export function UserProvider({ children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            setLoading(true)l
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if(stored){
                setUser(JSON.parse(stored));
            } else {
                console.log("creating new user");
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
                setUser(defaultUser);
            }
        } catch(error){
            console.error("failed to load user", error);
            setUser(defaultUser);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if(!context){
        throw new Error("must be used within UserProvider");
    }
    return context;
}