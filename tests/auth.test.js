import test from 'node:test';
import assert from 'node:assert/strict';
import {mealbridgeAction} from '../functions/index.js';
test('server rejects unauthenticated mutation',async()=>{await assert.rejects(mealbridgeAction.run({data:{action:'onboard'}}),error=>error.code==='unauthenticated');});
test('server rejects non-Google sign-in providers',async()=>{await assert.rejects(mealbridgeAction.run({auth:{uid:'test',token:{email_verified:true,firebase:{sign_in_provider:'password'}}},data:{action:'onboard'}}),error=>error.code==='unauthenticated');});
test('server rejects unverified Google email',async()=>{await assert.rejects(mealbridgeAction.run({auth:{uid:'test',token:{email_verified:false,firebase:{sign_in_provider:'google.com'}}},data:{action:'onboard'}}),error=>error.code==='unauthenticated');});
