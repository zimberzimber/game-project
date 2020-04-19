export interface CompletionPromiseData {
    Promise: Promise<void>;
    resolve: Function;
    reject: Function;
}

class PromiseUtil {
    /**
    * Creates an awaitable, promise based delay.
    * @param delay Time before the promise resolves itself.
    */
    static Delay = (delay: number): Promise<void> =>
        new Promise((resolve, _) => { setTimeout(() => resolve(), delay) });
    
    /**
     * Creates and returns an object containing a promise that can only be resolved or rejected externally, as well as its resolving and rejecting methods.
     */
    static CreateCompletionPromise = (): CompletionPromiseData => {
        const container: any = {};
        container.Promise = new Promise((resolve, reject) => {
            container.resolve = resolve;
            container.reject = reject;
        });
    
        return container;
    }
}

export default PromiseUtil;