// tslint:disable no-console max-classes-per-file
import * as firebase from "firebase";
import { ActionTree, Commit, Dispatch } from "vuex";

import { Account } from "../Account";
import { AuthAdapter } from "../adapter/AuthAdapter";
import { RolesAdapter } from "../adapter/RolesAdapter";
import { Configuration } from "../Configuration";

import { AuthModule as Me } from "./AuthModule";
import { Mutations } from "./Mutations";
import { PrivateActions } from "./PrivateActions";

/**
 *
 * Initialize
 */
class Initialize implements Me.Actions.Initialize.Implementator {
    private authAdapter: AuthAdapter;

    public constructor(authAdapter: AuthAdapter) {
        this.authAdapter = authAdapter;
    }

    public getAction(): Me.Actions.Initialize.Declaration {
        return ({ commit, dispatch }) => {
            this.authAdapter.initialize({
                onAuthenticated: (user: firebase.UserInfo) => this.onAuthenticated(commit, dispatch, user),
                onNotAuthenticated: () => this.onNotAuthenticated(commit),
                onError: (msg: string) => this.onError(commit, dispatch, msg),
            });
        };
    }

    private onAuthenticated(commit: Commit, dispatch: Dispatch, userInfo: firebase.UserInfo) {
        const account = Account.fromFirebaseUserInfo(userInfo);
        Mutations.SetAccount.commit(commit, account);
        Mutations.SetState.commit(commit, { state: Me.AuthState.AUTHENTICATED });

        PrivateActions.EnsureAccountRegistered.dispatch(dispatch, account);
    }

    private onNotAuthenticated(commit: Commit) {
        console.log("User not authenticated");
        Mutations.SetState.commit(commit, { state: Me.AuthState.NOTAUTHENTICATED });
    }

    private onError(commit: Commit, dispatch: Dispatch, errorMsg: string) {
        Mutations.SetState.commit(commit, { state: Me.AuthState.NOTAUTHENTICATED });
    }
}
/**
 *
 * Logout
 */
class Logout implements Me.Actions.Logout.Implementator {
    private authAdapter: AuthAdapter;

    public constructor(authAdapter: AuthAdapter) {
        this.authAdapter = authAdapter;
    }

    public getAction(): Me.Actions.Logout.Declaration {
        return ({ commit }) => {
            Mutations.SetState.commit(commit, { state: Me.AuthState.LOADING });
            (async () => {
                await this.authAdapter.signOut();
                Mutations.SetState.commit(commit, {
                    state: Me.AuthState.NOTAUTHENTICATED,
                });
                Mutations.ResetUser.commit(commit);
            })();
        };
    }
}

/**
 *
 * EnsureAccountRegistered
 */
class EnsureAccountRegistered implements PrivateActions.EnsureAccountRegistered.Implementator {
    private rolesAdapter: RolesAdapter;
    private config: Configuration;

    public constructor(config: Configuration, rolesAdapter: RolesAdapter) {
        this.config = config;
        this.rolesAdapter = rolesAdapter;
    }

    public getAction(): PrivateActions.EnsureAccountRegistered.Declaration {
        return ({ dispatch }, user: Account) => {
            (async () => {
                try {
                    await this.doEnsureRegistered(user);
                } catch (error) {
                    console.error(error);
                    this.config.callbacks.onError(`Could not ensure user is registered: ${error.message}`);
                }
            })();
        };
    }

    private async doEnsureRegistered(user: Account) {
        const userExists = await this.rolesAdapter.userExists(user.uid);
        if (!userExists) {
            await this.rolesAdapter.registerUser(user);
        }
    }
}

/**
 *
 * Export of actions
 */
export function constructActions(
    config: Configuration,
    auth: firebase.auth.Auth,
    firestore: firebase.firestore.Firestore,
): ActionTree<Me.State, Me.State> {
    const rolesAdapter = new RolesAdapter(config, firestore);
    const authAdapter = new AuthAdapter(auth);

    return {
        [Me.Actions.Initialize.name]: new Initialize(authAdapter).getAction(),
        [Me.Actions.Logout.name]: new Logout(authAdapter).getAction(),
        [PrivateActions.EnsureAccountRegistered.name]: new EnsureAccountRegistered(config, rolesAdapter).getAction(),
    };
}
