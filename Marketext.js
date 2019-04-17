const crypto = require('crypto');
const http = require('http');
const qs = require('querystring');

module.exports = function Marketext() {

    var self = this;

    /**
     *
     * @type {string}
     */
    self.company_id = "";

    /**
     *
     * @type {string}
     */
    self.user = "";

    /**
     *
     * @type {string}
     */
    self.password = "";

    self.host = 'restapi.marketext.com';
    self.port = 80;
    self.path = '/sms/ ' + self.company_id;
    self.http_request_method = "POST";
    self.timeout = 10000;

    /**
     *
     * @param destination<string>
     * @param text<string>
     * @param senderid<string>
     * @param smstype<int>
     * @param date_delivery<string>
     * @param time_delivery<string>
     * @param format<string>
     * @returns {Promise<Object>}
     */
    self.submit_sms = function submit_sms(destination, text, senderid = null, smstype = "instant",
                                          date_delivery = null, time_delivery = null, format = "JSON") {

        return new Promise(function (fulfill, reject) {
            self.path = '/sms/' + self.company_id;
            var timestamp = Math.floor(Date.now() / 1000);
            var nonce = Math.random()
                .toString(36)
                .substring(2, 16) + Math.random()
                .toString(36).substring(2, 16);

            var mac =
                timestamp + '\n' +
                nonce + '\n' +
                self.http_request_method + '\n' +
                self.path + '\n' +
                self.host + '\n' +
                self.port + '\n' +
                '\n';

            var password_hash = crypto.createHash('md5')
                .update(self.password)
                .digest("hex");

            const hash = crypto.createHmac('sha256', password_hash)
                .update(mac)
                .digest('base64');

            var authorization = 'MAC id="' + self.user + '", ts="' + timestamp + '", nonce="' + nonce + '", mac="' + hash + '"';

            var headers = {
                Authorization: authorization
            };

            var post = {
                destination: destination,
                text: text,
                smstype: smstype,
                format: format
            };

            if (senderid != null && senderid !== "") {
                post.senderid = senderid;
            }
            if (date_delivery != null && date_delivery !== "") {
                post.date_delivery = date_delivery;
            }
            if (time_delivery != null && time_delivery !== "") {
                post.time_delivery = time_delivery;
            }
            post.data = qs.stringify(post);
            var opts = {
                host: self.host,
                method: 'POST',
                port: self.port,
                timeout: self.timeout,
                path: self.path + '?' + post.data,
                headers: headers,
                protocol: 'http:'
            };

            var res_data = '';
            var req = http.request(opts, function (response) {
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    res_data += chunk;
                });

                response.on('end', function () {
                    var data = JSON.parse(res_data);
                    if (response.statusCode === 200) {
                        fulfill(data);
                    } else {
                        reject(data);
                    }
                });
            });

            req.on('error', function (e) {
                reject({error: "request error", e: e});
            });
            req.end();
        });
    }
};