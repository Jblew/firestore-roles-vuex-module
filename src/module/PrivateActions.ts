export namespace PrivateActions {}
import { Action as VuexAction, ActionContext as VuexActionContext, Dispatch } from "vuex";

import { Account } from "../Account";

import { RolesAuthModule as Me } from "./RolesAuthModule";

type ActionFn = VuexAction<Me.State, Me.State>;
type ActionContext = VuexActionContext<Me.State, Me.State>;

export namespace PrivateActions {
    export namespace EnsureAccountRegistered {
        export const name = Me.localName("ensureAccountRegistered");

        export type Payload = Account;
        export type Declaration = ActionFn & ((c: ActionContext, account: Payload) => void);
        export interface Implementator {
            getAction(): Declaration;
        }

        export function dispatch(dispatchFn: Dispatch, payload: Payload) {
            return dispatchFn(name, payload);
        }
    }
}
