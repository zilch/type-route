import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, createGroup, Route } from "../index";

const user = defineRoute(
  {
    username: "path.param.string"
  },
  p => `/${p.username}`
);

const repository = user.extend(
  {
    repositoryName: "path.param.string"
  },
  p => `/${p.repositoryName}`
);

const issues = repository.extend("/issues");
const pullRequests = repository.extend("/pulls");

const { routes, listen, getCurrentRoute } = createRouter({
  home: defineRoute("/"),
  dashboard: defineRoute("/dashboard"),
  user,
  repository,
  issueList: issues.extend(
    {
      query: "query.param.string.optional"
    },
    () => "/"
  ),
  issue: issues.extend(
    {
      issueNumber: "path.param.number"
    },
    p => `/${p.issueNumber}`
  ),
  pullRequestList: pullRequests.extend(
    {
      query: "query.param.string.optional"
    },
    () => "/"
  ),
  pullRequest: pullRequests.extend(
    {
      pullRequestNumber: "path.param.number"
    },
    p => `/${p.pullRequestNumber}`
  )
});

const issueGroup = createGroup([routes.issue, routes.issueList]);
const pullRequestGroup = createGroup([
  routes.pullRequest,
  routes.pullRequestList
]);

const repositoryGroup = createGroup([
  issueGroup,
  pullRequestGroup,
  routes.repository
]);

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    document.title = route.name || "Not Found";
  }, [route.name]);

  useEffect(() => {
    const listener = listen(nextRoute => {
      setRoute(nextRoute);
    });

    return () => listener.remove();
  }, [route]);

  if (repositoryGroup.has(route)) {
    if (route.name === "pullRequestList") {
    }
  }

  return (
    <>
      <a {...routes.dashboard.link()}>Dashboard</a>
      <a {...routes.user.link({ username: "bradenhs" })}>Profile</a>

      <div>{route.name}</div>
    </>
  );
}

function Page(props: { route: Route<typeof routes> }) {
  const { route } = props;

  if (route.name === routes.repository.name) {
    return <CodeSubPage route={route} />;
  }

  if (repositoryGroup.has(route)) {
    return <RepositoryPage route={route} />;
  }

  route.name;

  return "hi";
}

function RepositoryPage(props: { route: Route<typeof repositoryGroup> }) {
  const { route } = props;

  let subPage: React.ReactNode;

  if (route.name === routes.repository.name) {
    subPage = <CodeSubPage route={route} />;
  } else if (route.name === routes.issue.name) {
  } else if (route.name === routes.issueList.name) {
  } else if (route.name === routes.pullRequest.name) {
  } else if (route.name === routes.pullRequestList.name) {
    route.params.query;
  }

  return <div>{subPage}</div>;
}

function CodeSubPage(props: { route: Route<typeof routes.repository> }) {
  return <div>CodeSubPage {JSON.stringify(props)}</div>;
}

ReactDOM.render(<App />, document.querySelector("#root"));
