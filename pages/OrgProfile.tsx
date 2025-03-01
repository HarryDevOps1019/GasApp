import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, get, child } from "firebase/database";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Home, History, User } from "lucide-react-native";

type OrgDetails = {
    orgName: string;
    busiRegNo: string;
    address: string;
    email: string;
    orgPhoneNumber: string;
};

type RootStackParamList = {
    OrgProfile: { orgPrimaryKey: string };
    OrgLogPage: undefined;
    OrgHomePage: { orgPrimaryKey: string };
    OrderHistoryPage: { orgPrimaryKey: string };
};

type OrgProfileRouteProp = RouteProp<RootStackParamList, "OrgProfile">;
type OrgProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, "OrgProfile">;

interface OrgProfileProps {
    route: OrgProfileRouteProp;
    navigation: OrgProfileNavigationProp;
}

const OrgProfile: React.FC<OrgProfileProps> = ({ route, navigation }: OrgProfileProps) => {
    const { orgPrimaryKey } = route.params;

    const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                console.log("Fetching details for orgPrimaryKey:", orgPrimaryKey);
    
                const dbRef = ref(rtdb);
                const orgRef = child(dbRef, `OrganizationRegistration/${orgPrimaryKey}`);
    
                const snapshot = await get(orgRef);
                console.log("Firebase snapshot:", snapshot.val());
    
                if (snapshot.exists()) {
                    setOrgDetails(snapshot.val() as OrgDetails);
                } else {
                    console.log("No data found for organization key:", orgPrimaryKey);
                    Alert.alert("Error", "Organization details not found.");
                }
            } catch (error) {
                console.error("Error fetching organization details:", error);
                Alert.alert("Error", "Failed to fetch organization details. Try again later.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchOrgDetails();
    }, [orgPrimaryKey]);

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
                    onPress: () => navigation.navigate("OrgLogPage")
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading organization details...</Text>
            </View>
        );
    }

    if (!orgDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No organization details available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Organization Profile</Text>
            <View style={styles.detailsContainer}>
                <Text style={styles.label}>Organization Name:</Text>
                <Text style={styles.value}>{orgDetails.orgName}</Text>

                <Text style={styles.label}>Business Registration No:</Text>
                <Text style={styles.value}>{orgDetails.busiRegNo}</Text>

                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{orgDetails.address}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{orgDetails.email}</Text>

                <Text style={styles.label}>Phone Number:</Text>
                <Text style={styles.value}>{orgDetails.orgPhoneNumber}</Text>
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
                    onPress={() => navigation.navigate("OrgHomePage", {orgPrimaryKey})}>
                    <Home color="#6B7280" size={20} />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate("OrderHistoryPage", {orgPrimaryKey})}>
                    <History color="#6B7280" size={20} />
                    <Text style={styles.navText}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate("OrgProfile", {orgPrimaryKey})}>
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

export default OrgProfile;