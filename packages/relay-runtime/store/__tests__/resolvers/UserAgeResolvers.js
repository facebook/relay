import type { LiveState} from 'relay-runtime/store/RelayStoreTypes';

/**
 * @RelayResolver User.age: Int
 */
function age(_: mixed, context: { age: number }): number {
    return context.age;
}

module.exports = {
    age,
};
