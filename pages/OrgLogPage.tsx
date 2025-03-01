import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, SafeAreaView } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  OrgHomePage: { orgPrimaryKey: string };
  OrgLogPage: undefined;
  OrgRegForm: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgLogPage">;

interface OrganizationData {
  email: string;
  password: string;
}

const OrgLogPage: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const organizationsRef = ref(rtdb, 'OrganizationRegistration');
      const emailQuery = query(organizationsRef, orderByChild('email'), equalTo(email));
      const querySnapshot = await get(emailQuery);

      if (!querySnapshot.exists()) {
        setError("Invalid email or password");
        return;
      }

      const data = querySnapshot.val() as Record<string, OrganizationData>;
      const entries = Object.entries(data);
      
      if (entries.length === 0) {
        setError("Invalid email or password");
        return;
      }

      const [orgId, orgData] = entries[0];
      const encodedPassword = encodePassword(password);

      if (orgData.password === encodedPassword) {
        Alert.alert(
          "Login Successful",
          "Welcome back!",
          [
            {
              text: "OK",
              onPress: () => navigation.replace("OrgHomePage", { 
                orgPrimaryKey: orgId 
              })
            }
          ]
        );
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoid}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Organization Login</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <TextInput
              onChangeText={setEmail}
              value={email}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                onChangeText={setPassword}
                value={password}
                placeholder="Password"
                secureTextEntry={secureTextEntry}
                style={styles.input}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIcon}
              >
                <Text>{secureTextEntry ? "👁" : "👁"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate("OrgRegForm")} 
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerTextBold}>Register Now</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoid: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  formContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignSelf: "center",
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
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
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  loginButton: {
    backgroundColor: "#ff6600",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  loginButtonDisabled: {
    backgroundColor: "#FFB347",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
  registerButton: {
    marginTop: 15,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  registerTextBold: {
    color: "#ff6600",
    fontWeight: "600",
  },
});

export default OrgLogPage;