#!
npm run build

cd ../../typesense-instantsearch-demo
cp src/app.rentals.js src/app.js
npm run clean
npm run buildrentals
cd -
# mkdir  dist/main
cp ../../typesense-instantsearch-demo/dist/* dist
cp ../../prop-marketing/firebase/public/maprentals.html dist



npx firebase deploy

