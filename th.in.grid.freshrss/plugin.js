// Shared
// ----------------------------------------------------------------------------

async function fetchAuth() {
  const url = `${site}/api/greader.php/accounts/ClientLogin`;
  const params = { "Email": username, "Passwd": api_password };
  const resp = await sendRequest(url, 'POST', encodeParams(params));
  return resp
    .split("\n")
    .reduce((obj, line) => {
      const [key, value] = line.split("=");
      if (key && value !== undefined) {
        obj[key] = value;
      }
      return obj;
    }, {})
}

// Verify
// ----------------------------------------------------------------------------

function verify() {
  verifyAsync().then(processVerification).catch(processError);
}

async function verifyAsync() {
  let auth = {};
  try {
    auth = await fetchAuth();
  } catch (e) {
    throw new Error("Username or API password is invalid");
  }

  try {
    await fetchItems(auth);
  } catch (e) {
    throw new Error("Cannot fetch content, verify label filter and try again");
  }

  let suffix = "";
  if (label_filter !== "" && label_filter !== "-") {
    suffix = `: ${label_filter}`;
  }

  return {
    "displayName": `FreshRSS${suffix}`,
    "icon": `${site}/themes/icons/apple-touch-icon.png`,
  };
}

// Feed
// ----------------------------------------------------------------------------

async function fetchItems(auth) {
  const authHeader = makeAuthHeader(auth);

  let labelFilter = "user/-/state/com.google/reading-list";
  if (label_filter !== "" && label_filter !== "-") {
    labelFilter = `user/-/label/${label_filter}`;
  }

  const fetchMax = parseInt(fetch_max, 10) || 100;
  const params = { "s": labelFilter, "r": "n", "n": fetchMax };
  const url = `${site}/api/greader.php/reader/api/0/stream/items/ids?output=json&${encodeParams(params)}`;
  const resp = JSON.parse(await sendRequest(url, 'GET', null, authHeader));

  return resp;
}

async function fetchContent(auth, items) {
  const authHeader = makeAuthHeader(auth);
  const itemIds = items["itemRefs"]
    .map((item) => `i=${item["id"]}`)
    .join("&");

  const url = `${site}/api/greader.php/reader/api/0/stream/items/contents?output=json`;
  const resp = JSON.parse(await sendRequest(url, 'POST', itemIds, authHeader));

  return resp;
}

async function markAsRead(auth, items) {
  const authHeader = makeAuthHeader(auth);
  const itemIds = items["itemRefs"]
    .map((item) => `i=${item["id"]}`)
    .join("&");

  const params = { "a": "user/-/state/com.google/read" };
  const url = `${site}/api/greader.php/reader/api/0/edit-tag`;
  const resp = JSON.parse(await sendRequest(url, 'POST', `${itemIds}&${encodeParams(params)}`, authHeader));

  return resp;
}

function load() {
  loadAsync().then(processResults).catch(processError)
}

async function loadAsync() {
  const auth = await fetchAuth();
  const items = await fetchItems(auth);
  const contents = await fetchContent(auth, items);

  markAsRead(auth, items);
  console.log(contents);

  return contents["items"]
    .map((content) => {
      const date = new Date(content["published"] * 1000);
      const href = content["canonical"][0]["href"];

      const item = Item.createWithUriDate(href, date);
      item.title = content["title"];
      item.body = content["summary"]["content"];

      const identity = Identity.createWithName(content["origin"]["title"]);
      identity.uri = content["origin"]["htmlUrl"];
      item.author = identity;

      return item;
    });
}

// Helpers
// ----------------------------------------------------------------------------

function makeAuthHeader(auth) {
  return { "Authorization": `GoogleLogin auth=${auth['Auth']}` };
}

function encodeParams(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
    .join("&");
}
