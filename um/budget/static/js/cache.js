var cacheMan = (function (){
    let expirationPostfix = "_expiration__";
    return {
        setItem: function (key, item, expireMilliseconds=30 * 24 * 60 * 60 * 1000) {
            // default expire in 30 days
            localStorage.setItem(key + expirationPostfix, Date.now() + expireMilliseconds)
            localStorage.setItem(key, item);
        },
        getItem: function (key) {
            let expirationKey = key + expirationPostfix;
            let expiration = localStorage.getItem(expirationKey);
            if (expiration == null) {
                return null;
            } else if (expiration - 0 > Date.now()) {
                return localStorage.getItem(key);
            } else {
                localStorage.removeItem(key);
                localStorage.removeItem(expirationKey);
                return null;
            }
        }
    };
})();