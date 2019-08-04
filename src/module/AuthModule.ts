// tslint:disable:max-classes-per-file

import ow from "ow";
import { Action as VuexAction, ActionContext as VuexActionContext, Dispatch } from "vuex";

import { Account } from "../Account";
import { ow_catch } from "../util";

type ActionFn = VuexAction<AuthModule.State, AuthModule.State>;
type ActionContext = VuexActionContext<AuthModule.State, AuthModule.State>;

export namespace AuthModule {
    export const modulePathName = "auth";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    export enum AuthState {
        LOADING = "LOADING",
        AUTHENTICATED = "AUTHENTICATED",
        NOTAUTHENTICATED = "NOTAUTHENTICATED",
    }

    export interface State {
        state: AuthState;
        account?: Account;
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
        }
    }

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
    }

    export class Getters {
        public static isAuthenticated: string = localName("isAuthenticated");
        public static isNotAuthenticated: string = localName("isNotAuthenticated");
    }
}
