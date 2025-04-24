import React from "react";
import { Dimensions, TouchableWithoutFeedback, Keyboard } from "react-native";
const { width, height } = Dimensions.get("window");

export const wp = (p) => width * (p / 100);
export const hp = (p) => height * (p / 100);

export const DismissKeyboard = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {children}
    </TouchableWithoutFeedback>
);