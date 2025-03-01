import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Home, History, User } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getDatabase, ref, get } from "firebase/database";

type RootStackParamList = {
  OrgHomePage: { orgPrimaryKey: string };
  OrgOrderHistory: { orgPrimaryKey: string };
  OrgProfile: { orgPrimaryKey: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgOrderHistory">;

type OrderData = {
  token: string;
  cylinderType: string;
  cylinderCount: number;
  createdAt: number;
  status: string;
  outletId: string;
  email: string;
};

const OrgOrderHistory: React.FC<Props> = ({ navigation, route }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrderHistory = async () => {
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

      const organizationEmail = organizationSnapshot.val().email;

      const tokensRef = ref(db, "tokens");
      const tokenSnapshot = await get(tokensRef);

      if (!tokenSnapshot.exists()) {
        setOrders([]);
        return;
      }

      const completedOrders: OrderData[] = [];
      tokenSnapshot.forEach((childSnapshot) => {
        const orderData = childSnapshot.val();
        if (orderData.email === organizationEmail && orderData.status === "Completed") {
          completedOrders.push({
            ...orderData,
            token: orderData.token || childSnapshot.key,
          });
        }
      });

      completedOrders.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(completedOrders);

    } catch (err: any) {
      console.error("Error fetching order history:", err.message);
      setError(err.message || "An error occurred while fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderHistory}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerText}>Order History</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <History color="#6B7280" size={48} />
            <Text style={styles.emptyStateText}>No completed orders found</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.token} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.outletName}>Outlet ID: {order.outletId}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Token:</Text>
                  <Text style={styles.detailText}>{order.token}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cylinder Type:</Text>
                  <Text style={styles.detailText}>{order.cylinderType}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailText}>
                    {order.cylinderCount} cylinder{order.cylinderCount > 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Completed Date:</Text>
                  <Text style={styles.detailText}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("OrgHomePage", {
            orgPrimaryKey: route.params?.orgPrimaryKey
          })}>
          <Home color="#6B7280" size={20} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <History color="#ff6600" size={20} />
          <Text style={styles.navTextActive}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("OrgProfile", {
            orgPrimaryKey: route.params?.orgPrimaryKey
          })}>
          <User color="#6B7280" size={20} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ff6600',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  outletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 2,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#6B7280',
  },
  navTextActive: {
    fontSize: 12,
    color: '#ff6600',
    fontWeight: 'bold',
  },
});

export default OrgOrderHistory;