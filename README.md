# DatAds Take-Home Exercise

## Overview

This is my submission for the DatAds challenge. The project consists of a distributed system that extracts ad performance data from multiple platforms (Facebook, Google, TikTok), normalizes it into a unified schema, and exposes the aggregated metrics via a REST API.

## Project Structure

├── part_1/          # System design diagram and architecture decisions

├── part_2/          # Data extraction workers and storage logic

├── part_3/          # Query API Layer (Express)

├── package.json     # Single workspace package.json

└── tsconfig.json


## Setup
```bash
npm install
```

Create a .env file in the root directory (using the mock API credentials):
```
BASE_URL=https://datads-mock-ad-apis.happygrass-47d99234.germanywestcentral.azurecontainerapps.io
MAX_RETRIES=4
BASE_DELAY_MS=500
PORT=3000
```

## Running

```Bash
# Part 2 — Extract data and populate the SQLite database
npm run extract

# Part 3 — Start the API server
npm run serve
```

## AI Assistance
As permitted in the guidelines, I used Claude as a pair-programming assistant to speed up writing boilerplate code and to review my documentation. However, the architectural design, database modeling, and core application logic are entirely my own.
