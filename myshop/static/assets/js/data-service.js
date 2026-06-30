(function () {
  const cache = new Map();

  function resolveUrl(url) {
    if (/^(https?:)?\/\//.test(url) || url.charAt(0) === "/" || url.indexOf("data:") === 0) {
      return url;
    }
    var staticRoot = window.STATIC_URL || "/static/";
    if (url.indexOf("assets/") === 0 || url.indexOf("bootstrap-pack/") === 0) {
      return staticRoot + url;
    }
    return url;
  }

  async function request(url) {
    var resolvedUrl = resolveUrl(url);
    if (cache.has(resolvedUrl)) {
      return cache.get(resolvedUrl);
    }

    const response = await fetch(resolvedUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("خطا در دریافت داده: " + url);
    }

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json") || resolvedUrl.endsWith(".json");
    let data;
    if (isJson) {
      data = JSON.parse(await response.text());
    } else {
      data = await response.text();
    }
    cache.set(resolvedUrl, data);
    return data;
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  window.SiteDataService = {
    request,
    getQueryParam,
    resolveUrl
  };
})();
