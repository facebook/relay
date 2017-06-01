---
id: thinking-in-graphql
title: 深入理解 GraphQL
layout: docs
category: Quick Start
permalink: docs/thinking-in-graphql.zh-CN.html
next: thinking-in-relay
---

通过关注产品开发人员和客户端应用的需求，GraphQL 呈现了一些新的客户端获取数据的方式。它给开发人员提供了一种方 法，来给视图层指定精确的数据，并且能够让客户端只通过一个网络请求就能获取数据。相较于 REST(面向资源的 REST 方式) 等传统方式，GraphQL 使应用更加有效地获取数据，并且避免了服务端重复逻辑(发生在自定义的 服务端)。此外，GraphQL 帮助开发者解耦产品代码和服务端逻辑。比如，一个产品不需要每一个相关的服务端改变，就能获取或多或少的信息。这是相当棒的获取数据的方式。

在这篇文章里，我们将探索构建 GraphQL 客户端框架到底意味着什么，并将它和其他传统的 REST 系统比较。在这个过程中，我们将了解 Relay 背后的设计决策，以及明白 Relay 不仅是 GraphQL 客户端，而且是一个为声明式数据获取(declarative data-fetching)而建的框架。那么，就让我们开始并获取一些数据吧。

## 获取数据

想象一下，我们有一个简单的应用，要获取一个故事列表，以及每个故事的一些细节信息。传统的面向资源的 REST 请求可能如下所示：

```javascript
// Fetch the list of story IDs but not their details:
rest.get('/stories').then(stories =>
  // This resolves to a list of items with linked resources:
  // `[ { href: "http://.../story/1" }, ... ]`
  Promise.all(stories.map(story =>
    rest.get(story.href) // Follow the links
  ))
).then(stories => {
  // This resolves to a list of story items:
  // `[ { id: "...", text: "..." } ]`
  console.log(stories);
});
```

注意，这种方法将会向服务器发送 *n+1* 次请求：1次用来获取列表，*n* 次用来获取细节。使用 GraphQL 的话，我们只需请求一次网络请求(不需要创建一个之后仍要维护的服务端)。

```javascript
graphql.get(`query { stories { id, text } }`).then(
  stories => {
    // A list of story items:
    // `[ { id: "...", text: "..." } ]`
    console.log(stories);
  }
);
```

目前为止，我们仍是以典型的 REST 方式使用 GraphQL，只不过更加有效。注意，使用 GraphQL 的两大优势：

- 获取所有数据仅使用了一次请求
- 客户端和服务端解耦：客户端指定需要的数据，而不依赖服务端返回正确的数据。

对一个简单的应用来说，这已经是很好的改善了。

## 客户端缓存机制

重复从服务端获取信息，会变得很慢。例如，点击一个故事列表，进入故事具体内容，然后再返回到故事列表，这一系列操作意味着我们必须重新获取故事列表。对于这个问题，我们采取传统的解决方式：缓存。

在一个面向资源的 REST 系统里，我们能够维护一个基于 URI 的响应缓存(response cache)：

```javascript
var _cache = new Map();
rest.get = uri => {
  if (!_cache.has(uri)) {
    _cache.set(uri, fetch(uri));
  }
  return _cache.get(uri);
};
```

响应缓存机制同样能应用于 GraphQL，有一个在 REST 版本上也能很好使用的基本方法——查询本身的文本可以作为缓存的键：

```javascript
var _cache = new Map();
graphql.get = queryText => {
  if (!_cache.has(queryText)) {
    _cache.set(queryText, fetchGraphQL(queryText));
  }
  return _cache.get(queryText);
};
```

现在，获取之前缓存的数据的请求，不需要发起网络请求就能立即得到应答。这是一个可用于实践的方式，能够提升应用的性能，当然，这个缓存机制可能引起数据一致性的问题。

## 缓存一致性

