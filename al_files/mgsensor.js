(function() {
    var domain = 'a.mgid.com'; var gid = '0'; var tid = '0'; var muidn = 'k9ebLk32xIWj'; var mtuid = '0';

    var MgSensor = function(params) {
        var host = "https://" + domain + "/1x1.gif";
        var autoHost = "https://" + domain + "/auto.gif";
        var cmHost = "https://" + domain.replace(/^[^.]./, 'cm.') + "/sm.js";
        var isLongCheck = false;
        var uwuid;
        var ugid;
        var utmSensor;
        var utmSource;
        var utmCampaign;
        var utmMedium;
        var clid;
        var nvisits;
        var utmUpdated = false;
        var uriHref = document.location.href;

        var self = this;

        var sendData = function(target, extra) {
            var src = host + "?id=" + (params.cid ? params.cid : params.id) + (params.cid ? "&type=c" : "&type=s") + "&tg=" + target + "&r=" + encodeURIComponent(document.location.href);
            src += '&utmc=' + ugid;
            src += '&utmt=' + uwuid;
            src += '&nv=' + Number(nvisits);
            src += '&utms=' + utmSource;
            src += '&utmcp=' + utmCampaign;
            src += '&utmm=' + utmMedium;
            src += '&clid=' + clid;
            src += '&cmgid=' + gid;
            src += '&cmtid=' + tid;
            src += '&cmtuid=' + mtuid;

            if (typeof extra === 'object') {
                if (extra.gtm_stage) src += '&gtms=' + extra.gtm_stage;
                if (extra.gtm_revenue) src += '&gtmr=' + extra.gtm_revenue;
                if (extra.gtm_category) src += '&gtmc=' + extra.gtm_category;
            }

            send(src);
        };

        var getCookiePrefix = function() {
            var domainParts = /a\.([^\.]*)\.(.*)/.exec(domain);
            if (domainParts[1]) {
                return domainParts[1].charAt(0).toUpperCase() + domainParts[1].slice(1);
            } else {
                return 0;
            }
        };

        var getCookie = function() {
            var matches = document.cookie.match(new RegExp("(?:^|; )" + getCookiePrefix() + "Sensor=([^;]*)"));

            if (matches) {
                var res = matches[1].split('_');
                if (res[0] && res[1]) {
                    gid = res[0]!=0 ? res[0] : gid;
                    tid = res[1]!=0 ? res[1] : tid;
                } else {
                    gid = 0;
                    tid = 0;
                }

                mtuid = res[2] ? (res[2]!=0 ? res[2] : mtuid) : 0;
            } else if (gid != 0 && tid != 0 && mtuid != 0) {
                document.cookie = getCookiePrefix() + "Sensor=" + gid + "_" + tid + "_" + mtuid + ";path=/;expires=" + (new Date((!Date.now ? new Date().valueOf() : Date.now()) + 864e5)).toUTCString();
            }
        };

        /**
         * Utms + visits
         */
        var manageData = function () {
            updateUtmData();
            updateVisits();
            populateVars();
        };

        /**
         * utm to cookie
         */
        var updateUtmData = function () {
            var queryParts = {};

            var sArray = location.search.substr(1).split("&");

            for (var i = 0, len = sArray.length; i < len; i++) {
                var pair = sArray[i];
                if (pair === "")  {
                    continue;
                }
                var parts = pair.split("=");
                queryParts[parts[0]] = parts[1] && decodeURIComponent(parts[1].replace(/\+/g, " "));
            }

            if (queryParts['utm_content'] && queryParts['utm_term'] && queryParts['utm_source']) {
                writeCookie('SensorUtm',  queryParts['utm_content'] + "_" + queryParts['utm_term']);
                writeCookie('SensorUtmMedium', queryParts['utm_medium']);
                writeCookie('SensorUtmCampaign', queryParts['utm_campaign']);
                writeCookie('SensorUtmSource', queryParts['utm_source']);

                utmUpdated = true;
            }

            var queryClid = queryParts['adclid'] || (queryParts['adclida'] ? queryParts[queryParts['adclida']] : null);
            if (queryClid) {
                writeCookie('SensorClid', queryClid);
            }
        };

        /**
         * Update visits counter
         */
        var updateVisits = function () {
            nvisits = Number(readCookie('SensorNVis'));
            var lastHref = readCookie('SensorHref');

            switch (true) {
                case lastHref == uriHref:
                    break;

                default:
                    nvisits++;
                    break;
            }

            writeCookie('SensorNVis', nvisits);
            writeCookie('SensorHref', uriHref);
        };

        /**
         * save cookie
         *
         * @param name string
         * @param value string
         */
        var writeCookie = function (name, value) {
            var d = new Date();
            d.setTime(d.getTime() + (90 * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = getCookiePrefix() + name + "=" + value + ";path=/; " + expires;
        };

        /**
         * read cookie
         *
         * @param name
         * @returns
         */
        var readCookie = function (name) {
            var matches;
            return (matches = document.cookie.match(new RegExp("(?:^|; )" + getCookiePrefix() + name +"=([^;]*)")))
                ? matches[1]
                : '';
        };

        /**
         * Populate vars from cookie
         */
        var populateVars = function () {
            nvisits = Number(readCookie('SensorNVis'));
            utmSource = readCookie('SensorUtmSource');
            utmMedium = readCookie('SensorUtmMedium');
            utmCampaign = readCookie('SensorUtmCampaign');
            utmSensor = readCookie('SensorUtm');
            clid = readCookie('SensorClid');

            ugid = 0;
            uwuid = 0;
            if (utmSensor) {
                var res = utmSensor.split('_');
                if (res[0] && res[1]) {
                    ugid = res[0]!=0 ? res[0] : ugid;
                    uwuid = res[1]!=0 ? res[1] : uwuid;
                }
            }
        };

        var sendAutoData = function() {
            if (params.eid == undefined) params.eid = "";
            if (params.goods == undefined) params.goods = [];
            if (params.partner == undefined) params.partner = "";
            var src = autoHost
                + "?sid=" + (params.cid ? params.cid : params.id)
                + "&eid=" + params.eid
                + (params.cid ? "&type=c" : "&type=s")
                + "&goods=" + params.goods.join(',')
                + "&partner=" + params.partner
                + "&referer=" + encodeURIComponent(document.referrer);
            send(src);
            sendCm();
        };

        var sendCm = function () {
            var d = document;
            var n = d.getElementsByTagName("body")[0];
            var s = d.createElement("script");
            s.type = "text/javascript";
            s.async = true;
            s.src = cmHost + "?" + cbuster();
            n.appendChild(s, n);
        };

        var send = function(src) {
            src += "&" + cbuster();
            (new Image).src = src;
        };

        var cbuster = function() {
            return 'd=' + (!Date.now ? new Date().valueOf() : Date.now());
        }

        this.invoke = function(target, data) {
            getCookie();
            manageData();
            sendData(target, data);
            if (params.eid || params.goods) {
                sendAutoData();
            }
        };
        
        this.invokeAll = function (stack) {
            if (stack === undefined) {
                for (var invokeName in self.getAllInvokers()) {
                    self.addInvokeQueue(invokeName);
                }
                return;
            }

            for (var i = 0; i < stack.length; i++) {
                self.addInvokeQueue(stack[i][0], stack[i][1] || []);
            }
        };
        
        this.getAllInvokers = function () {
            return window._mgr;
        }

        this.mgqWorker = function() {
            for (var i = 0; i < window._mgq.length; i++) {
                var el = window._mgq[i];
                if (typeof(window[el[0]]) == 'function') {
                    window[el[0]].apply(window, el.slice(1));
                    window._mgq.splice(i, 1);
                }
            }
            if (!window._mgqi) {
                window._mgqi = window.setInterval(function() {
                    self.mgqWorker();
                }, 5);
            }

            if (!isLongCheck) {
                if ((new Date()).getTime() - window._mgqt > 10000) {
                    isLongCheck = true;
                    window.clearInterval(window._mgqi);
                    window._mgqi = window.setInterval(function() {
                        self.mgqWorker();
                    }, 100);
                }
            }
        };

        this.addInvokeQueue = function (name, params) {
            window._mgq.push([name, params || []]);
        };
        
        this.mgqInit = function() {
            window._mgq = window._mgq || [];
            
            if (typeof(window._mgqp) == 'undefined') {
                window._mgqp = self.mgqWorker;
                window._mgqt = (new Date()).getTime();
                self.mgqWorker();
            }
        };
    };
    
    var registerInvoker = function (name) {
        if (window._mgr === undefined) {
            window._mgr = {};
        }
        
        window._mgr[name] = name;
    };
    
    var initHistoryListener = function () {
        if (window._mghl) {
            return;
        }

        window._mghl = {
            oldUrl: window.location.href
        };
        
        var historyHasChanged = function () {
            if (window._mghl.oldUrl !== window.location.href) {
                window.MgSensor.invokeAll();
                window._mghl.oldUrl = window.location.href;
            }
        };
        var changeLocation = function (f) {
            return function () {
                var ret = f.apply(this, arguments);
                historyHasChanged();
                return ret;
            };
        };

        if (typeof window.history.pushState === 'function') {
            window.history.pushState = changeLocation(window.history.pushState);
        }

        if (typeof window.history.replaceState === 'function') {
            window.history.replaceState = changeLocation(window.history.replaceState);
        }

        window.addEventListener('popstate', historyHasChanged);
    }

    var baseInvokeName = 'MgSensorInvoke';
    
    if (Object.prototype.toString.call(MgSensorData) === '[object Array]') {
        var cids = {};
        for (var i = 0; i < MgSensorData.length; i++) {
            if (cids[MgSensorData.cid] !== undefined) {
                continue;
            }
            if (MgSensorData[i].project === domain) {
                var sensor = new MgSensor(MgSensorData[i]);
                var methodName = baseInvokeName + i;
                window.MgSensor = sensor;
                window[methodName] = window[baseInvokeName] = sensor.invoke;
                sensor.mgqInit();
                registerInvoker(methodName);
                sensor.addInvokeQueue(methodName, [""]);
                cids[MgSensorData.cid] = MgSensorData.cid;
            }
        }
    } else if (MgSensorData && (MgSensorData.id || MgSensorData.cid)) {
        window.MgSensor = new MgSensor(MgSensorData);
        window.MgSensorInvoke = window.MgSensor.invoke;
        window.MgSensor.mgqInit();
        registerInvoker(baseInvokeName);
        window.MgSensor.addInvokeQueue(baseInvokeName, ['']);
    }

    if (window.history !== undefined) {
        initHistoryListener();
    }
})();
