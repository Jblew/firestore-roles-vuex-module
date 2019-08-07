// tslint:disable max-classes-per-file
import * as firebase from "firebase/app";
import * as _ from "lodash";
import ow from "ow";
import { ActionTree, Commit, Dispatch } from "vuex";

import { Account } from "../Account";
import { AuthAdapter } from "../adapter/AuthAdapter";
import { RolesAdapter } from "../adapter/RolesAdapter";
import { Configuration } from "../Configuration";

import { Mutations } from "./Mutations";
import { PrivateActions } from "./PrivateActions";
import { RolesAuthModule as Me } from "./RolesAuthModule";

/**
 *
 * Initialize
 */
class Initialize implements Me.Actions.Initialize.Implementator {
    private config: Configuration;
    private authAdapter: AuthAdapter;

    public constructor(config: Configuration, authAdapter: AuthAdapter) {
        this.config = config;
        this.authAdapter = authAdapter;
    }

    public getAction(): Me.Actions.Initialize.Declaration {
        return ({ commit, dispatch }) => {
            this.authAdapter.initialize({
                onAuthenticated: (user: firebase.UserInfo) => this.onAuthenticated(commit, dispatch, user),
                onNotAuthenticated: () => this.onNotAuthenticated(commit),
                onError: (msg: string) => this.onError(commit, msg),
            });
        };
    }

    private onAuthenticated(commit: Commit, dispatch: Dispatch, userInfo: firebase.UserInfo) {
        const account = Account.fromFirebaseUserInfo(userInfo);
        Mutations.SetAccount.commit(commit, account);
        Mutations.SetState.commit(commit, { state: Me.AuthState.AUTHENTICATED });

        PrivateActions.EnsureAccountRegistered.dispatch(dispatch, account);

        this.config.callbacks.onAuthenticated(account);
    }

    private onNotAuthenticated(commit: Commit) {
        Mutations.SetState.commit(commit, { state: Me.AuthState.NOTAUTHENTICATED });

        this.config.callbacks.onNotAuthenticated();
    }

    private onError(commit: Commit, errorMsg: string) {
        Mutations.SetState.commit(commit, { state: Me.AuthState.NOTAUTHENTICATED });

        this.config.callbacks.onError(errorMsg);
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
 * CheckRoles
 */
class CheckRole implements Me.Actions.CheckRole.Implementator {
    private rolesAdapter: RolesAdapter;
    private config: Configuration;

    public constructor(config: Configuration, rolesAdapter: RolesAdapter) {
        this.config = config;
        this.rolesAdapter = rolesAdapter;
    }

    public getAction(): Me.Actions.CheckRole.Declaration {
        return ({ commit, state }, role: string) => {
            (async () => {
                try {
                    this.validateInput(role, state.account);

                    const hasRole = await this.doCheckRole(state.account!.uid, role);
                    Mutations.SetRole.commit(commit, { role, hasRole });

                    if (!hasRole) {
                        const isRequestingRole = await this.doCheckRoleRequest(state.account!.uid, role);
                        Mutations.SetRoleRequest.commit(commit, { role, isRequestingRole });
                    }
                } catch (error) {
                    this.config.callbacks.onError(`Could not ensure user is registered: ${error.message}`);
                }
            })();
        };
    }

    private async doCheckRole(uid: string, role: string): Promise<boolean> {
        return await this.rolesAdapter.hasRole(uid, role);
    }

    private async doCheckRoleRequest(uid: string, role: string): Promise<boolean> {
        return await this.rolesAdapter.isRoleRequestedByUser(uid, role);
    }

    private validateInput(role: string, account: object | undefined) {
        ow(role, "role", ow.string.oneOf(_.keys(this.config.roles.roles)));
        if (!account) throw new Error("Cannot get role before authentication");
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
        return ({}, user: Account) => {
            (async () => {
                try {
                    await this.doEnsureRegistered(user);
                } catch (error) {
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
        [Me.Actions.Initialize.name]: new Initialize(config, authAdapter).getAction(),
        [Me.Actions.Logout.name]: new Logout(authAdapter).getAction(),
        [Me.Actions.CheckRole.name]: new CheckRole(config, rolesAdapter).getAction(),
        [PrivateActions.EnsureAccountRegistered.name]: new EnsureAccountRegistered(config, rolesAdapter).getAction(),
    };
}
