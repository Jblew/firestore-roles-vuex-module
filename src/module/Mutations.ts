import { Commit, Mutation as VuexMutation } from "vuex";

import { Account } from "../Account";

import { RolesAuthModule as Me } from "./RolesAuthModule";

type MutationFn = VuexMutation<Me.State>;

export namespace Mutations {
    export namespace SetAccount {
        export const name = Me.localName("setAccount");

        export type Payload = Account;
        export type Declaration = MutationFn & ((state: Me.State, payload: Payload) => void);

        export function commit(commitFn: Commit, payload: Payload) {
            return commitFn(name, payload);
        }
    }

    export namespace ResetUser {
        export const name = Me.localName("resetUser");

        export type Declaration = MutationFn & ((state: Me.State) => void);

        export function commit(commitFn: Commit) {
            return commitFn(name);
        }
    }

    export namespace SetState {
        export const name = Me.localName("setState");

        export interface Payload {
            state: Me.AuthState;
        }
        export type Declaration = MutationFn & ((state: Me.State, payload: Payload) => void);

        export function commit(commitFn: Commit, payload: Payload) {
            return commitFn(name, payload);
        }
    }

    export namespace SetRole {
        export const name = Me.localName("setRole");

        export interface Payload {
            role: string;
            hasRole: boolean;
        }
        export type Declaration = MutationFn & ((state: Me.State, payload: Payload) => void);

        export function commit(commitFn: Commit, payload: Payload) {
            return commitFn(name, payload);
        }
    }
}
