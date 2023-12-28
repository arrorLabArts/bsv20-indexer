const fetch = require("node-fetch")

class HttpService{
      async getReq(url) {
        let response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        return data;
      }

      async getReqBin(url) {
        let response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.buffer();
        return data;
      }

      async getReqText(url) {
        let response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      }

     async postReq(url, payload) {
        let response = await fetch(url, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let responseData = await response.json();
        return responseData;
      }

      async voidPost(url) {
        let response = await fetch(url, {
          method: 'POST'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
      }
}

module.exports = HttpService;