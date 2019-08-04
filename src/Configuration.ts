import { FirestoreRolesConfiguration } from "firestore-roles";
import ow from "ow";

import { Account } from "./Account";

export interface Configuration {
    roles: FirestoreRolesConfiguration;
    callbacks: {
        onAuthenticated: (account: Account) => void;
        onError: (msg: string) => void;
        onNotAuthenticated: () => void;
    };
}

export namespace Configuration {
    export function validate(c: Configuration) {
        FirestoreRolesConfiguration.validate(c.roles, "Configuration.roles ");

        ow(c.callbacks, "Configuration.callbacks", ow.object);
        ow(c.callbacks.onAuthenticated, "Configuration.callbacks.onAuthenticated", ow.function);
        ow(c.callbacks.onError, "Configuration.callbacks.onError", ow.function);
        ow(c.callbacks.onNotAuthenticated, "Configuration.callbacks.onNotAuthenticated", ow.function);
    }
}
