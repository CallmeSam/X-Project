interface asyncCallback {
    resolve: (value: any) => void
    reject: (value: any) => void
}

class AsyncManager {
    public map: {[key: string]: asyncCallback} = {}

    public waitResult(key: string, resolveFunc?: (value?) => void, rejectFunc?: (value?) => void) {
        console.log('start async')
        const value = this.map[key]
        if (value) {
            value.reject('conflict')
        }
        
        const callback = {
            resolve: null,
            reject: null
        }

        this.map[key] = callback

        new Promise(function(resolve, reject) {
            callback.resolve = resolve
            callback.reject = reject
        })
        .then(resolveFunc)
        .catch(rejectFunc)
    }

    public resolve(key: string, value?: any) {
        const v = this.map[key]
        if (v) {
            v.resolve(value)
            console.log('resolve', key)
            this.map[key] = null
        }
    }

    public reject(key: string, value?: any) {
        const v = this.map[key]
        if (v) {
            v.reject(value)
            // console.log('reject', key)
            this.map[key] = null
        }
    }
}


export let asyncManager = new AsyncManager()

