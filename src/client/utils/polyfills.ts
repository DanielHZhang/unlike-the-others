if (typeof Promise.allSettled !== 'function') {
  // @ts-ignore
  Promise.allSettled = async function (promises: any[]) {
    const wrappedPromises = promises.map(async (promise) =>
      Promise.resolve(promise).then(
        (val) => ({status: 'fulfilled', value: val}),
        (err) => ({status: 'rejected', reason: err})
      )
    );
    return Promise.all(wrappedPromises);
  };
}

export {};
