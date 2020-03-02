Start Express Server:
$ node server.js

Start Client App:
$ cd ./client
$ npm start

# No-Code Preference Center

## Requirements

For development, you will only need Node.js installed on your environement.

Please use the appropriate [Editorconfig](http://editorconfig.org/) plugin for your Editor (not mandatory).

### Node

[Node](http://nodejs.org/) is really easy to install & now include [NPM](https://npmjs.org/).
You should be able to run the following command after the installation procedure
below.

    $ node --version
    v10.16.0

    $ npm --version
    6.9.0

#### Node installation on OS X

You will need to use a Terminal. On OS X, you can find the default terminal in
`/Applications/Utilities/Terminal.app`.

Please install [Homebrew](http://brew.sh/) if it's not already done with the following command.

    $ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

If everything when fine, you should run

    brew install node

#### Node installation on Linux

    sudo apt-get install python-software-properties
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

#### Node installation on Windows

Just go on [official Node.js website](http://nodejs.org/) & grab the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it.

---

## Install

    $ git clone https://github.com/horizontalintegration/ncpc-react-app.git
    $ cd PROJECT

### Install Node Dependencies

    $ npm install
  
### Local Development

This project makes extensive use of web services for fetching user data and updating users' preferences. Under normal conditions, it is best to use data provided by these services when working locally. To do so, simply run the following command:

    $ npm run dev

Occasionally it becomes necessarry to work with data that is not yet provided by the web services. To that end, the project can be run in local-only mode. Web service data is then replaced with the contents of static, JSON files saved within the project. To run in local-only mode, use the following command:

    $ npm run local

NOTE: The NCPC React app requires valid user ID and language/business unit query string parameters exist; e.g. http://horizontal-ncpc-dev.herokuapp.com/?id=0032E00002jqqM5QAI&langBU=EN-US

## Build for Production

The No Code Preference Center relies on Heroku for all deployed instances from dev to staging to production. As such, no specific action is required on the part of the developer to build the project for production use. To monitor builds and access deployed instances, request access to [https://dashboard.heroku.com/teams/horizontal/apps](https://dashboard.heroku.com/teams/horizontal/apps) from your team lead.

---

## Languages & Tools

### Web Services

- [Express](https://expressjs.com/) for handling web requests.

### JavaScript

- [React](http://facebook.github.io/react) is used for UI.

### CSS

- [SASS](https://sass-lang.com) is used to write futureproof CSS.