在使用 GraphQL 时，多个请求的结果发生重叠是很平常的事情。但是，从之前片段里缓存的响应并不会引起重叠——它是基于显示查询的。例如，假设我们发起一个获取故事的请求：

```
query { stories { id, text, likeCount } }
```

之后，再获取某一个点赞数增加了的故事：

```
query { story(id: "123") { id, text, likeCount } }
```

如何访问该故事的数据，将使我们将看到不同的点赞数。使用第一次查询的数据将会呈现过时的数目，而使用第二次查询数据的视图，则会展示更新后的数目。

### 缓存图像

缓存 GraphQL 的解决方式，就是标准化层次响应(normalize the hierarchical response)到一个充满 **记录(records)** 的集合里。Relay 以一种 ID 对应记录(record)的映射，实现了这个缓存机制。每一条记录就是字段名称和字段值的映射。多条记录也以链接到其它记录(允许用来描述一个循环图)，这些链接会被存储为一种特殊的值类型，该类型指向顶层的映射。通过这种方式，每条服务记录只会存储一次，而不管是如何获取到它的。

下面就是一个查询示例，展示如何获取一个故事的内容和其作者的名称：

```
query {
  story(id: "1") {
    text,
    author {
      name
    }
  }
}
```

以及一个可能的响应：

```
query: {
  story: {
     text: "Relay is open-source!",
     author: {
       name: "Jan"
     }
  }
}
```

尽管响应结果是分层级的，我们可以弄平它以便于缓存。下面展示了 Relay 是如何缓存查询响应的：

```javascript
Map {
  // `story(id: "1")`
  1: Map {
    text: 'Relay is open-source!',
    author: Link(2),
  },
  // `story.author`
  2: Map {
    name: 'Jan',
  },
};
```

这只是一个简单示例：实际上，缓存还需要解决一对多和分页的问题。

### 使用缓存

所以，我们如何使用缓存呢？看一下两个操作：当接收到响应时写入缓存，读缓存来决定是否一个查询能够完全本地化(要不是一张图的话，等效于上面提到的 `_cache.has(key)`)。

### 存储缓存

存储缓存涉及到有层次结构的 GraphQL 响应，新建或更新标准化的缓存记录。起初，似乎仅靠响应就可以处理响应了，实际上，这只适用非常简单的查询。考虑到 `user(id: "456") { photo(size: 32) { uri } }` 之类的查询——我们怎么存储 `photo`？在缓存里用 `photo` 作字段名不会起作用，因为不同的查询会以不同的参数值来获取相同的字段(比如 `photo(size: 64) {...}`)。分页也存在相似的问题。如果我们通过 `stories(first: 10, offset: 10)` 获取第11到第20个故事，那么新的结果应该会附加到已有的列表之后。

因此，一个标准化的响应缓存需要同时处理数据和查询。例如，`photo` 字段能被缓存，通过生产一个类似 `photo_size(32)` 的字段名称，为了独特指示该字段和它的参数值。

### 读取缓存

为了读取缓存，我们使用一个查询，并解析每一个字段。但是，请稍等：那听起来就是 GraphQL 服务器在处理一个请求所做的事情啊。是的，确实如此！读缓存是一个执行器特殊的案例，在： a) 没有必要为了用户定义的字段工作，因为所有的结果来自一个固定的数据结构；b) 结果总是同步的——我们要么已经缓存数据了，要么没有。

Relay 实现了一些遍历查询(query traversal)：随着缓存数据或者响应数据的查询操作。譬如，当 Relay 得到一个查询请求时，会执行一个 "diff" 的遍历操作，来决定缺失了哪些字段(就像 React 辨别虚拟 DOM 树)。这个操作能够简化一般使用场景中的数据量，甚至允许 Relay 在所有请求已经完全被缓存的时候，避免网络请求。

### 缓存更新

