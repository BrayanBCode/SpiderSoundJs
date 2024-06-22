class EventEmitter {
    private listeners: Map<string, ((param: any) => void)[]> = new Map();

    on(eventName: string, listener: (param: any) => void): void | any {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)!.push(listener);
        return listener
    }

    emit(eventName: string, param: any): void {
        this.listeners.get(eventName)?.forEach(listener => listener(param));
    }

    off(eventName: string, listenerToRemove: (param: any) => void): void {
        if (!this.listeners.has(eventName)) {
            return;
        }
        const listeners = this.listeners.get(eventName)!.filter(listener => listener !== listenerToRemove);
        this.listeners.set(eventName, listeners);
    }
}



