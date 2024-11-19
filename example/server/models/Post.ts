import User from "./User.ts"
/** @gqlType */
export default class Post {
    /** @gqlField */
    id(): string {
        return this.id;
    };
    /** @gqlField */
    title(): string {
        return "A great post!"
    };
    /** @gqlField */
    content(): string {
        return "I made you some content!";
    };
    /** @gqlField */
    author(): User {
        return new User();
    };
}