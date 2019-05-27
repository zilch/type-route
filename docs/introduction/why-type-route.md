---
title: Why Type Route?
---

## Type Safe

Type Route's first and foremost concern is excellent TypeScript support. Existing routing libraries (even those written in TypeScript) lack APIs that are fully statically analyzable. Type Route's API was designed to fully leverage TypeScript's type inference powers. This means:

- Almost no type annotations are needed for 100% type safe code.
- Helpful completions and errors are surfaced in your code editor as you type.
- For editors which use TypeScript to power their JavaScript experience (such as VSCode) most of those editor smarts will carry over to your JavaScript editing experience as well.

## Flexible

Type Route was designed with excellent React integration in mind but isn't coupled to a specific UI framework. React is a first class citizen to Type Route. The best API for React, however, just happened to be framework agnostic. As a result you can use Type Route with React, Angular, Vue or anything else. There's even support for non-browser environments such as React Native.

In addition to working with a wide variety of technologies, Type Route also easily supports complex patterns such as having a route change trigger view updates in separate parts of the application.

## Solid Foundation

The same [core library](https://github.com/ReactTraining/history) behind React Router also powers Type Route. From this solid foundation Type Route adds a simple and flexible API optimized for a developer experience that is second to none.
