---
id: thinking-in-relay
title: Relay编程思想
layout: docs
category: Quick Start
permalink: docs/thinking-in-relay.zh-CN.html
next: videos
---

Relay的数据获取方法大大受到我们React的经验的启发。特别是，React将复杂的接口拆分为可重用的**组件**，允许开发人员孤立地推断应用程序的离散单元，并减少应用程序的不同部分之间的耦合。更重要的是，这些组件是**声明性的**：它们允许开发人员指定*什么* UI应该是给定的状态，而不必担心*如何显示该UI*。与以前使用命令来操作本地视图（例如DOM）的方法不同，React使用UI描述来自动确定必要的命令。

让我们来看看一些产品用例，了解我们如何将这些想法纳入Relay。我们将基本熟悉React。

##获取视图的数据

根据我们的经验，绝大多数产品需要一个特定的行为：fetch *all* 显示一个视图层次结构的数据，同时显示加载指示符，然后一旦数据准备就渲染 *整个* 视图。

一个解决方案是使根组件获取其所有子代的数据。但是，这将引入耦合：对组件的每个更改都需要更改可能渲染它的*any* 根组件，并且通常会更改它与根之间的一些组件。这种耦合可能意味着更大的机会的bug和减慢发展的速度。最终，这种方法没有利用React的组件模型。指定数据依赖关系的自然地方是 *components*。

下一个逻辑方法是使用`render（）`作为启动数据获取的手段。我们可以简单地渲染应用程序一次，看到需要什么数据，获取数据，并再次渲染。这听起来不错，但问题是 *组件使用数据来确定要渲染什么* 换句话说，这将迫使数据抓取被暂存：首先渲染根，看看需要什么数据，然后渲染它的孩子并看到他们需要什么，一路下来的树。如果每个阶段都发生网络请求，则渲染将需要缓慢的串行往返。我们需要一种方法来确定所有的数据需要前面或 *静态*。

我们最终决定采用静态方法;组件将有效地返回查询树，与查看树分离，描述它们的数据依赖性。然后，Relay可以使用此查询树来获取单个阶段中需要的所有信息，并使用它来渲染组件。问题是找到一个合适的机制来描述查询树，以及一种从服务器有效地获取它的方式（即在单个网络请求中）。这是GraphQL的完美用法，因为它提供了一种用于将 *数据依赖性描述为数据的语法*，而不指定任何特定的API。注意，Promises和Observables通常被建议作为替代，但它们表示 *不透明命令*，并排除各种优化，如查询批处理。

##数据组件 aka Containers

Relay允许开发人员通过创建 **容器** 来注释其数据依赖性的React组件。这些是包装原件的常规React组件。一个关键的设计约束是React组件是可重用的，因此Relay容器也必须是可重用的。例如，一个`<Story>`组件可能实现一个视图来渲染任何`Story`项。要呈现的实际故事将由传递给组件的数据决定：`<Story story = {...} />`。 GraphQL中的等价物是 **fragments**：命名的查询片段，*指定为给定类型的对象获取的数据*。我们可以描述`<Story>`所需的数据如下：

```
fragment on Story {
  text,
  author {
    name,
    photo
  }
}
```

然后这个片段可以用来定义Story容器：

```javascript
// Plain React component.
// Usage: `<Story story={ ... } />`
class Story extends React.Component { ... }

// "Higher-order" component that wraps `<Story>`
var StoryContainer = Relay.createContainer(Story, {
  fragments: {
    // Define a fragment with a name matching the `story` prop expected above
    story: () => Relay.QL`
      fragment on Story {
        text,
        author { ... }
      }
    `
  }
})
```

##渲染

在React中，渲染视图需要两个输入：渲染的*组件*和渲染到的DOM（UI）节点。渲染继承容器是类似的：我们需要一个 *container*来渲染，并从图中开始一个 *root* 查询。我们还必须确保容器的查询被执行，并且可能希望在获取数据时显示加载指示符。类似于`ReactDOM.render（component，domNode）`，Relay为此提供`<Relay.Renderer Container = {...} queryConfig = {...}>`。容器是要呈现的项目，以及queryConfig提供查询，指定要获取哪个项。这是我们如何渲染`<StoryContainer>`：

```javascript
ReactDOM.render(
  <Relay.Renderer
    Container={StoryContainer}
    queryConfig={{
      queries: {
        story: () => Relay.QL`
          query {
            node(id: "123") /* our `Story` fragment will be added here */
          }
        `
      },
    }}
  />,
  rootEl
)
```

`Relay.Renderer`然后可以编排查询的获取; 将它们与缓存的数据进行比较，获取任何缺少的信息，更新缓存，并在数据可用后最终渲染“StoryContainer”。 默认是在数据获取时不显示，但是加载视图可以通过`render` prop来定制。 正如React允许开发人员在不直接操作底层视图的情况下渲染视图，Relay和Relay.Renderer不需要直接与网络通信。

## 数据屏蔽

使用典型的数据获取方法，我们发现两个组件通常具有*隐式依赖性*。例如`<StoryHeader>`可能使用一些数据，而不直接确保数据被提取。这些数据通常由系统的其他部分获取，例如`<Story>`。然后，当我们改变`<Story>`并删除了数据获取逻辑时，`<StoryHeader>`会突然和不可避免地中断。这些类型的错误并不总是直接显而易见，特别是在大型团队开发的大型应用程序中。手动和自动测试只能帮助这么多：这正是一个框架更好地解决的系统问题的类型。

我们已经看到Relay容器确保在渲染组件之前获取GraphQL片段。但容器还提供了另一个不是立即显而易见的好处：**数据屏蔽**。Relay只允许组件访问他们在“fragment”中特别要求的数据 - 没有更多。因此，如果一个组件查询一个故事的`text`，另一个组件查询其`author`，则每个组件都*只*能查看他们要求的字段。事实上，组件甚至不能看到他们的*子控件*请求的数据：这也将打破封装。

Relay也进一步：它使用`props`上的不透明标识符来验证我们在渲染之前已经显式地提取了组件的数据。如果`<Story>`渲染`<StoryHeader>`但忘记包含其片段，则Relay将警告`<StoryHeader>`的数据丢失。事实上，Relay会警告*即使*一些其他组件碰巧获取``StoryHeader>`需要的相同数据。这个警告告诉我们，虽然事情*可能*现在工作，他们很可能打破后。


##结论GraphQL

GraphQL为构建高效，解耦客户端应用程序提供了强大的工具。 Relay基于此功能提供了一个用于**声明式数据获取的框架**。 默认情况下，通过分离要从*如何*获取中提取的数据，Relay可帮助开发人员构建稳健，透明和高性能的应用程序。 这是React所倡导的以组件为中心的思维方式的很好的补充。 虽然这些技术（React，Relay和GraphQL）的每一个都是自己强大的，组合是一个**UI平台**，允许我们*快速*和*发送高品质的应用程序*。
