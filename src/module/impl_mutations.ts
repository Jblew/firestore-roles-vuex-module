import ow from "ow";
import { MutationTree } from "vuex";

import { Account } from "../Account";

import { AuthModule as Me } from "./AuthModule";
import { Mutations } from "./Mutations";

export function constructMutations(): MutationTree<Me.State> {
    const setAccount: Mutations.SetAccount.Declaration = (state: Me.State, payload: Account) => {
        Account.validate(payload);

        state.account = { ...payload };
        Me.State.validate(state);
    };

    const resetUser: Mutations.ResetUser.Declaration = (state: Me.State) => {
        state.account = undefined;
        Me.State.validate(state);
    };

    const setState: Mutations.SetState.Declaration = (state: Me.State, payload: { state: Me.AuthState }) => {
        ow(payload, "payload", ow.object);
        ow(
            payload.state,
            "payload.state",
            ow.string.oneOf([Me.AuthState.LOADING, Me.AuthState.AUTHENTICATED, Me.AuthState.NOTAUTHENTICATED]),
        );
        state.state = payload.state;
        Me.State.validate(state);
    };

    const setRole: Mutations.SetRole.Declaration = (state: Me.State, payload: { role: string; hasRole: boolean }) => {
        ow(payload, "payload", ow.object);
        ow(payload.role, "payload.role", ow.string);
        state.roles = { ...state.roles, [payload.role]: payload.hasRole };
        Me.State.validate(state);
    };

    const mutations: MutationTree<Me.State> = {
        [Mutations.SetAccount.name]: setAccount,
        [Mutations.ResetUser.name]: resetUser,
        [Mutations.SetState.name]: setState,
        [Mutations.SetRole.name]: setRole,
    };

    return mutations;
}
