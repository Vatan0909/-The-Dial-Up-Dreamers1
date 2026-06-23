(function () {
  const cache = new Map();

  async function request(url) {
    if (cache.has(url)) {
      return cache.get(url);
    }

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("خطا در دریافت داده: " + url);
    }

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json") || url.endsWith(".json");
    let data;
    if (isJson) {
      data = JSON.parse(await response.text());
    } else {
      data = await response.text();
    }
    cache.set(url, data);
    return data;
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  window.SiteDataService = {
    request,
    getQueryParam
  };
})();
