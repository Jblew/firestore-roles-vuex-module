import { AccountRecord } from "firestore-roles";

export type Account = AccountRecord;

export namespace Account {
    export function validate(account: Account) {
        AccountRecord.validate(account);
    }

    export function fromFirebaseUserInfo(userInfo: firebase.UserInfo): Account {
        const account: AccountRecord = {
            uid: userInfo.uid,
            displayName: userInfo.displayName,
            email: userInfo.email,
            providerId: userInfo.providerId,
            phoneNumber: null, // skip phone number in db
            photoURL: userInfo.photoURL,
        };
        AccountRecord.validate(account);
        return account;
    }
}
