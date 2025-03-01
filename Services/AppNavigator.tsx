import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";


import IndCustRegForm from "../pages/IndCustRegForm";
import IndCustLogPage from "../pages/IndCustLogPage";
import IndCustHomePage from "../pages/IndCustHomePage";
import IndCustGasReqForm from "../pages/IndCustGasReqForm";
import IndCustProfile from "../pages/IndCustProfile";
import IndCustOrderHistory from "../pages/IndCustOrderHistory";
import CustFindOutletPage from "../pages/CustFindOutletPage";

import OrgRegForm from "../pages/OrgRegForm";
import OrgLogPage from "../pages/OrgLogPage";
import OrgHomePage from "../pages/OrgHomePage";
import OrgGasReqForm from "../pages/OrgGasReqForm";
import OrgOrderHistory from "../pages/OrgOrderHistory";
import OrgProfile from "../pages/OrgProfile";
import OrgFindOutletPage from "../pages/OrgFindOutletPage";

import UserTypePage from "../pages/UserTypePage";



type RootStackParamList = {
  IndCustRegForm: undefined;
  IndCustLogPage: undefined;
  IndCustHomePage: { custPrimaryKey: string };
  IndCustGasReqForm: { selectedOutlet: string };
  IndCustOrderHistory: { custPrimaryKey: string };
  IndCustProfile: { custPrimaryKey: string };
  CustFindOutletPage: { custPrimaryKey: string };
  
  OrgRegForm: undefined;
  OrgLogPage: undefined;
  OrgGasReqForm: { selectedOutlet?: string };
  OrgHomePage: { orgPrimaryKey: string };
  OrgOrderHistory: { orgPrimaryKey: string };
  OrgProfile: { orgPrimaryKey: string };
  OrgFindOutletPage: undefined;

  UserTypePage: undefined;
};


const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="UserTypePage"
        screenOptions={{
          headerShown: false,
          title: "", }}>
        <Stack.Screen
          name="IndCustRegForm"
          component={IndCustRegForm}
          options={{
            headerShown: false,
            title: "Customer Registration",
          }}
        />
        <Stack.Screen
          name="IndCustLogPage"
          component={IndCustLogPage}
          options={{
            headerShown: false,
            title: "Customer Login",
          }}
        />
        <Stack.Screen
          name="IndCustHomePage"
          component={IndCustHomePage}
          options={{
            headerShown: false,
            title: "Customer Home Page",
          }}
        />
        <Stack.Screen
          name="IndCustGasReqForm"
          component={IndCustGasReqForm}
          options={{
            headerShown: false,
            title: "Customer Gas Request",
          }}
        />
        <Stack.Screen
          name="OrgRegForm"
          component={OrgRegForm}
          options={{
            headerShown: false,
            title: "Organization Registration",
          }}
        />
        <Stack.Screen
          name="OrgLogPage"
          component={OrgLogPage}
          options={{
            headerShown: false,
            title: "Organization Login",
          }}
        />
        <Stack.Screen
          name="OrgHomePage"
          component={OrgHomePage}
          options={{
            headerShown: false,
            title: "Organization Home Page",
          }}
        />
        <Stack.Screen
          name="OrgGasReqForm"
          component={OrgGasReqForm}
          options={{
            headerShown: false,
            title: "Organization Gas Request",
          }}
        />
        <Stack.Screen
          name="CustFindOutletPage"
          component={CustFindOutletPage}
          options={{
            headerShown: false,
            title: "Find Outlet",
          }}
        />
        <Stack.Screen
          name="UserTypePage"
          component={UserTypePage}
          options={{
            headerShown: false,
            title: "User Type Selection",
          }}
        />
        <Stack.Screen
          name="IndCustOrderHistory"
          component={IndCustOrderHistory}
          options={{
            headerShown: false,
            title: "Customer Order History",
          }}
        />
        <Stack.Screen
          name="OrgOrderHistory"
          component={OrgOrderHistory}
          options={{
            headerShown: false,
            title: "Organization Order History",
          }}
        />
        <Stack.Screen
          name="IndCustProfile"
          component={IndCustProfile}
          options={{
            headerShown: false,
            title: "Customer Profile",
          }}
        />
        <Stack.Screen
          name="OrgProfile"
          component={OrgProfile}
          options={{
            headerShown: false,
            title: "Organization Profile",
          }}
        />
        <Stack.Screen
          name="OrgFindOutletPage"
          component={OrgFindOutletPage}
          options={{
            headerShown: false,
            title: "Notification",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;