import { firebaseConfig, functionsRegion } from './firebase-config.js';
export const configured = !!(firebaseConfig?.apiKey && firebaseConfig?.projectId && firebaseConfig?.authDomain);
let client;
export async function connect() {
    if (!configured) throw Error('Google sign-in is not available yet. The site owner needs to connect Firebase.');
    if (!client) client = Promise.all(['app', 'auth', 'firestore', 'functions'].map(name => import(`https://www.gstatic.com/firebasejs/12.19.0/firebase-${name}.js`))).then(([a, u, d, f]) => {
        const app = a.initializeApp(firebaseConfig), auth = u.getAuth(app), db = d.getFirestore(app), functions = f.getFunctions(app, functionsRegion);
        return { auth, db, u, d, call: f.httpsCallable(functions, 'mealbridgeAction') };
    }).catch(err => { client = null; throw err; });
    return client;
}
export async function signIn() { const c = await connect(); const provider = new c.u.GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' }); return c.u.signInWithPopup(c.auth, provider); }
export async function signOut() { const c = await connect(); return c.u.signOut(c.auth); }
export async function action(action, data = {}) { const c = await connect(); return (await c.call({ action, ...data })).data; }
export async function observe(update, fail) {
    const c = await connect(); let subscriptions = [], generation = 0;
    return c.u.onAuthStateChanged(c.auth, async user => {
        const turn = ++generation; subscriptions.forEach(fn => fn()); subscriptions = [];
        update({ user, profile: null, admin: false, loading: !!user, listings: [], organizations: [], ngoReservations: [], hostelReservations: [], requests: [], reports: [] });
        const watch = (q, key) => subscriptions.push(c.d.onSnapshot(q, { includeMetadataChanges: true }, snap => { if (turn === generation) update({ [key]: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })), ...(key === 'listings' ? { dataLoading: snap.metadata.fromCache } : {}) }); }, err => { if (turn === generation) fail(err); }));
        watch(c.d.collection(c.db, 'listings'), 'listings');
        watch(c.d.query(c.d.collection(c.db, 'organizations'), c.d.where('status', '==', 'approved')), 'organizations');
        if (!user) return;
        try {
            let token = await user.getIdTokenResult();
            if (user.email?.toLowerCase() === 'suryanshdevniranjan@gmail.com' && !token.claims.admin) { const result = (await c.call({ action: 'initializeAdmin' })).data; if (result.admin) token = await user.getIdTokenResult(true); } if (turn !== generation) return;
            update({ admin: token.claims.admin === true });
            subscriptions.push(c.d.onSnapshot(c.d.doc(c.db, 'users', user.uid), snapshot => { if (turn === generation) update({ profile: snapshot.exists() ? snapshot.data() : null, loading: false }); }, fail));
            for (const key of ['ngoUid', 'hostelUid']) watch(c.d.query(c.d.collection(c.db, 'reservations'), c.d.where(key, '==', user.uid)), key === 'ngoUid' ? 'ngoReservations' : 'hostelReservations');
            if (token.claims.admin === true) { watch(c.d.collection(c.db, 'users'), 'requests'); watch(c.d.collection(c.db, 'reports'), 'reports'); }
        } catch (err) { if (turn === generation) { update({ loading: false }); fail(err); } }
    });
}
