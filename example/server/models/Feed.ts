import type {Query} from '../root.ts';
import Post from './Post.ts';

/** 
 * Models the current users's news feed.
 * @gqlType */
export default class Feed {
    /** @gqlField */
    posts(): Post[] {
        return [new Post(), new Post(), new Post()];
    };
}