import { PromiseUtil } from "../Utility/Promises";
import { IDataOrErrorContainer } from "../Models/GenericInterfaces";

class CdnManager {
    async GetContentFromUrl(url: string): Promise<IDataOrErrorContainer> {
        const completionPromise = PromiseUtil.CreateCompletionPromise();
        let result: IDataOrErrorContainer = { error: undefined, data: undefined };

        const req = new XMLHttpRequest();
        req.responseType = "blob";
        req.open("GET", url);

        req.onerror = () => {
            result.error = new Error(`Failed getting data from url: ${url}`);
            completionPromise.resolve();
        };

        req.onabort = () => {
            result.error = new Error(`Aborted data retrieval from url: ${url}`);
            completionPromise.resolve();
        };

        req.onloadend = (e) => {
            result.data = req.response;
            completionPromise.resolve();
        };

        req.send();
        await completionPromise.Promise;
        return result;
    }
}

export const CDN: CdnManager = new CdnManager();