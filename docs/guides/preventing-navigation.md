---
title: Preventing Navigation
---

The `block` function on the `session` object will create a new navigation blocker. Any time the application route changes this function will be called with the an `update` object containing information about the update which would have happened had the navigation not been blocked. This update object has two properties:

- `route` - What the next route would have been had the navigation gone through.
- `retry` - A function giving you the ability to retry this navigation attempt, for instance, after the blocker is removed.

In practice, preventing navigation may look something like the this:

```tsx
const unblock = session.block(update => {
  if (confirm("Are you sure?")) {
    unblock();
    update.retry();
  }
});
```

Navigation between routes in your application can always be blocked. Navigation away from your application, however, cannot be reliably blocked. Some examples of navigation away from your application in a web browser include:

- closing the tab your application is running in
- triggering an action that opens an external page
- reloading the page your application is running in

In these instances, if a blocker is active, a generic browser dialog will appear asking the user to confirm the navigation. Ultimately, you cannot prevent a user from leaving your application if they want to leave. This will only force them to confirm that this navigation is indeed what they want to do.
