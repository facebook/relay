# Fragments

Fragments are one of the distinguishing features of Relay. They let each component declare its own data needs independently, while retaining the efficiency of a single query. In this section, we’ll show how to split a query up into fragments.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

* * *

To start with, let’s say we want our Story component to show the date that the story was posted. To do that, we need some more data from the server, so we’re going to have to add a field to the query.

Go to `Newsfeed.tsx` and find `NewsfeedQuery` so that you can add the new field:

```
const NewsfeedQuery = graphql`
  query NewsfeedQuery {
    top_story {
      title
      summary
      // change-line
      createdAt // Add this line
      poster {
        name
        profilePicture {
          url
        }
      }
      image {
        url
      }
    }
  }
`;
```

Now go to `Story.tsx` and modify it to display the date:

```
// change-line
import Timestamp from './Timestamp';

type Props = {
  story: {
    // change-line
    createdAt: string; // Add this line
    ...
  };
};

export default function Story({story}) {
  return (
    <Card>
      <PosterByline person={story.poster} />
      <Heading>{story.title}</Heading>
      // change-line
      <Timestamp time={story.createdAt} /> // Add this line
      <Image image={story.image} />
      <p>{story.summary}</p>
    </Card>
  );
}
```

The date should now appear.

But if you think about it, why should you have had to modify `Newsfeed.tsx`? Shouldn’t React components be self-contained? Why should Newsfeed care about the specific data required by Story? What if the data was required by some child component of Story way down in the hierarchy? What if it was a component that was used in many different places? Then we would have to modify many components whenever its data requirements changed.

The avoid these and many other problems, we can move the data requirements for the Story component into `Story.tsx`.

We do this by splitting off `Story`’s data requirements into a *fragment* defined in `Story.tsx`. Fragments are separate pieces of GraphQL that the Relay compiler stitches together into complete queries. They allow each component to define its own data requirements, without paying the cost at runtime of each component running its own queries.

![Newsfeed and Story fragments](/img/docs/tutorial/fragment-newsfeed-story.png)
![Relay compiler combines them into a query](/img/docs/tutorial/fragment-newsfeed-story-combined.png)

Let’s go ahead and split `Story`’s data requirements into a fragment now.

* * *

### Step 1 — Define a fragment

Add the following to `Story.tsx` (within `src/components`) above the `Story` component:

```
import { graphql } from 'relay-runtime';

const StoryFragment = graphql`
  fragment StoryFragment on Story {
    title
    summary
    createdAt
    poster {
      name
      profilePicture {
        url
      }
    }
    thumbnail {
      url
    }
  }
`;
```

Note that we’ve taken all of the selections from within `topStory` in our query and copied them into this new Fragment declaration. Like queries, fragments have a name (`StoryFragment`), which we’ll use in a moment, but they also have a GraphQL type (`Story`) that they’re “on”. This means that this fragment can be used whenever we have a Story node in the graph.

### Step 2 — Spread the fragment

Go to `Newsfeed.tsx` and modify `NewsfeedQuery` to look like this:

```
const NewsfeedQuery = graphql`
  query NewsfeedQuery {
    topStory {
      // change-line
      ...StoryFragment
    }
  }
`;
```

We’ve replaced the selections inside `topStory` with `StoryFragment`. The Relay compiler will make sure that all of Story’s data gets fetched from now on, without having to change `Newsfeed`.

### Step 3 — Call useFragment

You’ll notice that Story now renders an empty card! All the data is missing! Wasn’t Relay supposed to include the fields selected by the fragment in the `story` object obtained from `useLazyLoadQuery()`?

The reason is that Relay hides them. Unless a component specifically asks for the data for a certain fragment, that data will not be visible to the component. This is called *data masking*, and enforces that components don’t implicitly rely on another component’s data dependencies, but declare all of their dependencies within their own fragments. This keeps components self-contained and maintainable.

Without data masking, you could never remove a field from a fragment, because it would be hard to verify that some other component somewhere wasn’t using it.

To access the data selected by a fragment, we use a hook called `useFragment`. Modify the `Story` to look like this:

```
import { useFragment } from 'react-relay';

function Story({story}) {
  const data = useFragment(
    // color1
    StoryFragment,
    // color2
    story,
  );
  return (
    <Card>
      <Heading>{data.title}</Heading>
      <PosterByline person={data.poster} />
      <Timestamp time={data.createdAt} />
      <Image image={data.image} />
      <p>{data.summary}</p>
    </Card>
  );
}
```

