import React, { useState, useEffect } from "react";
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { rtdb } from "../Services/firebase";
import { ref, set, get, child } from "firebase/database";
import { ArrowLeft } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  IndCustHomePage: { custPrimaryKey: string };
  IndCustGasReqForm: { selectedOutlet: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "IndCustGasReqForm">;

interface OutletData {
  outletName: string;
}

const IndCustGasReqForm: React.FC<Props> = ({ navigation, route }) => {
    const selectedOutlet = route.params?.selectedOutlet || "";
    const [nic, setNic] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [outlet, setOutlet] = useState(selectedOutlet);
    const [outletList, setOutletList] = useState<string[]>([]);
    const [cylinderType, setCylinderType] = useState("2.3");
    const [cylinderCount, setCylinderCount] = useState("1");
    const [requestDate, setRequestDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState("");

    const cylinderTypes = ["3.2", "5", "12.5"];
    const cylinderCounts = ["1", "2", "3"];

    useEffect(() => {
        fetchOutlets();
    }, []);

    const fetchOutlets = async () => {
        try {
            const dbRef = ref(rtdb);
            const snapshot = await get(child(dbRef, 'gasOutletReg'));
            
            if (snapshot.exists()) {
                const outlets: string[] = [];
                snapshot.forEach((childSnapshot) => {
                    const outletData = childSnapshot.val() as OutletData;
                    if (outletData.outletName) {
                        outlets.push(outletData.outletName);
                    }
                });
                setOutletList(outlets);
                if (!selectedOutlet && outlets.length > 0) {
                    setOutlet(outlets[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching outlets: ", error);
            Alert.alert("Error", "Failed to load outlets");
        }
    };


    const handleRequest = async () => {
        setError("");

        if (!nic || !name || !phoneNumber || !email || !outlet || !cylinderType || !cylinderCount || !requestDate) {
            setError("Fill all the details");
            return;
        }

        try {
            await set(ref(rtdb, `IndCustGasRequests/${nic}`), {
                nic,
                name,
                phoneNumber,
                email,
                outlet,
                cylinderType: cylinderType + " kg",
                cylinderCount: parseInt(cylinderCount),
                requestDate,
                status: "pending",
            });

            Alert.alert("Success", "Requested gas cylinders successfully.");
            handleCancel();
        } catch (error) {
            console.error("Error submitting request: ", error);
            Alert.alert("Error", "Failed to submit the request. Try Again.");
        }
    };

    const handleCancel = () => {
        setNic("");
        setName("");
        setPhoneNumber("");
        setEmail("");
        setOutlet(outletList[0] || "");
        setCylinderType("3.2");
        setCylinderCount("1");
        setRequestDate("");
        setError("");
    };

    const handleDateChange = (
        event: any,
        selectedDate?: Date | undefined
    ) => {
        setShowDatePicker(false);

        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            setRequestDate(formattedDate);
        }
    };

    const goBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={styles.container}>
                        <View style={styles.formContainer}>
                            <TouchableOpacity onPress={goBack} style={styles.backButton}>
                                <ArrowLeft color="#ff6600" size={24} />
                            </TouchableOpacity>
                            <Text style={styles.title}>Cylinder Request Form</Text>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="NIC Number"
                                    value={nic}
                                    onChangeText={setNic}
                                    style={styles.input}
                                    placeholderTextColor="#888"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="Full Name"
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.input}
                                    placeholderTextColor="#888"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    style={styles.input}
                                    placeholderTextColor="#888"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="Email Address"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    style={styles.input}
                                    placeholderTextColor="#888"
                                />
                            </View>

                            <View style={styles.pickerContainer}>
                                <Text style={styles.pickerLabel}>Select Outlet</Text>
                                <Picker
                                    selectedValue={outlet}
                                    onValueChange={(itemValue) => setOutlet(itemValue)}
                                    style={styles.picker}
                                >
                                    {outletList.map((outletName) => (
                                        <Picker.Item key={outletName} label={outletName} value={outletName} />
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.pickerContainer}>
                                <Text style={styles.pickerLabel}>Cylinder Type (kg)</Text>
                                <Picker
                                    selectedValue={cylinderType}
                                    onValueChange={(itemValue) => setCylinderType(itemValue)}
                                    style={styles.picker}
                                >
                                    {cylinderTypes.map((type) => (
                                        <Picker.Item key={type} label={type} value={type} />
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.pickerContainer}>
                                <Text style={styles.pickerLabel}>Cylinder Count</Text>
                                <Picker
                                    selectedValue={cylinderCount}
                                    onValueChange={(itemValue) => setCylinderCount(itemValue)}
                                    style={styles.picker}
                                >
                                    {cylinderCounts.map((count) => (
                                        <Picker.Item key={count} label={count} value={count} />
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.inputContainer}>
                                <TouchableOpacity 
                                    style={styles.datePicker}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.datePickerText}>
                                        {requestDate ? requestDate : "Select Request Date"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={requestDate ? new Date(requestDate) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                    minimumDate={new Date()}
                                />
                            )}

                            {error && <Text style={styles.errorText}>{error}</Text>}

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity 
                                    style={styles.cancelButton} 
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.submitButton} 
                                    onPress={handleRequest}
                                >
                                    <Text style={styles.submitButtonText}>Request</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    container: {
        flex: 1,
        alignItems: "center",
    },
    formContainer: {
        width: "100%",
        maxWidth: 500,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ff6600",
        textAlign: "center",
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "white",
    },
    pickerContainer: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        backgroundColor: "white",
    },
    pickerLabel: {
        fontSize: 16,
        color: "#ff6600",
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    picker: {
        width: "100%",
    },
    datePicker: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: "white",
    },
    datePickerText: {
        fontSize: 16,
        color: "#888",
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    cancelButton: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    },
    cancelButtonText: {
        color: "#ff6600",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    submitButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        flex: 1,
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    backButton: {
        marginBottom: 10,
    },
});

export default IndCustGasReqForm;