---
title: Preventing Navigation
---

The `listen` function will create a new route listener. Anytime the application route changes this function will be called with the next matching route. Returning `false` (or a Promise which resolves to `false`) from this function will abort the url change. If, for instance, there are unsaved changes on the current page or an upload is in progress you may want to make the user confirm the navigation. You may hook into this functionality by doing something like the following:

```tsx
listen(nextRoute => {
  if (unsavedChanges) {
    const result = confirm("Are you sure?");
    if (result === false) {
      return false;
    }
  }

  setRoute(nextRoute);
});
```

It is important to note that the `listen` function will trigger the handler you pass to it only when _your application's_ route changes. If your application is somehow unloaded this handler will not be triggered. Examples of when this function will not be triggered in a web browser include:

- closing the tab your application is running in
- triggering an action that opens an external page
- reloading the page your application is running in

Each of the above situations can instead be intercepted using the following code:

```tsx
window.addEventListener("beforeunload", event => {
  if (unsavedChanges) {
    event.preventDefault();
    event.returnValue = ""; // Legacy browsers may need this
    return ""; // Legacy browsers may need this

    // An empty returnValue message is provided because modern browsers
    // will ignore any message set in code and instead provide a
    // generic message to the user asking them to confirm the
    // navigation.
  }
});
```

The above code will display a generic prompt to the user asking them to confirm the navigation. Asynchronous actions cannot be performed in this code block and ultimately you cannot prevent a user from leaving your application if they want to leave. This technique will only force them to confirm that this navigation is indeed what they want to do.
