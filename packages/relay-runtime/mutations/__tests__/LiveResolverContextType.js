// @flow
import type { Observable } from 'relay-runtime';

export type LiveResolverContextType = {
    greeting: { myHello: string },
    counter: Observable<number>,
};
