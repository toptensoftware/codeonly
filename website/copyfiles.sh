(cd ../src && npm run build)
cp ../dist/* ./server/public
cp node_modules/@toptensoftware/stylish/stylish.css ./server/public
cp node_modules/@toptensoftware/stylish/*.js ./server/public