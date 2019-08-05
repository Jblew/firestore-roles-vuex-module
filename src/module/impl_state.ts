import { RolesAuthModule as Me } from "./RolesAuthModule";

export function constructState(): Me.State {
    const state: Me.State = {
        state: Me.AuthState.LOADING,
        roles: {},
        roleRequests: {},
    };
    Me.State.validate(state);
    return state;
}
