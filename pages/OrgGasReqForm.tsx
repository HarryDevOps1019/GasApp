import React, { useState, useEffect } from "react";
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { rtdb } from "../Services/firebase";
import { ref, set, get, child } from "firebase/database";
import { ArrowLeft } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
    OrgHomePage: { orgPrimaryKey: string };
    OrgGasReqForm: { selectedOutlet?: string };
    OrgFindOutletPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgGasReqForm">;

interface OutletData {
    outletName: string;
}

const OrgGasReqForm: React.FC<Props> = ({ navigation, route }) => {
    const { selectedOutlet } = route.params || {};
    const [busiRegNo, setBusiRegNo] = useState("");
    const [orgName, setOrgName] = useState("");
    const [orgPhoneNumber, setOrgPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [outlet, setOutlet] = useState(selectedOutlet || "");
    const [outletList, setOutletList] = useState<string[]>([]);
    const [cylinderType, setCylinderType] = useState("3.2");
    const [cylinderCount, setCylinderCount] = useState("5");
    const [requestDate, setRequestDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState("");
    const [cylinderCountError, setCylinderCountError] = useState("");

    const cylinderTypes = ["3.2", "5", "12.5", "37.5"];

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

                if (!outlet && outlets.length > 0) {
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
        setCylinderCountError("");

        if (!busiRegNo || !orgName || !orgPhoneNumber || !email || !outlet || !cylinderType || !cylinderCount || !requestDate) {
            setError("Fill all the details");
            return;
        }

        if (parseInt(cylinderCount) < 5) {
            setCylinderCountError("Cylinder count must be 5 or more.");
            return;
        }

        try {
            await set(ref(rtdb, `OrgGasRequests/${busiRegNo}`), {
                busiRegNo,
                orgName,
                orgPhoneNumber,
                email,
                outlet,
                cylinderType: cylinderType + " kg",
                cylinderCount: parseInt(cylinderCount),
                requestDate,
                status: "pending",
            });

            Alert.alert("Success", "Requested gas cylinders successfully.");
            handleCancel();
            navigation.goBack();
        } catch (error) {
            console.error("Error submitting request: ", error);
            Alert.alert("Error", "Failed to submit the request. Try Again.");
        }
    };

    const handleCancel = () => {
        setBusiRegNo("");
        setOrgName("");
        setOrgPhoneNumber("");
        setEmail("");
        setOutlet(outletList[0] || "");
        setCylinderType("3.2");
        setCylinderCount("5");
        setRequestDate("");
        setError("");
        setCylinderCountError("");
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
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.formContainer}>
                    <TouchableOpacity onPress={goBack} style={styles.backButton}>
                        <ArrowLeft color="#ff6600" size={24} />
                    </TouchableOpacity>
                    
                    <Text style={styles.title}>Cylinder Request Form</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Business Registration No:</Text>
                        <TextInput
                            placeholder="Enter BR No"
                            value={busiRegNo}
                            onChangeText={setBusiRegNo}
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Organization Name:</Text>
                        <TextInput
                            placeholder="Enter Organization Name"
                            value={orgName}
                            onChangeText={setOrgName}
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Contact No:</Text>
                        <TextInput
                            placeholder="Enter Organization Contact No"
                            value={orgPhoneNumber}
                            onChangeText={setOrgPhoneNumber}
                            keyboardType="phone-pad"
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email:</Text>
                        <TextInput
                            placeholder="Enter Email Address"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Outlet Name:</Text>
                        <View style={styles.pickerContainer}>
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
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Cylinder Type:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={cylinderType}
                                onValueChange={(itemValue) => setCylinderType(itemValue)}
                                style={styles.picker}
                            >
                                {cylinderTypes.map((type) => (
                                    <Picker.Item key={type} label={`${type} kg`} value={type} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Cylinder Count:</Text>
                        <TextInput
                            placeholder="Enter Cylinder Count"
                            value={cylinderCount}
                            onChangeText={setCylinderCount}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                    </View>

                    {cylinderCountError && (
                        <Text style={styles.errorText}>{cylinderCountError}</Text>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Request Date:</Text>
                        <View style={styles.dateContainer}>
                            <TextInput
                                placeholder="yyyy-mm-dd"
                                value={requestDate}
                                editable={false}
                                style={[styles.input, styles.dateInput]}
                                placeholderTextColor="#888"
                            />
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateButtonText}>Select Date</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={requestDate ? new Date(requestDate) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
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
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    scrollView: {
        flex: 1,
    },
    formContainer: {
        padding: 20,
        backgroundColor: "white",
        margin: 20,
        borderRadius: 10,
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
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 5,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    picker: {
        height: 55,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dateInput: {
        flex: 1,
    },
    dateButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        minWidth: 100,
    },
    dateButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
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
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: "#ff6600",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    submitButton: {
        flex: 1,
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
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

export default OrgGasReqForm;