import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getDatabase, ref, onValue } from "firebase/database";

type RootStackParamList = {
  OrgHomePage: { orgPrimaryKey: string };
  OrgGasReqForm: { selectedOutlet: string };
  OrgFindOutletPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgFindOutletPage">;

interface OutletData {
  outletName: string;
  outletManagerName: string;
  phoneNumber: string;
  outletAddress: string;
  registrationNumber: string;
}

const OrgFindOutletPage: React.FC<Props> = ({ navigation }) => {
  const [outlets, setOutlets] = useState<OutletData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const db = getDatabase();
    const outletRef = ref(db, "gasOutletReg");

    onValue(outletRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const outletList = Object.keys(data).map((key) => ({
          outletName: data[key].outletName,
          outletManagerName: data[key].outletManagerName,
          phoneNumber: data[key].phoneNumber,
          outletAddress: data[key].outletAddress,
          registrationNumber: data[key].registrationNumber,
        }));
        setOutlets(outletList);
      }
    });
  }, []);

  const filteredOutlets = outlets.filter((outlet) =>
    outlet.outletName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Gas Outlets</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search outlets by name"
            placeholderTextColor="#666"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredOutlets.map((outlet) => (
          <View key={outlet.registrationNumber} style={styles.outletCard}>
            <View style={styles.outletHeader}>
              <Text style={styles.outletName}>{outlet.outletName}</Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📍 Address:</Text>
                <Text style={styles.detailText}>{outlet.outletAddress}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>👨‍💼 Manager:</Text>
                <Text style={styles.detailText}>{outlet.outletManagerName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📞 Contact:</Text>
                <Text style={styles.detailText}>{outlet.phoneNumber}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => navigation.navigate("OrgGasReqForm", { 
                selectedOutlet: outlet.outletName 
              })}>
              <Text style={styles.requestButtonText}>Request Cylinder</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#ff6600",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  outletCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  outletName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    color: "#666",
  },
  detailText: {
    flex: 1,
    color: "#333",
  },
  requestButton: {
    backgroundColor: "#ff6600",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  requestButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrgFindOutletPage;