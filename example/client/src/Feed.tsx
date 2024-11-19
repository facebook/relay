import Post from './Post.tsx';
import {graphql, useFragment} from "react-relay";

export default function Feed({query}) {
  const data = useFragment(graphql`
  fragment Feed on Feed @throwOnFieldError {
    # TODO: Model this as a connection
    posts {
      __id
      ...Post
    }
  }`, query);

  return (
    <div>
      {data.posts.map(post => {
        return <Post key={post.__id} query={post} />
      })}
    </div>
  )
}