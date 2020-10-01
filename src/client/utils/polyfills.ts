if (typeof Promise.allSettled !== 'function') {
  // @ts-ignore
  Promise.allSettled = function (promises: any[]) {
    const wrappedPromises = promises.map((promise) =>
      Promise.resolve(promise).then(
        (val) => ({status: 'fulfilled', value: val}),
        (err) => ({status: 'rejected', reason: err})
      )
    );
    return Promise.all(wrappedPromises);
  };
}

export {};
