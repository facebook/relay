import type { Query} from "../root.ts"
import User from './User.ts';
import Feed from './Feed.ts';

/** 
 * Models the currently logged in user. Values which are specific to the current
 * user are exposed here.
 * @gqlType */
export class Viewer {
    /** @gqlField */
    user(): User {
        return new User();
    }

    /** @gqlField */
    async feed(): Promise<Feed> {
        return new Feed();
    }

    /** @gqlField */
    static async viewer(_: Query): Promise<Viewer> {
        return new Viewer();
    }
}