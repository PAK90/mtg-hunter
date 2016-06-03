# MtG Hunter; a better Magic card database.

### Installation
First [get Node.js](https://nodejs.org/en/download). Node's package manager, npm, comes with the node installer. Then, in the project directory, install all the npm goodness.
```bash
npm install
```
Currently, the elasticsearch server is run locally on a [Vagrant VM](https://www.vagrantup.com). You'll also need [VirtualBox along with its extension pack](https://www.virtualbox.org/wiki/Downloads). Once these are installed, in the source folder, start the Vagrant VM. This boots up the pre-configured Vagrant file and installs elasticsearch on it.
```bash
vagrant up
```
To stop it for any reason, do ```vagrant halt```.
To populate the elasticsearch server with delicious data, run the indexer script.
```bash
npm run-script index
```
This will print an awful lot of data, and take up to a minute. To confirm this has succeeded, use the [Sense plugin for Chrome](https://chrome.google.com/webstore/detail/sense-beta/lhjgkmllcaadmopgmanpapmpjgmfcfig?hl=en) to confirm the ~16,000 cards are present. The default settings and query will do just fine (localhost:9200 and ```match_all```).

Start npm, and the application will load on http://localhost:3333.
```bash
npm start
```

### Card Prices
This process takes a very long time (almost an hour), but allows extended functionality inside the app.

To populate the database with card prices, make sure you first have the [Babel CLI](https://babeljs.io/docs/usage/cli/), or run `npm install -g babel-cli` to install it globally

Open `getCardPrices.js` comment out line 11, and uncomment line 12.

Then, `npm run prices`