<h1 align="center">Feirm Platform</h1>
<p align="center">📱 Front-end web application for the Feirm Platform.</p>

The Feirm Plaform web application is a crucial part of the Feirm ecosystem. It handles all the cryptography required to secure user accounts, and also acts as the interface to other platforms being developed under our ecosystem.

The web application is currently deployed as a PWA at [https://app.feirm.com](https://app.feirm.com), allowing it to operate on a multitude of devices as long as they have a modern web browser with JavaScript support.

The following technologies have been used when building the application:
* Vue.js
* TypeScript
* Ionic

## Get Started
As the Feirm Platform web application has been built with the Ionic framework along with Vue.js you need to ensure that the Ionic CLI is installed on your system. We prefer to use Yarn for our package manager, so please adapt the command below as necessary for your package manager of choice.

```bash
$ yarn global add @ionic/cli
```

Now you can go ahead and clone this repository, and then execute the commands below to launch the web application.
```bash
$ git clone https://github.com/feirm/platform-app.git
$ cd platform-app/
$ yarn install
$ ionic serve
```