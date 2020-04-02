import React, {Component} from "react";
import {Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View} from "react-native";
import {StackNavigationProp} from "@react-navigation/stack";
import {RouteProp} from '@react-navigation/native';
import {Icon, Input, Item, Label, Toast} from 'native-base';
import {colors} from "../../../theme";
import {UserNotFoundException} from "../../core/Exception";
import i18n from "../../locale/i18n"
import {fontStyles} from "../../../theme";
import {BrandedButton, ClickableText, RegularText} from "../../components/Text";
import UserService, {isUSLocale} from "../../core/user/UserService";
import {ScreenParamList} from "../ScreenParamList";

type PropsType = {
    navigation: StackNavigationProp<ScreenParamList, 'Login'>
    routeProp: RouteProp<ScreenParamList, 'Login'>;
}

type StateType = {
    hasUserValidationError: boolean,
    hasPassValidationError: boolean
}

const initialState: StateType = {
    hasUserValidationError: false,
    hasPassValidationError: false
}

export class LoginScreen extends Component<PropsType, StateType> {
    private passwordField: Input | null
    private errorMessage = ""
    private username = ""
    private password = ""

    constructor(props: PropsType) {
        super(props);
        this.state = initialState;
        this.handleLogin = this.handleLogin.bind(this)
    }

    componentDidMount() {
    }

    private getWelcomeRepeatScreenName() {
        return isUSLocale() ? 'WelcomeRepeatUS' : 'WelcomeRepeat'
    }

    handleLogin() {
        this.errorMessage = ""
        const username = this.username.trim();
        this.setState({
            hasUserValidationError: username == "",
            hasPassValidationError: this.password == ""
        })

        if (username == "" || this.password == "") {
            return;
        }

        const userService = new UserService();
        userService.login(username, this.password)
            .then(response => {
                // TODO: Support multiple users.
                const patientId = response.user.patients[0];
                this.props.navigation.reset({
                    index: 0,
                    routes: [{name: this.getWelcomeRepeatScreenName(), params: {patientId: patientId}}],
                })
            })
            .catch(error => {
                if (error.constructor === UserNotFoundException) {
                    this.errorMessage = i18n.t("user-not-found-exception")
                } else {
                    this.errorMessage = i18n.t("login-exception")
                }
                Toast.show({
                    text: this.errorMessage,
                    duration: 2500,
                })
            });
    }

    // todo: validation for email

    render() {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView style={styles.rootContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <View>
                        <Text style={[fontStyles.h1Light, styles.titleText]}>{i18n.t("login-title")}</Text>

                        <View style={styles.formItem}>
                            <Item style={styles.labelPos} floatingLabel error={this.state.hasUserValidationError}>
                                <Label style={styles.labelStyle}>{i18n.t("login-label")}</Label>
                                <Input
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                    autoCompleteType="email"
                                    onChangeText={(username) => {
                                        this.username = username;
                                        if (this.state.hasUserValidationError) {
                                            this.setState({hasUserValidationError: false})
                                        }
                                    }}
                                    onSubmitEditing={() => {
                                        // This complains (but still works) due to issue with Native Base: https://github.com/GeekyAnts/NativeBase/issues/1803 so we force ignore.
                                        // @ts-ignore
                                        this.passwordField._root.focus()
                                    }}
                                    blurOnSubmit={false}
                                />
                                {this.state.hasUserValidationError && (
                                    <Icon name='close'/>
                                )}
                            </Item>
                        </View>
                        <View style={styles.formItem}>
                            <Item style={styles.labelPos} floatingLabel error={this.state.hasPassValidationError}>
                                <Label style={styles.labelStyle}>{i18n.t("password")}</Label>
                                <Input
                                    secureTextEntry={true}
                                    returnKeyType="go"
                                    onChangeText={(password) => {
                                        this.password = password
                                        if (this.state.hasPassValidationError) {
                                            this.setState({hasPassValidationError: false})
                                        }
                                    }}
                                    getRef={(inputField) => {
                                        this.passwordField = inputField
                                    }}
                                    onSubmitEditing={this.handleLogin}
                                />
                                {this.state.hasPassValidationError && (
                                    <Icon name='close'/>
                                )}
                            </Item>
                            {/*<Text style={[fontStyles.bodySmallLight, styles.forgotPasswordText]}>{i18n.t("forgot-password")}</Text>*/}
                        </View>
                    </View>

                    <View>
                        <BrandedButton onPress={this.handleLogin}>
                            <Text>{i18n.t("log-in")}</Text>
                        </BrandedButton>
                        <View style={styles.bottomTextView}>
                            <RegularText>{i18n.t("dont-have-account")}</RegularText>
                            <RegularText> </RegularText>
                            <ClickableText onPress={() => this.props.navigation.navigate('Register')}>{i18n.t("create-account")}</ClickableText>
                        </View>

                        <View style={styles.bottomTextView}>
                            <ClickableText onPress={() => this.props.navigation.navigate('ResetPassword')}>Forgot your password?</ClickableText>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        justifyContent: "space-between",
        backgroundColor: colors.backgroundPrimary,
        paddingHorizontal: 24,
        paddingTop: 56
    },
    button: {
        borderRadius: 8,
        height: 56,
        backgroundColor: colors.brand,
    },
    buttonText: {
        color: colors.white,
    },
    titleText: {
        paddingHorizontal: 16,
        paddingBottom: 16
    },
    forgotPasswordText: {
        color: colors.brand,
        alignSelf: 'center',
        padding: 40,
    },
    formItem: {
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    labelStyle: {
        color: colors.tertiary,
        fontSize: 16
    },
    labelPos: {
        paddingBottom: 8,
    },
    bottomTextView: {
        padding: 24,
        justifyContent: "center",
        flexDirection: 'row',
        backgroundColor: colors.backgroundPrimary
    },
    createAccountText: {
        color: colors.brand,
        paddingStart: 4
    }
});