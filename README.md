# Gcalc API

## Using

-   Typescript
-   Express
-   Puppeteer
-   Other minor packages

## What's this?

A simple express server providing data from Gcalc, the data is collected by a scrapper from https://genshin.honeyhunterworld.com/ and saved localy in `collection` directory

## Instalation

-   Install dependencies `yarn` OR `npm install`
-   Build `yarn build` OR `npm run build`
-   Start the app in production mode `yarn start` OR `npm start`

## Updating the collection

Collection update must be triggered manually by running `yarn resuply` OR `npm run resuply`. Existing records won't be replaced and will be skipped

## Available Scripts

-   `build` - build the app
-   `start` - start the app in production mode
-   `start:dev` - start the app in watch mode
-   `resuply` - regenerate the collection
