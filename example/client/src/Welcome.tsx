import {graphql, useFragment} from "react-relay";

export default function Welcome({viewer: viewerKey}) {
  const viewer = useFragment(graphql`
  fragment Welcome on Viewer @throwOnFieldError {
    user {
      name
    }
  }`, viewerKey);

  return (
    <div>
       <h2>Welcome!</h2>
       <p>Hello <strong>{viewer.user.name}</strong></p>
    </div>
  )
}