#!
source $NVM_DIR/nvm.sh;
nvm use v18.18.2
npm run build
# exit

if false; then
cd ../../typesense-instantsearch-demo
cp src/app.rentals.js src/app.js
npm run clean
npm run buildrentals
cd -
# mkdir  dist/main
cp ../../typesense-instantsearch-demo/dist/* dist
cp ../../prop-marketing/firebase/public/maprentals.html dist
fi


cd ../../typesense-instantsearch-demo
cp src/app.voters.js src/app.js
npm run clean
npm run buildvoters
cd -
# mkdir  dist/main
cp ../../typesense-instantsearch-demo/dist/* dist

npx firebase deploy

