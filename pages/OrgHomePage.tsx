import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Calendar, Package, Hash, MapPin, Home, History, User } from "lucide-react-native";
import { getDatabase, ref, get } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  OrgHomePage: { orgPrimaryKey: string };
  OrgOrderHistory: { orgPrimaryKey: string };
  OrgProfile: { orgPrimaryKey: string };
  OrgGasReqForm: undefined;
  OrgFindOutletPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgHomePage">;

type Token = {
  token: string;
  createdAt: number;
  cylinderType: string;
  cylinderCount: number;
  status: string;
  busiRegNo: string;
};

const OrgHomePage: React.FC<Props> = ({ navigation, route }) => {
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTokenDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const orgPrimaryKey = route.params?.orgPrimaryKey;

      if (!orgPrimaryKey) {
        throw new Error("Organization key not found. Please log in again.");
      }

      const db = getDatabase();
      const organizationRef = ref(db, `OrganizationRegistration/${orgPrimaryKey}`);
      const organizationSnapshot = await get(organizationRef);

      if (!organizationSnapshot.exists()) {
        throw new Error("Organization details not found.");
      }

      const organizationData = organizationSnapshot.val();
      const businessRegNo = organizationData.busiRegNo;

      const tokensRef = ref(db, "tokens");
      const tokenSnapshot = await get(tokensRef);

      let matchedToken: Token | null = null;
      if (tokenSnapshot.exists()) {
        tokenSnapshot.forEach((childSnapshot) => {
          const tokenData = childSnapshot.val() as Token;
          if (tokenData.busiRegNo === businessRegNo) {
            matchedToken = tokenData;
            return true;
          }
        });
      }

      setToken(matchedToken);

    } catch (err: any) {
      console.error("Error fetching token details:", err.message);
      setError(err.message || "An error occurred.");
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenDetails();
  }, []);

  const gasPrices = [
    { weight: 3.2, price: 803.37 },
    { weight: 5, price: 1629.57 },
    { weight: 12.5, price: 3940.37 },
    { weight: 37.5, price: 12425.18 }
  ];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>GasByGas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Requested Gas Pickup Details</Text>
              {token && (
                <Text style={styles.cardSubtitle}>
                  {new Date(token.createdAt).toLocaleDateString()}
                </Text>
              )}
            </View>
            <Calendar color="#ff6600" size={24} />
          </View>
          
          {token ? (
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.infoText}>Token</Text>
                <Text style={styles.detailValue}>{token.token}</Text>
              </View>
              <View style={styles.detailRow}>
                <Package color="#6B7280" size={16} />
                <Text style={styles.infoText}>Cylinder Type</Text>
                <Text style={styles.detailValue}>{token.cylinderType}</Text>
              </View>
              <View style={styles.detailRow}>
                <Hash color="#6B7280" size={16} />
                <Text style={styles.infoText}>Cylinder Count</Text>
                <Text style={styles.detailValue}>{token.cylinderCount}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.status}>
                  <View style={styles.statusDot} />
                  <Text style={styles.infoText}>Pickup</Text>
                </View>
                <Text
                  style={[
                    styles.detailValue,
                    token.status === "Approved"
                      ? styles.statusConfirmed
                      : styles.statusPending,
                  ]}>
                  {token.status || "Pending"}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>No active token found.</Text>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("OrgGasReqForm")}>
            <Package color="#FFFFFF" size={24} />
            <Text style={styles.actionText}>Request Gas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.findOutlet]}
            onPress={() => navigation.navigate("OrgFindOutletPage")}>
            <MapPin color="#ff6600" size={24} />
            <Text style={[styles.actionText, { color: "#ff6600" }]}>
              Find Gas Outlet
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceTitle}>Gas Cylinder Prices</Text>
          <View style={styles.priceGrid}>
            {gasPrices.map((item) => (
              <View key={item.weight} style={styles.priceCard}>
                <Text style={styles.weightText}>{item.weight}kg</Text>
                <Text style={styles.priceText}>Rs. {item.price.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("OrgHomePage", {
            orgPrimaryKey: route.params?.orgPrimaryKey
          })}>
          <Home color="#ff6600" size={24} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("OrgOrderHistory", {
            orgPrimaryKey: route.params?.orgPrimaryKey
          })}>
          <History color="#6B7280" size={24} />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("OrgProfile", {
            orgPrimaryKey: route.params?.orgPrimaryKey
          })}>
          <User color="#6B7280" size={24} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { 
    backgroundColor: "#ff6600", 
    padding: 20, 
    flexDirection: "row", 
    justifyContent: "center", // Changed to center
    alignItems: "center" 
  },
  headerText: { 
    color: "#FFFFFF", 
    fontSize: 20, 
    fontWeight: "bold",
    textAlign: "center" // Added to ensure centered text
  },
  notificationIcon: { padding: 5 },
  content: { padding: 20, paddingBottom: 80 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 8, padding: 16, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardSubtitle: { fontSize: 16, color: "#6B7280" },
  details: { marginTop: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  infoText: { fontSize: 16, color: "#6B7280" },
  detailValue: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  status: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff6600", marginRight: 6 },
  statusConfirmed: { color: "#10B981" },
  statusPending: { color: "#F59E0B" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  noDataText: { 
    fontSize: 16, 
    color: "#6B7280", 
    textAlign: "center", 
    marginTop: 10,
    marginBottom: 10 
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ff6600',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 2
  },
  findOutlet: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ff6600'
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  priceContainer: {
    marginTop: 20,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    elevation: 2,
    alignItems: 'center',
    marginBottom: 10,
  },
  weightText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  navigationBar: {
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
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
});

export default OrgHomePage;