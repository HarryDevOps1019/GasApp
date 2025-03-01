import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity, ScrollView, Image } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, set } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from 'expo-image-picker';

type RootStackParamList = {
    OrgHomePage: undefined;
    OrgRegForm: undefined;
    OrgLogPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgRegForm">;

const OrgRegForm: React.FC<Props> = ({ navigation }) => {
    const [busiRegNo, setBusiRegNo] = useState("");
    const [orgName, setOrgName] = useState("");
    const [orgPhoneNumber, setOrgPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);

    const validatePassword = (password: string): boolean => {
        return password.length >= 8;
    };

    const encodePassword = (password: string): string => {
        const salt = "YourSecretSalt123";
        let encodedString = '';
        const textToEncode = password + salt;
        
        for (let i = 0; i < textToEncode.length; i++) {
            const charCode = textToEncode.charCodeAt(i);
            encodedString += charCode.toString(16);
        }
        
        return encodedString;
    };

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert("Permission Required", "You need to grant camera roll permissions to upload images.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                setImageUri(asset.uri);
                if (asset.base64) {
                    setBase64Image(asset.base64);
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image. Please try again.");
        }
    };

    const handleAddDetails = async () => {
        setError("");
        
        if (!busiRegNo || !orgName || !orgPhoneNumber || !email || !password || !address) {
            setError("Fill all the details");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (!validatePassword(password)) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (!base64Image) {
            setError("Please upload a validation image");
            return;
        }

        try {
            const encodedPassword = encodePassword(password);
            const orgRef = ref(rtdb, `OrganizationRegistration/${busiRegNo}`);
            
            await set(orgRef, {
                busiRegNo,
                orgName,
                orgPhoneNumber,
                email,
                password: encodedPassword,
                address,
                validationImage: `data:image/jpeg;base64,${base64Image}`,
            });

            Alert.alert("Register Successful", "Registered your details successfully.", [
                { text: "OK", onPress: () => navigation.replace("OrgHomePage") },
            ]);
            console.log("Data registered successfully");

            handleCancel();
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error adding details: ", error.message);
                console.error("Full error payload: ", error);
            } else {
                console.error("An unexpected error occurred: ", error);
            }
            Alert.alert("Error", "Failed to register the details. Try Again.");
        }
    };

    const handleCancel = () => {
        setBusiRegNo("");
        setOrgName("");
        setOrgPhoneNumber("");
        setEmail("");
        setPassword("");
        setAddress("");
        setImageUri(null);
        setBase64Image(null);
        setError("");
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Organization Registration Form</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Business Registration Number"
                            value={busiRegNo}
                            onChangeText={setBusiRegNo}
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Organization Name"
                            value={orgName}
                            onChangeText={setOrgName}
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Organization Contact Number"
                            value={orgPhoneNumber}
                            onChangeText={setOrgPhoneNumber}
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
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Organization Address"
                            value={address}
                            onChangeText={setAddress}
                            style={styles.input}
                            placeholderTextColor="#888"
                            multiline
                        />
                    </View>

                    <View style={styles.validationContainer}>
                        <Text style={styles.validationLabel}>Validation:</Text>
                        <TouchableOpacity 
                            style={styles.pickButton}
                            onPress={pickImage}
                        >
                            <Text style={styles.pickButtonText}>Pick</Text>
                        </TouchableOpacity>
                    </View>

                    {imageUri && (
                        <View style={styles.imagePreviewContainer}>
                            <Image 
                                source={{ uri: imageUri }} 
                                style={styles.imagePreview} 
                                resizeMode="cover"
                            />
                        </View>
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
                            onPress={handleAddDetails}
                        >
                            <Text style={styles.submitButtonText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("OrgLogPage")}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },
    formContainer: {
        width: "90%",
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
    },
    validationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    validationLabel: {
        fontSize: 16,
        marginRight: 10,
        color: "#333",
    },
    pickButton: {
        backgroundColor: "#ff6600",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 5,
    },
    pickButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    imagePreviewContainer: {
        alignItems: "center",
        marginBottom: 15,
    },
    imagePreview: {
        width: 150,
        height: 150,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    loginText: {
        fontSize: 16,
        color: "#333",
    },
    loginLink: {
        fontSize: 16,
        color: "#ff6600",
        fontWeight: "bold",
    }
});

export default OrgRegForm;