// @flow
import type { Observable } from 'relay-runtime';

export type TestLiveResolverContextType = {
    greeting: { myHello: string },
    counter: Observable<number>,
};
