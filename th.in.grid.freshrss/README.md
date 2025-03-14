# FreshRSS Connector for Tapestry

A simple plugin for connecting [Tapestry](https://usetapestry.com/) to [FreshRSS](https://freshrss.org/)

## Configuration

- **Site**: URL to your FreshRSS instance, e.g. `https://freshrss.example.com` (without `/i/`)
- **Username**: FreshRSS username
- **API password**: FreshRSS API password (Profile → External access via API → API password)
- **Label filter**: Query only a certain label/category; use "-" to query all (default: `-`)
- **Max fetch**: Number of items to fetch (default: `100`)
- **Mark as read**: Whether to mark all results returned by a label filter as read after fetching (default: off)

## Development References

- [FreshRSS Google Reader API](https://github.com/FreshRSS/FreshRSS/blob/edge/docs/en/developers/06_GoogleReader_API.md)
- [BazQux Reader API](https://github.com/bazqux/bazqux-api)
