import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, get, child } from "firebase/database";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Home, History, User } from "lucide-react-native";

type IndCustDetails = {
    name: string;
    nic: string;
    address: string;
    email: string;
    phoneNumber: string;
};

type RootStackParamList = {
    IndCustProfile: { custPrimaryKey: string };
    IndCustLogPage: undefined;
    IndCustHomePage: { custPrimaryKey: string };
    IndCustOrderHistory: { custPrimaryKey: string };
};

type CustProfileRouteProp = RouteProp<RootStackParamList, "IndCustProfile">;
type CustProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, "IndCustProfile">;

interface CustProfileProps {
    route: CustProfileRouteProp;
    navigation: CustProfileNavigationProp;
}

const IndCustProfile: React.FC<CustProfileProps> = ({ route, navigation }: CustProfileProps) => {
    const { custPrimaryKey } = route.params;

    const [custDetails, setCustDetails] = useState<IndCustDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustDetails = async () => {
            try {
                console.log("Fetching details for custPrimaryKey:", custPrimaryKey);
    
                const dbRef = ref(rtdb);
                const orgRef = child(dbRef, `CustomerRegistration/${custPrimaryKey}`);
    
                const snapshot = await get(orgRef);
                console.log("Firebase snapshot:", snapshot.val());
    
                if (snapshot.exists()) {
                    setCustDetails(snapshot.val() as IndCustDetails);
                } else {
                    console.log("No data found for customer key:", custPrimaryKey);
                    Alert.alert("Error", "Customer details not found.");
                }
            } catch (error) {
                console.error("Error fetching customer details:", error);
                Alert.alert("Error", "Failed to fetch customer details. Try again later.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchCustDetails();
    }, [custPrimaryKey]);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: () => navigation.navigate("IndCustLogPage")
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading customer details...</Text>
            </View>
        );
    }

    if (!custDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No customer details available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Customer Profile</Text>
            <View style={styles.detailsContainer}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{custDetails.name}</Text>

                <Text style={styles.label}>NIC No:</Text>
                <Text style={styles.value}>{custDetails.nic}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{custDetails.email}</Text>

                <Text style={styles.label}>Phone Number:</Text>
                <Text style={styles.value}>{custDetails.phoneNumber}</Text>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            {/* Navigation Bar */}
            <View style={styles.navbar}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate("IndCustHomePage", {custPrimaryKey})}>
                    <Home color="#6B7280" size={20} />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate("IndCustOrderHistory", {custPrimaryKey})}>
                    <History color="#6B7280" size={20} />
                    <Text style={styles.navText}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate("IndCustProfile", {custPrimaryKey})}>
                    <User color="#ff6600" size={20} />
                    <Text style={styles.navTextActive}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    detailsContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 14,
        elevation: 4,
        marginBottom: 80,
        borderWidth: 2,
        borderColor: '#ff6600',
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        color: "gray",
    },
    errorText: {
        color: "red",
        fontSize: 16,
        textAlign: "center",
    },
    logoutButton: {
        backgroundColor: "#ff4444",
        padding: 15,
        borderRadius: 8,
        position: "absolute",
        bottom: 80,
        left: 20,
        right: 20,
        alignItems: "center",
        elevation: 4,
    },
    logoutButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    navbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        elevation: 5,
    },
    navButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
    },
    navTextActive: {
        marginTop: 4,
        fontSize: 12,
        color: '#ff6600',
        fontWeight: 'bold',
    },
});

export default IndCustProfile;