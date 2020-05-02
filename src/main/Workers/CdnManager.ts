import { PromiseUtil } from "../Utility/Promises";
import { IDataOrErrorContainer } from "../Models/GenericInterfaces";

class CdnManager {
    async GetContentFromUrl(url: string): Promise<IDataOrErrorContainer> {
        const completionPromise = PromiseUtil.CreateCompletionPromise();
        let result: IDataOrErrorContainer = { error: undefined, data: undefined };

        const req = new XMLHttpRequest();
        req.responseType = "blob";
        req.open("GET", url);

        req.ontimeout = () => {
            result.error = new Error(`Data retrieval timed out from url: ${url}`);
            completionPromise.resolve();
        };

        req.onerror = () => {
            result.error = new Error(`Data retrieval error from url: ${url}`);
            completionPromise.resolve();
        };

        req.onabort = () => {
            result.error = new Error(`Data retrieval aborted for url: ${url}`);
            completionPromise.resolve();
        };

        req.onloadend = () => {
            result.data = req.response;
            completionPromise.resolve();
        };

        req.send();
        await completionPromise.Promise;
        return result;
    }
}

export const CDN: CdnManager = new CdnManager();