import { GetterTree } from "vuex";

import { AuthModule as Me } from "./AuthModule";

export const getters: GetterTree<Me.State, Me.State> = {
    [Me.Getters.isAuthenticated]: (state: Me.State): boolean => state.state === Me.AuthState.AUTHENTICATED,
    [Me.Getters.isNotAuthenticated]: (state: Me.State): boolean => state.state === Me.AuthState.NOTAUTHENTICATED,
};
