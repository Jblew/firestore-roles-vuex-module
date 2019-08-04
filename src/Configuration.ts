import { FirestoreRolesConfiguration } from "firestore-roles";
import ow from "ow";

import { Account } from "./Account";
import { ow_catch } from "./util";

export interface Configuration {
    roles: FirestoreRolesConfiguration;
    callbacks: Configuration.AuthCallbacks;
}

export namespace Configuration {
    export function validate(c: Configuration) {
        FirestoreRolesConfiguration.validate(c.roles, "Configuration.roles ");

        ow(
            c.callbacks,
            "Configuration.callbacks",
            ow.object.is(v => ow_catch(() => AuthCallbacks.validate(v as AuthCallbacks))),
        );
    }

    export interface AuthCallbacks {
        onAuthenticated: (account: Account) => void;
        onError: (msg: string) => void;
        onNotAuthenticated: () => void;
    }

    // tslint:disable no-shadowed-variable
    export namespace AuthCallbacks {
        export function validate(ac: AuthCallbacks) {
            ow(ac.onAuthenticated, "Callbacks.onAuthenticated", ow.function);
            ow(ac.onError, "Callbacks.onError", ow.function);
            ow(ac.onNotAuthenticated, "Callbacks.onNotAuthenticated", ow.function);
        }
    }
}
