export class Observable<ObserverType extends IObserver<ArgType>, ArgType>{
    private _observers: ObserverType[] = [];

    Subscribe(observer: ObserverType): void {
        const index = this._observers.indexOf(observer, 0);
        if (index == -1)
            this._observers.push(observer);
    }

    Unsubscribe(observer: ObserverType): void {
        const index = this._observers.indexOf(observer, 0);
        if (index > -1)
            this._observers.splice(index, 1);
    }

    Notify(args: ArgType): void {
        this._observers.forEach(o => o.OnObservableNotified(args));
    }
}

export interface IObserver<T> {
    OnObservableNotified(args: T): void;
}