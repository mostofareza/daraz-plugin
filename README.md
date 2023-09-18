## After create new repository

```
npm run build
make sure typeorm install your system
npx typeorm migration:generate -d datasource.js src/migrations/fileName
npx medusa migrations run
```
