import { Module } from "vuex";

import { Configuration } from "../Configuration";

import { AuthModule as Me } from "./AuthModule";
import { constructActions } from "./impl_actions";
import { getters } from "./impl_getters";
import { constructMutations } from "./impl_mutations";
import { constructState } from "./impl_state";

export namespace AuthModuleImpl {
    export function constructModule(
        config: Configuration,
        firebaseAuth: firebase.auth.Auth,
        firestore: firebase.firestore.Firestore,
    ): Module<Me.State, any> {
        return {
            state: constructState(),
            mutations: constructMutations(),
            actions: constructActions(config, firebaseAuth, firestore),
            getters,
        };
    }
}
