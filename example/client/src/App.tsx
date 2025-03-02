import './App.css'
import {graphql, useLazyLoadQuery} from "react-relay";
import {AppQuery} from "./__generated__/AppQuery.graphql";
import Feed from './Feed.tsx';
import Welcome from './Welcome.tsx';

export default function App() {

  // @throwOnFieldError enables explicit error handling for fields. Any server
  // field error encounter will be translated into a runtime error to be caught
  // by a React error boundary.
  //
  // In return it provides improve typing of fields marked as `@semanticNonNull`
  // in the schema.
  //
  // In the future this will likely become Relay's default behavior.
  // https://relay.dev/docs/next/guides/throw-on-field-error-directive/

  // FIXME: Replace this with `usePreloadedQuery`.
  const data = useLazyLoadQuery<AppQuery>(graphql`
  query AppQuery @throwOnFieldError {
    viewer {
      ...Welcome
      feed {
        ...Feed
      }
    }
  }`, {});

  return (
    <div style={{textAlign: "left"}}>
      <h1>Example App</h1>
      <Welcome viewer={data.viewer} />
      <h2>A Feed</h2>
      <Feed query={data.viewer.feed} />
    </div>
  )
}