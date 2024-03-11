import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
    authorize,
    refresh,
    revoke,
    prefetchConfiguration,
} from 'react-native-app-auth';
import {
    Page,
    Button,
    ButtonContainer,
    Form,
    FormLabel,
    FormValue,
    Heading,
} from '../components';
import { encode as base64Encode } from 'base-64';

const configs = {
    identityserver: {
        issuer: 'https://dev-33134057.okta.com',
        clientId: '0oaafopxe4BoWXYN25d7',
        redirectUrl: 'com.okta.dev-33134057:/callback',
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        serviceConfiguration: {
            authorizationEndpoint: 'https://dev-33134057.okta.com/oauth2/v1/authorize',
            tokenEndpoint: 'https://dev-33134057.okta.com/oauth2/v1/token',
            registrationEndpoint: 'https://dev-33134057.okta.com/oauth2/v1/clients'
        },
        additionalParameters: {
            prompt: 'login'  // none , consent , login
        },
    },

};

const defaultAuthState = {
    hasLoggedInOnce: false,
    provider: '',
    accessToken: '',
    accessTokenExpirationDate: '',
    refreshToken: '',
};

const OktaLogin = ({ navigation }) => {
    const [authState, setAuthState] = useState(defaultAuthState);
    React.useEffect(() => {
        prefetchConfiguration({
            warmAndPrefetchChrome: true,
            connectionTimeoutSeconds: 5,
            ...configs.auth0,
        });
    }, []);

    const handleAuthorize = useCallback(async provider => {
        try {
            const config = configs[provider];
            console.log("config", config)
            const newAuthState = await authorize({
                ...config,
                connectionTimeoutSeconds: 5,
                iosPrefersEphemeralSession: true,
            });
            console.log("newAuthState", newAuthState)
            setAuthState({
                hasLoggedInOnce: true,
                provider: provider,
                ...newAuthState,
            });
        } catch (error) {
            Alert.alert('Failed to log in', error.message);
        }
    }, []);

    const handleRefresh = useCallback(async () => {
        try {
            const config = configs[authState.provider];
            const newAuthState = await refresh(config, {
                refreshToken: authState.refreshToken,
            });

            setAuthState(current => ({
                ...current,
                ...newAuthState,
                refreshToken: newAuthState.refreshToken || current.refreshToken,
            }));
        } catch (error) {
            Alert.alert('Failed to refresh token', error.message);
        }
    }, [authState]);

    const handleRevoke = useCallback(async () => {
        try {
            const config = configs[authState.provider];
            await revoke(config, {
                tokenToRevoke: authState.accessToken,
                sendClientId: true,
            });

            setAuthState({
                provider: '',
                accessToken: '',
                accessTokenExpirationDate: '',
                refreshToken: '',
            });
        } catch (error) {
            Alert.alert('Failed to revoke token', error.message);
        }
    }, [authState]);

    const handleLogout = useCallback(async () => {
        try {
            const config = configs[authState.provider];
            await await logout(config, {
                idToken: authState.idToken,
                postLogoutRedirectUrl: 'com.okta.dev-33134057:/logout'
            });
            setAuthState({
                provider: '',
                accessToken: '',
                accessTokenExpirationDate: '',
                refreshToken: '',
            });
        } catch (error) {
            Alert.alert('Failed to logout token', error.message);
        }
    }, [authState]);

    const showRevoke = useMemo(() => {
        if (authState.accessToken) {
            const config = configs[authState.provider];
            if (config.issuer || config.serviceConfiguration.revocationEndpoint) {
                return true;
            }
        }
        return false;
    }, [authState]);

    return (
        <Page>
            {authState.accessToken ? (
                <Form>
                    <FormLabel>accessToken</FormLabel>
                    <FormValue>{authState.accessToken}</FormValue>
                    <FormLabel>accessTokenExpirationDate</FormLabel>
                    <FormValue>{authState.accessTokenExpirationDate}</FormValue>
                    <FormLabel>refreshToken</FormLabel>
                    <FormValue>{authState.refreshToken}</FormValue>

                </Form>
            ) : (
                <FormLabel style={{ textAlign: 'center', marginTop: 120, fontSize: 32, }}>{authState.hasLoggedInOnce ? 'Goodbye.' : 'Hello, stranger.'}</FormLabel>
            )}

            <ButtonContainer>
                {!authState.accessToken ? (
                    <>
                        <Button
                            onPress={() => handleAuthorize('identityserver')}
                            text="Authorize"
                            color="#DA2536"
                        />

                        <Button
                            onPress={() => {
                                navigation.navigate("deviceScan")
                            }}
                            text="Sensor"
                            color="#DA2536"
                        />

                    </>
                ) : null}
                {authState.refreshToken ? (
                    <Button onPress={handleRefresh} text="Refresh" color="#24C2CB" />
                ) : null}
                {showRevoke ? (
                    <Button onPress={handleRevoke} text="Revoke" color="#EF525B" />
                ) : null}
                {authState.refreshToken ? (
                    <Button onPress={
                        () => { navigation.navigate("deviceScan") }
                    } text="Sensor" color="#24C2CB" />
                ) : null}
            </ButtonContainer>

        </Page>
    );
};

export default OktaLogin;