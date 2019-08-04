import { AuthModule as Me } from "./AuthModule";

export function constructState(): Me.State {
    const state: Me.State = {
        state: Me.AuthState.LOADING,
        profileImageURL: undefined,
        username: undefined,
        uid: "",
    };
    Me.validateState(state);
    return state;
}
