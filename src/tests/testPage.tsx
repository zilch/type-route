import React, { useState, useEffect, useContext } from "react";
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
  hosts: defineRoute(
    {
      advanced: "query.param.string.optional"
    },
    () => "/hosts"
  ),
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

const dashboardGroup = createGroup([routes.home, routes.dashboard]);

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

const routeContext = React.createContext<Route<typeof routes> | null>(null);
const ProvideRoute = routeContext.Provider;
const useRoute = function() {
  const route = useContext(routeContext);

  if (route === null) {
    throw new Error("Provide route via the ProvideRoute component");
  }

  return route;
};

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  let realRoute: Route<typeof routes> = route;

  useEffect(() => {
    document.title = route.name || "Not Found";
  }, [route.name]);

  useEffect(() => listen(setRoute), [route]);

  if (repositoryGroup.has(route)) {
    if (route.name === "pullRequestList") {
    }
  }

  if (route.name === "pullRequest") {
    console.log(route.params.pullRequestNumber);
  }

  if (realRoute.name === "pullRequest") {
    realRoute.params.pullRequestNumber;
  }

  return (
    <>
      <a {...routes.dashboard.link()}>Dashboard</a>
      <a {...routes.user.link({ username: "bradenhs" })} target="_blank">
        Profile
      </a>
      <Page route={route} />
    </>
  );
}

function Page(props: { route: Route<typeof routes> }) {
  const { route } = props;

  if (repositoryGroup.has(route)) {
    return <RepositoryPage route={route} />;
  }

  if (dashboardGroup.has(route)) {
    return <DashboardPage route={route} />;
  }

  if (route.name === routes.user.name) {
    return <div>User Page</div>;
  }

  return <div>Not Found</div>;
}

function DashboardPage(props: { route: Route<typeof dashboardGroup> }) {
  return <div>Dashboard {props.route.name}</div>;
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
