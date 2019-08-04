import { AccountRecord } from "firestore-roles";

export type Account = AccountRecord;

export namespace Account {
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
