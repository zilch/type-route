import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createRouter, defineRoute, createGroup, Route } from "../index";

const mips = defineRoute("/mips");

const year = mips.extend(
  {
    year: "path.param.number"
  },
  p => `/${p.year}`
);

const practice = year.extend(
  {
    practiceId: "path.param.string"
  },
  p => `/${p.practiceId}`
);

const report = practice.extend(
  {
    reportId: "path.param.string"
  },
  p => `/${p.reportId}`
);

const { routes, listen, getCurrentRoute } = createRouter({
  yearSelector: mips.extend("/"),
  practiceList: year.extend(
    {
      search: "query.param.string.optional",
      page: "query.param.number.optional"
    },
    () => "/"
  ),

  practiceSummary: practice.extend("/"),
  practicePreferences: practice.extend("/preferences"),
  practiceReports: practice.extend("/reports"),

  report: report.extend("/"),
  reportQuality: report.extend("/quality"),
  reportPromotingInteroperability: report.extend("/promoting-interoperability"),
  reportImprovementActivities: report.extend("/improvement-activities"),
  reportOverview: report.extend("/overview")
});

const practiceGroup = createGroup([
  routes.practiceSummary,
  routes.practicePreferences,
  routes.practiceReports
]);
const reportGroup = createGroup([
  routes.report,
  routes.reportQuality,
  routes.reportPromotingInteroperability,
  routes.reportImprovementActivities,
  routes.reportOverview
]);

function App() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    document.title = route.name || "Not Found";
  }, [route.name]);

  useEffect(() => {
    const listener = listen(nextRoute => {
      if (nextRoute.name === routes.report.name) {
        routes.reportQuality.replace(nextRoute.params);
        return false;
      }

      setRoute(nextRoute);
    });

    return () => listener.remove();
  }, [route]);

  return (
    <>
      <a href="https://www.bradenhs.com/">external site</a>
      <a {...routes.home.link()}>P1</a>
      <a {...routes.about.link()}>P2</a>
      <a {...routes.userList.link()}>P3</a>
      <a {...routes.userSummary.link({ userId: "abc" })}>P4</a>
      <a {...routes.userSettings.link({ userId: "abc" })}>P4</a>

      <div>{route.name}</div>
    </>
  );
}

function Page(props: { route: Route<typeof routes> }) {
  const { route } = props;

  if (userGroup.has(route)) {
    return <UserPage route={route} />;
  }

  route.name;

  return "hi";
}

function UserPage(props: { route: Route<typeof userGroup> }) {
  const { route } = props;

  switch (route.name) {
    case routes.userSummary.name:
      return <div>User Summary</div>;
    case routes.userSettings.name:
      return <div>User Settings</div>;
    default:
      throw new Error("unexpected");
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