注意，标准化的缓存结构允许重叠结果，而不需要缓存副本。每一条记录只会存储一次，而不管是如何获取的。让我们回头看之前的例子，了解缓存是如何帮助处理不一致的数据的。

第一个查询用来获取故事的列表：

```
query { stories { id, text, likeCount } }
```

在标准化响应缓存下，会为列表中的每个故事新建一条记录。`stories` 字段将会存储链接到其它记录。

第二个查询获取其中 id 为 123 的信息：

```
query { story(id: "123") { id, text, likeCount } }
```

当标准化响应结果后，Relay 能够基于 `id` 检测出和已存在数据的重叠部分。Relay 将会更新已存在的 `123` 这条记录，而不是新建一条。因此，新的 `likeCount` 对所有查询都是可用的，其它查询也可能会引用这条记录。

## 数据／视图一致性

标准化的缓存保证了缓存的一致性。但是，视图呢？理论上，React 视图总会反映当前缓存的信息。

考虑到渲染的有作者名称和图片的故事的文本和评论，这有一个 GraphQL 的查询：

```
query {
  node(id: "1") {
    text,
    author { name, photo },
    comments {
      text,
      author { name, photo }
    }
  }
}
```

在最初获取到数据后，我们的缓存结构如下。注意，故事和评论都链接到同样的 `author` 记录下：

```
// 注意：这只是初始化 `Map` 的伪代码，只是让结构更加清晰。
Map {
  // `story(id: "1")`
  1: Map {
    text: 'got GraphQL?',
    author: Link(2),
    comments: [Link(3)],
  },
  // `story.author`
  2: Map {
    name: 'Yuzhi',
    photo: 'http://.../photo1.jpg',
  },
  // `story.comments[0]`
  3: Map {
    text: 'Here\'s how to get one!',
    author: Link(2),
  },
}
```

故事的作者也同样评论了它——这很常见。现在想象一下，其它的视图获取了关于该作者新的信息，并且他也改变了个人头像。下面是我们的缓存数据需要发生改变的部分：

```
Map {
  ...
  2: Map {
    ...
    photo: 'http://.../photo2.jpg',
  },
}
```

`photo` 字段的值改变了，因此记录 `2` 也同样改变了。确实如此！缓存中的其他数据并没有受到影响。很明显，视图层需要反映更新：UI 里的作者(故事的作者和评论里的作者)都需要显示新的头像。

一个标准的响应数据应该使用“不会改变的数据结构”——如果我们做了如上操作，会发生什么呢：

```
ImmutableMap {
  1: ImmutableMap {/* same as before */}
  2: ImmutableMap {
    ... // other fields unchanged
    photo: 'http://.../photo2.jpg',
  },
  3: ImmutableMap {/* same as before */}
}
```

如果我们使用了新的不变的记录代替 `2`，我们同样会得到一个新的不会变的缓存对象实例。但是，不会涉及到`1` 和 `3` 字段的。因为数据是标准化的，仅通过 `story` 记录本身，我们无法辨别 `story` 的内容是否改变了。

### 实现视图一致性

有很多方法来保持视图层数据和缓存保持一致。Relay 采取的方式是维护一个映射，每一个 UI 视图和对应的多个 ID。既然这样，故事的视图层会订阅更新 故事(`1`)，作者(`2`)，评论(`3` 和其它)。当把数据写入缓存时，Relay 追踪哪些 ID 被影响了，并且只通知那些订阅了这些 ID 的视图。这些被影响的视图将会重新渲染，没有被影响的部分将不会重新渲染，这么做是为了更好的性能(Relay 提供了一个安全有效的 `shouldComponentUpdate`)。如果没有这个策略，即使是最小的改变，也会导致每一个视图重新渲染。

这个方法同样对“写”同样有效：任何缓存的更新都会通知视图，而写操作也同样是更新缓存。

## 突变(Mutations)

