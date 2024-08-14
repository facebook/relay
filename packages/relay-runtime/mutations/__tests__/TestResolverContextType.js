// @flow
import type { Observable } from 'relay-runtime';

export type TestResolverContextType = {
    greeting: { myHello: string },
    counter: Observable<number>,
};
