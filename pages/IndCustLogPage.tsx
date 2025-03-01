import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
    IndCustHomePage: { custPrimaryKey: string };
    IndCustLogPage: undefined;
    IndCustProfile: { custPrimaryKey: string };
    IndCustRegForm: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "IndCustLogPage">;

interface CustomerData {
    email: string;
    password: string;
}

const IndCustLogPage: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please enter both Email and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const customersRef = ref(rtdb, 'CustomerRegistration');
            const emailQuery = query(customersRef, orderByChild('email'), equalTo(email));
            const querySnapshot = await get(emailQuery);

            if (!querySnapshot.exists()) {
                setError("Invalid email or password");
                setLoading(false);
                return;
            }

            const data = querySnapshot.val() as Record<string, CustomerData>;
            const entries = Object.entries(data);
            
            if (entries.length === 0) {
                setError("Invalid email or password");
                setLoading(false);
                return;
            }

            const [userNic, userData] = entries[0];

            const encodedPassword = encodePassword(password);
            if (userData.password === encodedPassword) {
                Alert.alert(
                    "Success",
                    "Login successful!",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.replace("IndCustHomePage", { 
                                custPrimaryKey: userNic 
                            })
                        }
                    ]
                );
            } else {
                setError("Invalid email or password");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An error occurred while logging in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Login to Your Account</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        placeholderTextColor="#888"
                        secureTextEntry
                        autoComplete="password"
                    />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity 
                    style={[
                        styles.loginButton,
                        loading && styles.loginButtonDisabled
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginButtonText}>
                        {loading ? "Logging in..." : "Login"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("IndCustRegForm")}>
                        <Text style={styles.registerLink}>Register Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
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
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 15,
    },
    loginButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    loginButtonDisabled: {
        backgroundColor: "#ffb380",
    },
    loginButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    registerText: {
        fontSize: 16,
        color: "#333",
    },
    registerLink: {
        fontSize: 16,
        color: "#ff6600",
        fontWeight: "bold",
    },
});

export default IndCustLogPage;