# Firestore-roles Vuex module

Vuex module for auth using firebase auth and firestore-roles system

## Usage

**1. Install**

```bash
$ npm install --save firestore-roles-vuex-module
```

**2. Define store types: `Store.ts`**

```typescript
import { RolesAuthModule } from "firestore-roles-vuex-module";

export interface Store {
    state: Store.State;
    dispatch: Dispatch;
    commit: Commit;
    getters: any;
}

export namespace Store {
    export interface Modules {
        // ...
        [RolesAuthModule.modulePathName]: Module<RolesAuthModule.State, RootStore.State>;
    }

    export type State = {
        // ...
        [RolesAuthModule.modulePathName]: RolesAuthModule.State;
    } & RootStore.State;
}
```

**4. Define initialization function in `RootStoreImpl.ts`**

```typescript
import { ActionContext, ActionTree } from "vuex";

import { mutations } from "./impl_mutations";
import { state } from "./impl_state";
import { RootStore as Me } from "./RootStore";

export namespace RootStoreImpl {
    function constructActions(initActionCb: (context: ActionContext<Me.State, Me.State>) => void) {
        const actions: ActionTree<Me.State, Me.State> = {
            [Me.Actions.initialize]: (context: ActionContext<Me.State, Me.State>): void => {
                setInterval(() => {
                    context.commit(Me.Mutations.updateNowTimer);
                }, 1000);

                initActionCb(context);
            },
        };
        return actions;
    }

    export function constructRootStore(initActionCb: (context: ActionContext<Me.State, Me.State>) => void) {
        const store = {
            actions: constructActions(initActionCb),
            mutations,
            state,
        };
        return store;
    }
}
```

**3. Create store implementation: `StoreImpl.ts`**

```typescript
export namespace StoreImpl {
    /**
     * Store
     */
    export function constructStore(): VuexStore<RootStore.State> {
        /**
         *
         * Constructors
         */
        function constructAuthModule() {
            return AuthModuleConstructor.constructAuthModule(
                {
                    onAuthenticated: (account: Account) => {
                        /* */
                    },
                    onNotAuthenticated: () => {
                        /* */
                    },
                    onError: (message: string) =>
                        // referencing store here is possible because js has lexical scope
                        NotificationsModule.Actions.ShowNotification.dispatch(store.dispatch, {
                            message,
                            timeoutMs: 5000,
                            params: { color: "red" },
                        }),
                },
                firebase.auth(),
                firebase.firestore(),
            );
        }

        /**
         *
         * Initialization
         */
        const initializer: ActionHandler<RootStore.State, RootStore.State> = ({ dispatch }) => {
            NotificationsModule.Actions.Initialize.dispatch(dispatch);
            RolesAuthModule.Actions.Initialize.dispatch(dispatch);
        };

        /**
         *
         * Module loading
         */
        const modules: Store.Modules & ModuleTree<RootStore.State> = {
            [RolesAuthModule.modulePathName]: constructAuthModule(),
            [NotificationsModule.modulePathName]: NotificationsModuleImpl.module,
            // ...
        };

        /**
         *
         * Store
         */
        const store = new Vuex.Store<RootStore.State>({
            strict: window.location.hostname === "localhost" ? true : false,
            ...RootStoreImpl.constructRootStore(initializer),
            modules,
        });

        return store;
    }
}
```

**4. Import vuex store in main: `main.ts` and call initialize action**

```typescript
// In order for the notifications to disappear you have to dispatch initialize action
export default () =>
    new Vue({
        // ...
        store: StoreImpl.constructStore(),
        created() {
            initFirebase();
            RolesAuthModule.Actions.Initialize.dispatch(this.$store.dispatch);
        },
    });
```

**5. Somewhere in your app: Access auth state**

```typescript
import { Account, RolesAuthModule } from "firestore-roles-vuex-module";

export default Vue.extend({
    computed: {
        authenticated(): boolean {
            return RolesAuthModule.stateOf(this).state === AuthModule.AuthState.AUTHENTICATED;
        },
        account(): Account | undefined {
            return RolesAuthModule.stateOf(this).account;
        },
        photoUrl(): string {
            return this.account ? this.account.photoUrl : "";
        },
        name(): string {
            return this.account ? this.account.displayName : "";
        },
        isAdmin(): boolean {
            // will be undefined until you call RolesAuthModule.Actions.CheckRole.dispatch(this.$store.dispatch, "admin");
            return RolesAuthModule.stateOf(this).roles.admin === true;
        },
    },
    methods: {
        signOut() {
            RolesAuthModule.Actions.Logout.dispatch(this.$store.dispatch);
        },
        checkRole() {
            RolesAuthModule.Actions.CheckRole.dispatch(this.$store.dispatch, "admin");
        },
    },
});
```

**6. Sample utilizing component: `NotificationsSnackbar.vue` using vuetify v-snackbar**

```html
<template>
    <div>
        <v-snackbar v-model="opened" :color="this.color">{{ message }}</v-snackbar>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import { RolesAuthModule } from "firestore-roles-vuex-module";

    export default Vue.extend({
        computed: {
            opened(): boolean {
                return RolesAuthModule.stateOf(this).notifications.length > 0;
            },
            message(): string {
                const message = this.opened ? RolesAuthModule.stateOf(this).notifications[0].message : "";
                return message;
            },
            params(): any {
                return this.opened ? RolesAuthModule.stateOf(this).notifications[0].params : {};
            },
            color(): string | undefined {
                return this.params.color || undefined;
            },
        },
    });
</script>
```
