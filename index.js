/// <reference path="lib/node.d.ts" />
var JsonFilter = (function () {
    function JsonFilter(seperator, override) {
        if (typeof seperator === "undefined") { seperator = '.'; }
        if (typeof override === "undefined") { override = false; }
        this.seperator = seperator;
        this.override = override;
    }
    JsonFilter.prototype._fill = function (a, obj, v, mod) {
        var k = a.shift();

        if (a.length > 0) {
            obj[k] = obj[k] || {};

            if (obj[k] !== Object(obj[k])) {
                if (this.override) {
                    obj[k] = {};
                } else {
                    throw new Error("Trying to redefine '" + k + "' which is a " + typeof obj[k]);
                }
            }

            this._fill(a, obj[k], v, mod);
        } else {
            if (obj[k] === Object(obj[k]) && Object.keys(obj[k]).length) {
                throw new Error("Trying to redefine non-empty obj['" + k + "']");
            }

            obj[k] = this.process(v, mod);
        }
    };

    /**
    * Process.
    *
    * @method process
    * @param {String} value
    * @param {function|Array} mod
    * @return {String} Returns modified value
    */
    JsonFilter.prototype.process = function (v, mod) {
        var i;

        if (typeof mod === 'function') {
            v = mod(v);
        } else if (mod instanceof Array) {
            for (i = 0; i < mod.length; i++) {
                v = mod[i](v);
            }
        }

        return v;
    };

    JsonFilter.prototype.object = function (obj, mods) {
        var that = this;

        Object.keys(obj).forEach(function (k, i) {
            var mod = mods === undefined ? null : mods[k];

            if (k.indexOf(that.seperator) !== -1) {
                that._fill(k.split(that.seperator), obj, obj[k], mod);
                delete obj[k];
            } else if (that.override) {
                obj[k] = that.process(obj[k], mod);
            }
        });
    };

    JsonFilter.prototype.str = function (str, v, obj, mod) {
        if (str.indexOf(this.seperator) !== -1) {
            this._fill(str.split(this.seperator), obj, v, mod);
        } else if (this.override) {
            obj[str] = this.process(v, mod);
        }
    };
    return JsonFilter;
})();

module.exports = JsonFilter;
