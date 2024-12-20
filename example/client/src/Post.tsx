import {graphql, useFragment} from "react-relay";

export default function Post({query}) {
  const data = useFragment(graphql`
  fragment Post on Post @throwOnFieldError {
    title
    content
  }`, query);

  // TODO: Use tailwind
  return (
    <div style={{border: "2px solid grey", marginTop: 12, padding: 5, width: "100%"}}>
      <h2>{data.title}</h2>
      <div>{data.content}</div>
    </div>
  )
}