目前为止，我们已经了解了查询数据和保持视图数据更新，但是还没了解写操作。在 GraphQL 里，写操作也被称为突变(mutations)，可认为就是带副作用的查询。下面展示一个引起突变的例子，当前用户标记一个故事为喜欢(赞)：

```
// Give a human-readable name and define the types of the inputs,
// in this case the id of the story to mark as liked.
mutation StoryLike($storyID: String) {
   // Call the mutation field and trigger its side effects
   storyLike(storyID: $storyID) {
     // Define fields to re-fetch after the mutation completes
     likeCount
   }
}
```

注意，我们正在查询的数据可能会改变，作为突变的结果。一个明显的问题是：为什么服务器不能直接告诉我们什么发生改变了？回答是：这相当困难。GraphQL 抽象了数据存储层(或者是多资源聚合)，并适用于任何编程语言。此外，GraphQL 的目标是提供一种有助于开发者构建视图的数据形式。

我们已经发现一件对 GraphQL schema 来说很普遍的事情： 细微地或者更充分地区别数据在磁盘上存储的形式。简而言之，数据存储区(磁盘)的数据改变和产品可视的 schema (product-visible schema)，也就是 GraphQL，的数据改变并不总是一一对应的。这个例子是不受干扰的：返回一个面向用户的字段，像 `age`，可能要求在你的数据存储层里访问更多的记录，来决定当前活跃的用户是否允许查看 `age`(是朋友么？公开了年龄么？屏蔽了么……等等)。

考虑到现实世界的种种约束，GraphQL 采取的方式是让客户端查询那些在发生突变后可能改变的事物。但是，我们具体该查哪些东西呢？在开发 Relay 的过程中，我们探索了好几个主意——让我们简单了解一下他们，好明白为什么 Relay 采用现行的方法：

- 选择1：重新获取应用需要的任何数据，即使只有一小片数据会发生改变。我们需等待服务器执行完整的查询，等待接收结果，等待再次处理。很明显，这做法是非常低效的。

- 选择2：只获取渲染视图需要的数据。相对于选择1，这稍微有些改善。但是，已经展示的缓存数据是不会被更新的。除非数据在缓存中被标记为过时或被排除，不然后续查询将仍取读过时的信息。

- 选择3：重新获取一些在突变发生后可能改变的固定的字段。我们称这个查询列表是个胖查询，因为低效。典型的应用只会渲染这个胖查询的子集，但是这个方式却需要获取所有的这些字段。

-选择4(Relay)：获取可能改变的数据(胖查询)和已缓存数据的交集。除了缓存数据，Relay 也会记住用来获取每个条目的查询。这些被称为标记查询(tracked queries)。根据标记查询和胖查询的交集，Relay 能够准确地查询应用需要更新的信息。

## 数据获取 API

目前为止，我们只了解了数据获取层面的相关概念，以及各种熟悉的思想是如何应用在 GraphQL 里的。接下来，让我们了解产品开发人员需要面对的更高层次的数据获取相关的关注点：

- 为视图层获取所有数据；
- 管理异步状态转换和协同并发请求；
- 管理错误；
- 重试失败的请求；
- 在接收到查询／突变的响应后，更新本地缓存；
- 队列突变，避免竞争；
- 在等待服务器响应突变结果后，积极地更新UI。

我们已经发现，典型的数据获取方式——通过必要的API——迫使开发人员来处理无关紧要的复杂事务。例如，要考虑 UI更新。在用户等待服务器响应时，给用户反馈是一个很好的方式。需要做什么的逻辑相当清楚了：当用户点击“赞”按钮后，标记此故事已被赞并且发送请求给服务器。但是，实现起来总是更加复杂。必要的方式需要我们实现所有的步骤：找到UI和切换按钮，初始网络请求，如果需要还得重试，当请求失败了显示一个错误(并取消点击)，等等。这同样适用于数据获取：指明我们需要的数据，规定如何以及何时获取。接下来，我们将探索用以解决这些关注点的 **Relay** 。
