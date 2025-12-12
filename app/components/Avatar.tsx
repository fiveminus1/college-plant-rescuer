import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface AvatarProps {
    name: string;
    color: string;
}

export function Avatar({ name, color }: AvatarProps) {
    return (
        <View style={[styles.avatarContainer, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
    )
};

const styles = StyleSheet.create({
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.background,
    },

});