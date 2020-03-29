import { createRouter, defineRoute, param, Route, createGroup } from "./index";

export const { routes, listen, history } = createRouter({
  user: defineRoute(
    {
      userId: param.path.number,
      userId2: param.path.ofType<string>()
    },
    x => `/user/${x.userId}`
  ),
  software: defineRoute(
    {
      name: param.path.string,
      version: param.path.optional.string
    },
    x => `/software/${x.name}/${x.version}`
  ),
  stuff: defineRoute(
    {
      name: param.path.string
    },
    x => `/${x.name}`
  ),
  red: defineRoute(
    {
      name: param.path.string
    },
    x => `/${x.name}`
  )
});

const userStuffGroup = createGroup([routes.user, routes.stuff]);
const redUserStuff = createGroup([userStuffGroup, routes.red]);

routes.user.href({ userId: 1 });
routes.software.href({});
const route = history.getInitialRoute();

type Props = {
  allRoutes: Route<typeof routes>;
  oneRoute: Route<typeof routes.user>;
  us: Route<typeof userStuffGroup>;
  rus: Route<typeof redUserStuff>;
};

function renderIt(props: Props) {
  if (props.allRoutes.name === "software") {
    props.allRoutes.params.name;
    props.allRoutes.params.version;
  }
  props.oneRoute.params.userId;
  props.us.name;
  props.rus.name;
  if (userStuffGroup.has(props.allRoutes)) {
    props.allRoutes.name;
  }
}
