class Deferred<T, E = Error> {
  promise: Promise<T>;

  // @ts-expect-error Promise constructors are run synchronously
  resolve: (value: T | PromiseLike<T>) => void;

  // @ts-expect-error Promise constructors are run synchronously
  reject: (reason?: E) => void;

  then: Promise<T>["then"];

  catch: Promise<T>["catch"];

  finally: Promise<T>["finally"];

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.then = this.promise.then.bind(this.promise);
    this.catch = this.promise.catch.bind(this.promise);
    this.finally = this.promise.finally.bind(this.promise);
  }
}

export default <T, E>(): Deferred<T, E> => new Deferred();