`useFragment` takes two arguments:

* The <span className="color1">GraphQL tagged string</span> literal for the fragment we want to read
* The same <span className="color2">story object</span> as we used before, which comes from the place within a GraphQL query where we spread the fragment. This is called a *fragment key*.

It returns the data selected by that fragment.

:::tip
We’ve rewritten `story` to `data` (the data returned by `useFragment`) in all of the JSX here; make sure to do the same in your copy of the component, or it won't work.
:::


### Step 4 — TypeScript types for fragment refs

We also need to change the type definition for `Props` so that TypeScript knows this component expects to receive a fragment key instead of the raw data.

Recall that when you spread a fragment into a query (or another fragment), the part of the query results where you spread the fragment becomes a *fragment key* for that fragment. This is the object that you pass to a component in its props in order to give it a specific place in the graph to read the fragment from. Relay generates a type that represents the fragment key for that specific fragment — this way, if you try to use a component without spreading its fragment into your query, you won’t be able to provide a fragment key that satisfies the type system. Here are the changes we need to make:

```
// change-line
import type {StoryFragment$key} from './__generated__/StoryFragment.graphql';

type Props = {
  // change-line
  story: StoryFragment$key;
};
```

With that done, we have a `Newsfeed` no longer has to care what data `Story` requires, yet can still fetch that data up-front within its own query.
* * *

## Exercise

The `PosterByline` component used by `Story` renders the poster’s name and profile picture. Use these same steps to fragmentize `PosterByline`. You need to:

* Declare a `PosterBylineFragment` on `Actor` and specify the fields it needs (`name`, `profilePicture`). The `Actor` type represents a person or organization that can post a story.
* Spread that fragment within `poster` in `StoryFragment`.
* Call `useFragment` to retrieve the data.
* Update the Props to accept a `PosterBylineFragment$key` as the `person` prop.

It’s worth going through these steps a second time, to get the mechanics of using fragments under your fingers. There are a lot of parts here that need to slot together in the right way.

Once you’ve done that, let’s look at a basic example of how fragments help an app to scale.

* * *

## Reusing a Fragment in Multiple Places

A fragment says, given *some* graph node of a particular type, what data to read from that node. The fragment key specifies *which node* in the graph the data is selected from. A re-usable component that specifies a fragment can retrieve the data from different parts of the graph in different contexts, by being passed a different fragment key.

For example, notice that the `Image` component is used in two places: directly within `Story` for the story’s thumbnail image, and also within `PosterByline` for the poster’s profile pic. Let’s fragmentize `Image` and see how it can select the data it needs from different places in the graph according to where it is used.

![Image fragment with two possible fragment keys](/img/docs/tutorial/fragment-newsfeed-story-image.png)
![It is combined into both places](/img/docs/tutorial/fragment-newsfeed-story-image-combined.png)

### Step 1 — Define the fragment

Open up `Image.tsx` and add a Fragment definition:

```
import { graphql } from 'relay-runtime';

const ImageFragment = graphql`
  fragment ImageFragment on Image {
    url
  }
`;
```

### Step 2 — Spread the fragment

Go back to `StoryFragment` and `PosterBylineFragment` and spread `ImageFragment` into it in each place where the `Image` component is what’s using the data:

<Tabs>
  <TabItem value="1" label="Story.tsx" default>

```
const StoryFragment = graphql`
  fragment StoryFragment on Story {
    title
    summary
    postedAt
    poster {
      ...PosterBylineFragment
    }
    thumbnail {
      // change-line
      ...ImageFragment
    }
  }
`;
```

  </TabItem>
  <TabItem value="2" label="PosterByline.tsx">

```
const PosterBylineFragment = graphql`
  fragment PosterBylineFragment on Actor {
    name
    profilePicture {
      // change-line
      ...ImageFragment
    }
  }
`;
```

  </TabItem>
</Tabs>

### Step 3 — Call useFragment

Modify the `Image` component to read the fields using its fragment, and also modify its Props to accept the fragment key:

```
import { useFragment } from 'react-relay';
import type { ImageFragment$key } from "./__generated__/ImageFragment.graphql";

type Props = {
  image: ImageFragment$key;
  ...
};

function Image({image}: Props) {
  const data = useFragment(ImageFragment, image);
  return <img key={data.url} src={data.url} ... />
}
```

