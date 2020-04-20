import PromiseUtil from "../Utility/Promises";

class CdnManager {
    async GetContentFromUrl(url: string): Promise<Blob | Error> {
        const completionPromise = PromiseUtil.CreateCompletionPromise();
        let result: Blob | Error = new Error(`Error while retrieving data from url: ${url}`);

        const req = new XMLHttpRequest();
        req.responseType = "blob";
        req.open("GET", url);

        req.onerror = () => completionPromise.resolve();

        req.onabort = () => {
            result = new Error(`Aborted data retrieval from url: ${url}`);
            completionPromise.resolve();
        };

        req.onloadend = (e) => {
            result = req.response;
            completionPromise.resolve();
        };

        req.send();
        await completionPromise.Promise;
        return result;
    }
}

const cdnManager: CdnManager = new CdnManager();
export default cdnManager;