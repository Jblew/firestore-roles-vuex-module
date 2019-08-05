// tslint:disable member-ordering
import FirestoreRoles, { AccountRecord } from "firestore-roles";
import * as _ from "lodash";

import { Account } from "../Account";
import { Configuration } from "../Configuration";

export class RolesAdapter {
    private firestoreRoles: FirestoreRoles;
    private availableRoles: string[];

    public constructor(config: Configuration, firestore: firebase.firestore.Firestore) {
        this.firestoreRoles = new FirestoreRoles(config.roles, firestore);
        this.availableRoles = _.keys(config.roles.roles);
    }

    public getAvailableRoles(): string[] {
        return this.availableRoles;
    }

    public isAvailableRole(role: string) {
        return this.availableRoles.indexOf(role) >= 0;
    }

    public async userExists(uid: string) {
        return await this.firestoreRoles.userExists(uid);
    }

    public async registerUser(account: Account) {
        return await this.firestoreRoles.registerUser(account);
    }

    public async hasRole(uid: string, role: string) {
        return await this.firestoreRoles.hasRole(uid, role);
    }

    public async isRoleRequestedByUser(uid: string, role: string) {
        return await this.firestoreRoles.isRoleRequestedByUser(uid, role);
    }

    public async getUidsInRole(role: string) {
        return await this.firestoreRoles.getUidsInRole(role);
    }

    public async getUidsRequestingRole(role: string) {
        return await this.firestoreRoles.getUidsRequestingRole(role);
    }

    public async getAccountRecord(uid: string): Promise<AccountRecord> {
        return await this.firestoreRoles.getAccountRecord(uid);
    }

    public async enableRole(uid: string, role: string) {
        return await this.firestoreRoles.enableRole(uid, role);
    }

    public async disableRole(uid: string, role: string) {
        return await this.firestoreRoles.disableRole(uid, role);
    }

    public async requestRole(uid: string, role: string) {
        return await this.firestoreRoles.requestRole(uid, role);
    }

    public async removeRoleRequest(uid: string, role: string) {
        return await this.firestoreRoles.removeRoleRequest(uid, role);
    }
}