### Step 4 — Modify once, enjoy everywhere

Now that we’ve fragmentized Image’s data requirements and co-located them within the component, we can add new data dependencies to Image without modifying any of the components that use it.

For example, let’s add an `altText` label for accessibility to the `Image` component.

Edit `ImageFragment` as follows:

```
const ImageFragment = graphql`
  fragment ImageFragment on Image {
    url
    altText // Add this line
  }
`;
```

Now, without editing Story, Newsfeed, or any other component, all of the images within our query will have alt text fetched for them. So we just need to modify `Image` to use the new field:

```
function Image({image}) {
  // ...
  <img
    // change-line
    alt={data.altText}
  //...
}
```

Now *both* the story thumbnail image and the poster’s profile pic will have an alt text. (You can use your browser’s Elements inspector to verify this.)

You can imagine how beneficial this is as your codebase gets larger. Each component is self-contained, no matter how many places it’s used in!

![Adding a field in one fragment](/img/docs/tutorial/fragment-reuse-seperate.png)
![It's added in all places the fragment is used](/img/docs/tutorial/fragment-reuse-combined.png)

Fragments are the building block of Relay apps. As such, a lot of Relay features are based on fragments. We’ll look at a few of them in the next sections.

* * *

## Fragment arguments and field arguments

Currently the `Image` component fetches images at their full size, even if they’ll be displayed at a smaller size. This is inefficient! The `Image` component takes a prop that says what size to show the image at, so it’s controlled by the component that uses `Image`. We’d like in a similar way for the component that uses `Image` to say what size of image to fetch within its fragment.

GraphQL fields can accept *arguments* that give the server additional information to fulfill our request. For example, the `url` field on the `Image` type accepts `height` and `width` arguments that the server incorporates into the URL — if we have this fragment:

```
fragment Example1 on Image {
  url
}
```

we might get the URL such as `/images/abcde.jpeg`

— whereas if we have this fragment:

```
fragment Example2 on Image {
  url(height: 100, width: 100)
}
```

we might get a URL like `/images/abcde.jpeg?height=100&width=100`

Now of course, we don’t want to just hard-code a specific size into `ImageFragment`, because we’d like the `Image` component to fetch a different size in different contexts.  To do that, we can make the `ImageFragment` accept *fragment arguments* so that the parent component can specify how large of an image should be fetched. These *fragment arguments* can then be passed into specific fields (in this case `url`) as *field arguments*.

To do that, edit `ImageFragment` as follows:

```
const ImageFragment = graphql`
  fragment ImageFragment on Image
    @argumentDefinitions(
      // color1
      width: {
        // color2
        type: "Int",
        // color3
        defaultValue: null
      }
      height: {
        type: "Int",
        defaultValue: null
      }
    )
  {
    url(
      // color4
      width:
      // color5
      $width,
      height: $height)
    altText
  }
`;
```

Let’s break this down:

* We’ve added an `@argumentDefinitions` directive to the fragment declaration. This says what arguments the fragment accepts. For each argument, we give:
    * <span className="color1">The name of the argument</span>
    * <span className="color2">Its type</span> (which can be any [GraphQL scalar type](https://graphql.org/learn/schema/#scalar-types))
    * Optionally a <span className="color3">default value </span>— in this case, the default value is null, which lets us fetch the image at its inherent size. If no default value is given, then the argument is required at every place the fragment is used.
* Then we populate an <span className="color4">argument to a GraphQL field</span> by using the <span className="color5">fragment argument as a variable</span>.

Now the fragment accepts an argument that it passes along to the server via one of the fields it selects.

#### Step 2

Now the different fragments using `Image` can pass in the appropriate size for each image:

<Tabs>
  <TabItem value="1" label="Story.tsx" default>

```
const StoryFragment = graphql`
  fragment StoryFragment on Story {
    title
    summary
    postedAt
    poster {
      ...PosterBylineFragment
    }
    image {
      // change-line
      ...ImageFragment @arguments(width: 400)
    }
  }
`;
```

  </TabItem>
  <TabItem value="2" label="PosterByline.tsx">

```
const PosterBylineFragment = graphql`
  fragment PosterBylineFragment on Actor {
    name
    profilePicture {
      // change-line
      ...ImageFragment @arguments(width: 60, height: 60)
    }
  }
`;
```

  </TabItem>
</Tabs>

Now if you look at the images that our app downloads, you’ll see they’re of the smaller size, saving network bandwidth. Note that although we use integer literal here, these arguments could also be supplied from fragment arguments, and therefore ultimately from query variables that are passed down to the fragment.

Field arguments (e.g. `url(height: 100)`) are a feature of GraphQL itself, while fragment arguments (as in `@argumentDefinitions` and `@arguments`) are Relay-specific features. The Relay compiler processes these fragment arguments when it combines fragments into queries.

In this example, the argument values are hard-coded and known at build time. Next we’ll see how to use *query variables* to pass information to the server that’s not known until runtime.
* * *
SNIP: [Queries 2](https://fb.quip.com/wPx4AfmOy5aZ) goes here, rest of this to be a second fragments page
* * *

## GraphQL Types, Interfaces, and Polymorphism

In this example, we’ll see how to treat different types of nodes differently. You might notice that some of the newsfeed stories in the example app are posted by people, while others are posted by organizations. In this example, enhance our hovercard by writing a fragment that selects people-specific information about people posters and organization-specific information about organization posters.

We’ve alluded to the fact that GraphQL nodes aren’t just random bags of fields — they have types. Your GraphQL schema defines what fields each type has. For instance, it might define the `Story` type like this:

```
type Story {
  id: ID!
  title: String
  summary: String
  createdAt: Date
  poster: Actor
  image: Image
}
```

Here, some of the fields are scalars (like `String` and `ID`). Others are types defined elsewhere in the schema, like `Image`. — these fields are edges to nodes of those specific types. The `!` on `ID!` means that field is non-nullable. In GraphQL, fields are normally nullable and non-nullability is the exception.

Fragments are always “on” a particular type. In our example above, `StoryFragment` is defined `on Story`. This means that you can only spread it into places in a query where a `Story` node is expected. And it means that the fragment can select just those fields that exist on the `Story` type.

Of particular interest is the `Actor` type used for the `poster` field. This type is an *interface*. That means that the `poster` of a story can be a Person, a Page, an Organization, or any other type of entity that meets the specifications for being an “Actor”.

The GraphQL schema in our example app defines an Actor as follows:

```
interface Actor {
  name: String
  profilePicture: Image
  joined: DateTime
}
```

Not coincidentally this is exactly the information that we’re displaying here. There are two types in the schema that *implement* Actor, meaning that they include all the fields defined in Actor and declare as such:

```
type User implements Actor {
  id: ID!
  name: String
  profilePicture: Image
  joined: DateTime
  email: String
  location: Location
}

type Organization implements Actor {
  id: ID!
  name: String
  profilePicture: Image
  joined: DateTime
  organizationKind: OrganizationKind
}
```

Both of these types have `name` , `profilePicture`, and `joined`, so they can both declare that they implement Actor and thus can be used wherever an Actor is called for in the schema and in fragments. They also have other fields that are distinct to each particular type.

Let’s see how to work with interfaces more by extending the `PosterDetailsHovercardContentsBody` component to display the location of a Person or the organization type of an Organization.

Right now, if you’ve followed along so far, it should have a fragment defined like this:

```
fragment PosterDetailsHovercardContentsBodyFragment on Actor {
  name
  joined
  profilePicture {
    ...ImageFragment
  }
}
```

If you try to add a field like `organizationKind` to this fragment, you’ll get an error from the Relay compiler:

```
✖︎ The type `Actor` has no field organizationKind
```

This is because when we define a fragment as being on an interface, we can only use fields from that interface. To use fields from a specific type that implements the interface, we use a *type refinement* to tell GraphQL we’re selecting fields from that type:

```
fragment PosterDetailsHovercardContentsBodyFragment on Actor {
  name
  joined
  profilePicture {
    ...ImageFragment
  }
  // change
  ... on Organization {
    organizationKind
  }
  // end-change
}
```

Go ahead and add this now. You can also add a type refinement for `Person`:

```
fragment PosterDetailsHovercardContentsBodyFragment on Actor {
  name
  joined
  profilePicture {
    ...ImageFragment
  }
  ... on Organization {
    organizationKind
  }
  // change
  ... on Person {
    location {
      name
    }
  }
  // end-change
}
```

When you select a field that’s only present on some of the types that implement an interface, and the node you’re dealing with is of a different type, then you simply get `null` for the value of that field when you read it out. With that in mind, we can modify the `PosterDetailsHovercardContentsBody` component to show the location of people and organization type of organizations:

```
import OrganizationKind from './OrganizationKind';

function PosterDetailsHovercardContentsBody({ poster }: Props): React.ReactElement {
  const data = useFragment(PosterDetailsHovercardContentsBodyFragment, poster);
  return (
    <>
      <Image image={data.profilePicture} width={128} height={128} className="posterHovercard__image" />
      <div className="posterHovercard__name">{data.name}</div>
      <ul className="posterHovercard__details">
         <li>Joined <Timestamp time={poster.joined} /></li>
         // change
         {data.location != null && (
           <li>{data.location.name}</li>
         )}
        {data.organizationKind != null && (
          <li><OrganizationKind kind={data.organizationKind} /></li>
         )}
         // end-change
      </ul>
    </>
  );
}
```

You should now see the location of people, and the organization type for organizations.

By the way, we can now understand why we had `... on Actor` in the example earlier. The `node` field can return a node of any type because any ID could be given at runtime. So the type that it gives us is `Node`, a very generic interface that can be implemented by anything that has an `id` field. We needed a type refinement to use fields from the `Actor` interface.

:::note
In the GraphQL spec and other sources, type refinements are called *inline fragments*. We call them “type refinements” instead because this terminology is more descriptive and less confusing.
:::

* * *

## Arrays of Items with GraphQL Lists

So far we’ve only dealt with components that have a single instance of the components they’re composed from. For example, we’re only showing a single Newsfeed story, and within that story there’s just a single author with a single profile picture. Let’s look at how to handle more than one of something.

GraphQL includes support for arrays, which in GraphQL are called *lists.* A field can be not only a single scalar value but an array of them, or not only a single edge but an array of edges. The schema specifies whether each field is a list or not, but, oddly, the GraphQL query syntax doesn’t distinguish between selecting a singular field and selecting a list — a quirky exception to the design principle that a GraphQL response should have the same shape as the query:

```
// To be displayed side by side
query MyQuery {
  viewer {
    contacts { // contacts is a list of edges to a Person
      id // these fields are fields of a single Person
      name
    }
  }
}

{
  viewer: {
    // The response has an array, each entry of which has the fields we asked for
    contacts: [
      {
        id: "123",
        name: "Chris",
      },
      {
        id: "789",
        name: "Sue",
      }
    ]
  }
}
```

We can put this into practice by implementing a sidebar with the user’s contacts list. We’ve prepared a component called `ContactsList` that’s just a placeholder now, but we’ll modify it to fetch an array of contacts. First go to `Sidebar.tsx` and add in `ContactsList` and its fragment:

```
import ContactsList from './ContactsList';

const SidebarQuery = graphql`
  query SidebarQuery {
    viewer {
      ...ViewerProfilePicFragment
      ...ContactsListFragment
    }
  }
`;

...

function SidebarContents() {
  ...
  return (
    <>
      <ViewerProfilePic viewer={data.viewer} />
      <ContactsList viewer={data.viewer} />
    </>
  );
}
```

Now head over to `ContactsList.tsx`. It’s currently a component that renders an empty output. We can add the `contacts` field to its fragment to select the list of contacts. Since the `contacts` field is a GraphQL List, the resulting data will be an array. We’ll map over that array to render a component for each entry:

```
const ContactsListFragment = graphql`
  fragment ContactsListFragment on Viewer {
    // TODO find a reasonable placeholder field to put here to make the
    // fragment valid
    contacts {
      id
      ...ContactRowFragment
    }
  }
`;

export default function ContactsList({ viewer }: Props) {
  const data = useFragment(ContactsListFragment, viewer);
  return (
    <Card>
      {data.contacts.map(contact =>
        <ContactRow key={contact.id} contact={contact} />
      )}
    </Card>
  );
}
```

You should now see a list of the viewer’s contacts in the sidebar.

Notice that we select `id` from each contact in order to be able to assign a `key` to the React component that renders each item. It’s important for React keys to come from data IDs rather than just sequential indexes so that React can handle reordering or deletion of items correctly. [link to relevant react doc]

**NOTE**: GraphQL Lists are only the most basic way of dealing with collections of things. We’ll build on them to do pagination and infinite scrolling in the next chapter, Connections and Pagination. You’ll want to use Connections in most situations where you have a collection of items — although you’ll still use GraphQL Lists as a building block.

Right now, though, I see a list, and what I really want to do is filter it.
* * *

## Refetchable fragments

We saw before in the Queries chapter how we can update our components with different data by changing query variables. When we supply new values for query variables, Relay fetches the new data and re-renders our components once it’s available. But how do we update the data for just a single fragment? Usually, your app will have just a few large queries with many different fragments spread into them — we don’t want to have to thread input state and event handlers way up to the top of our application where the query lives — instead, we want to keep each component as self-contained as possible. And we don’t want to refetch all of the data for an entire screen just to update a small section.

To address these issues, Relay provides *refetchable fragments*. These are fragments that can be refetched with new variables, separately from the rest of the query that they get spread into. They allow us to change a fragment’s arguments and fetch new data for the new argument values, just as we can fetch an entire query with new query variables.

Without refetchable fragments, you might be tempted to limit the size of your queries, lacking fine-grained control over the refetch. This is another Relay feature that helps you make your app as efficient as possible by removing barriers to creating big screen-sized queries.

But fragments are just that, fragments — they aren’t queries and can’t be fetched without being spread into a query and read out from the query results. So how do refetchable fragments actually work? The answer is that the Relay compiler generates a new, separate query just to refetch the fragment. The data is retrieved *initially* as part of whatever larger query the fragment is spread into, but then when it’s refetched the new synthetic query is used.

Let’s try this out by adding a Search feature to the Contacts list in the sidebar.

Have a look at `ContactsList.js` and you’ll find this fragment:

```
const ContactsListFragment = graphql`
  fragment ContactsListFragment on Viewer {
    contacts {
      id
      ...ContactRowFragment
    }
  }
`;
```

This fragment gets spread into a larger query, but we’d like to add a field argument to the `contacts` field and then re-fetch just this one fragment with a new argument rather than the entire large query — and we’d like to keep everything contained to this one component.

### Step 1

Define a fragment argument. Besides being usable as a normal fragment argument when the fragment is spread into a query, this argument will become a query variable in the refetch query that Relay generates for us.

```
const ContactsListFragment = graphql`
  fragment ContactsListFragment on Viewer
    @argumentDefinitions(
      search: {type: "String", defaultValue: null}
    )
  {
    contacts {
      id
      ...ContactRowFragment
    }
  }
`;
```

### Step 2

Pass the fragment argument in as an argument to the `contacts` field.

```
const ContactsListFragment = graphql`
  fragment ContactsListFragment on Viewer
    @argumentDefinitions(
      search: {type: "String", defaultValue: null}
    )
  {
    contacts(search: $search) {
      id
      ...ContactRowFragment
    }
  }
`;
```

Remember, the first `search` here is the name of the argument to `contacts`, while the second `$search` is the variable created by our fragment argument.

### Step 3

Mark the fragment as refetchable. This causes Relay to generate the extra query for refetching it:

```
const ContactsListFragment = graphql`
  fragment ContactsListFragment on Viewer
    @refetchable(queryName: "ContactsListRefetchQuery")
    @argumentDefinitions(
      // ...  as before
    )
  {
     //   ... as before
  }
`;
```

### Step 4

Now we need to actually hook this up to our UI. Take a look at the `ContactsList` component:

```
function ContactsList({viewer}) {
  const data = useFragment(ContactsListFragment, viewer);
  return (
    <Card>
      {data.contacts.map(contact =>
        <ContactRow key={contact.id} contact={contact} />
      )}
    </Card>
  );
}
```

First we need to add a search field.

```
import SearchInput from './SearchInput';

function ContactsList({viewer}) {
  const [searchString, setSearchString] = useState('');
  const data = useFragment(ContactsListFragment, viewer);
  const onSearchStringChanged = (value: string) => {
    setSearchString(value);
  };
  return (
    <Card>
      <SearchInput value={searchString} onChange={onSearchStringChanged} />
       {data.contacts.map(contact =>
        <ContactRow key={contact.id} contact={contact} />
       )}
    </Card>
  );
}
```

Now to refetch the fragment when the string changes, we change `useFragment` to `useRefetchableFragment`. This hook returns a `refetch` function which will refetch the fragment with new variables which we provide as an argument.

```
import {useRefetchableFragment} from 'react-relay';

function ContactsList({viewer}) {
  const [searchString, setSearchString] = useState('');
  const [data, refetch] = useRefetchableFragment(ContactsListFragment, viewer);
  const onSearchStringChanged = (value) => {
    setSearchString(value);
    refetch({search: value});
  };
  return (
    <Card>
      <SearchInput value={searchString} onChange={onSearchStringChanged} />
      {data.contacts.map(contact => <ContactRow contact={contact} />)}
    </Card>
  );
}
```

You’ll notice that Relay gives us a callback for refetching rather than accepting the new state variables and refetching when they update. This means that the fetch happens as soon as the event takes place, saving some time versus waiting until React finishes re-rendering.

### Step 5

At this point, when the fragment is refreshed, Relay uses Suspense while the new data is loading, so the entire component is replaced with a spinner! This makes the UI fairly unusable. We would rather just keep the current data on screen until the new data is available, so we wrap the refetch in a React transition (just like we did when [[changing query variables]](link) earlier):

```
function ContactsList({viewer}) {
  const [isPending, startTransition] = useTransition();
  const [searchString, setSearchString] = useState('');
  const [data, refetch] = useRefetchableFragment(ContactsListFragment, viewer);
  const onSearchStringChanged = (value) => {
    setSearchString(value);
    startTransition(() => {
      refetch(newValue);
    });
  };
  return (
    <Card>
      <SearchInput value={searchString} onChange={onSearchStringChanged} />
      {isPending && <SearchSpinner />}
      {data.contacts.map(contact => <ContactRow contact={contact} />)}
    </Card>
  );
}
```

We we simply show `<SearchSpinner />` while the refetch is happening instead of suspending the entire component. Meanwhile, by `setSearchString` outside of the transition but `refetch` within it, we tell React to immediately update the search input for full responsiveness, but to deprioritize the rendering of the network response if other user events are happening when it arrives.

[[Deep dive ------

#### What fragments can be refetched?

To refetch fragments, Relay has to know how to generate a query that lets it refetch just the information from the fragment. That’s only possible for fragments that meet certain requirements.

You might imagine that we could, if nothing else, re-run the original query that the fragment was spread into. However, GraphQL doesn’t guarantee that the same query will return the same results at different times. For instance, imagine you had a GraphQL field that returned the top trending posts across the site:

```
query MyQuery {
  top_trending_posts {
    title
    summary
    date
    poster {
     ...PosterFragment
    }
  }
}
```

If you wanted to refresh just `PosterFragment` from this query, it wouldn’t work to construct a query like this:

```
query MyQuery {
  top_trending_posts {
    poster {
     ...PosterFragment
    }
  }
}
```

... because the top trending post could be a different post by the time you refresh it!

Relay needs a way of identifying the specific node in the graph that the fragment ends up on, even if it can no longer be reached by the same path that the original query uses. If the node has a unique and stable ID, then we can just have a convention for querying for “the graph node with some specific ID” like so:

```
query RefetchQuery {
  node(id: "abcdef") {
    ...PosterFragment
  }
}
```

In fact, this is exactly the convention that Relay uses. It expects your server to implement a top-level field called `node` that takes an ID and gives you the graph node with that ID.

Not every graph node has a stable ID — some are ephemeral. To be used with `node`, your schema has to declare that its type implements an interface called `Node`:

```
type Person implements Node {
  id: ID!
  ...
}
```

The `Node` interface simply says it has an ID, but more importantly indicates by convention that that ID is stable and unique:

```
interface Node {
  id: ID!
}
```

Besides fragments on types that implement `Node`, you can also refetch fragments that are on `Viewer` (since the viewer is assumed to be stable throughout a session) and that are at the top level of a query (since there’s no field above them that could change identity).  [[Meta only: Ents marked with [`GraphQLFetchable](https://fb.workplace.com/groups/graphql.fyi/permalink/1539541276187011/)` can also be refetched.]]

------]]

* * *

## Summary

Fragments are the most distinctive aspect of how Relay uses GraphQL. We recommend that every component that displays data and cares about the semantics of that data (so not just a typographic or formatting component) use a GraphQL fragment to declare its data dependences. And we recommend that, generally speaking, each screen have just a single query at the top.

* Fragment data needs to be read out using `useFragment`
* `useFragment` takes a *fragment key* which says where in the graph to read from.
* Fragment keys come from places in a GraphQL response where that fragment was spread.
* Fragments can define arguments which are used at the point they’re spread
* Fragments can be refetched
* Some GraphQL fields return arrays
