import { AuthModule as Me } from "./AuthModule";

export function constructState(): Me.State {
    const state: Me.State = {
        state: Me.AuthState.LOADING,
        roles: {},
    };
    Me.State.validate(state);
    return state;
}
