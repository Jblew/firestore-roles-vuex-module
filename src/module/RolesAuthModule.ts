// tslint:disable:max-classes-per-file

import ow from "ow";
import { Action as VuexAction, ActionContext as VuexActionContext, Dispatch } from "vuex";

import { Account } from "../Account";
import { ow_catch } from "../util";

type ActionFn = VuexAction<RolesAuthModule.State, RolesAuthModule.State>;
type ActionContext = VuexActionContext<RolesAuthModule.State, RolesAuthModule.State>;

export namespace RolesAuthModule {
    export const modulePathName = "roles_auth";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    /**
     *
     * State
     */
    export interface State {
        state: AuthState;
        account?: Account;
        roles: {
            [roleName: string]: boolean;
        };
    }
    export namespace State {
        export function validate(state: State) {
            ow(
                state.state,
                "state.state",
                ow.string.oneOf([AuthState.LOADING, AuthState.AUTHENTICATED, AuthState.NOTAUTHENTICATED]),
            );

            ow(
                state.account,
                "state.account",
                ow.any(ow.undefined, ow.object.is(v => ow_catch(() => Account.validate(v as Account)))),
            );

            ow(state.roles, "state.roles", ow.object.valuesOfType(ow.boolean));
        }
    }

    /**
     *
     * Actions
     */
    export namespace Actions {
        export namespace Initialize {
            export const name = localName("initialize");

            export type Declaration = ActionFn & ((c: ActionContext) => void);
            export interface Implementator {
                getAction(): Declaration;
            }

            export function dispatch(dispatchFn: Dispatch) {
                return dispatchFn(name);
            }
        }

        export namespace Logout {
            export const name = localName("logout");

            export type Declaration = ActionFn & ((c: ActionContext) => void);
            export interface Implementator {
                getAction(): Declaration;
            }

            export function dispatch(dispatchFn: Dispatch) {
                return dispatchFn(name);
            }
        }

        export namespace CheckRole {
            export const name = localName("checkRole");

            export type Payload = string;
            export type Declaration = ActionFn & ((c: ActionContext, role: Payload) => void);
            export interface Implementator {
                getAction(): Declaration;
            }

            export function dispatch(dispatchFn: Dispatch, role: Payload) {
                return dispatchFn(name, role);
            }
        }
    }

    /**
     *
     * Getters
     */
    export class Getters {
        public static isAuthenticated: string = localName("isAuthenticated");
        public static isNotAuthenticated: string = localName("isNotAuthenticated");
    }

    /**
     *
     * AuthState
     */
    export enum AuthState {
        LOADING = "LOADING",
        AUTHENTICATED = "AUTHENTICATED",
        NOTAUTHENTICATED = "NOTAUTHENTICATED",
    }
}
