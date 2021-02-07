# Changelog

All notable changes to the Feirm PWA will be documented in this file.

## Unreleased
### Changed
* Re-design of Marketplace overview page.
* Addition of more options to the quick actions Marketplace menu.
* Re-design of the wallet overview page.
* Re-design of the receiving address component.
* Live monitoring of an address to detect incoming payment.
* Pre-loading of data (coin network information, transaction UTXOs).
* Improved transaction history view.
* Additional coin wallets are showcased on a carousel.
* Wallet identifier is now based on a SHA-256 hash of the 24-word mnemonic.
* Confirmed and unconfirmed balances are shown on wallet overview page.
* Refresher to fetch wallet balances and organise transactions (wallet overview & individual wallet pages).
* Re-design of the wallet creation and recovery process.
* Real-time calculation of transaction value (including fees).
* Success page when a transaction has been sent.
* Establish WebSocket connection to every coin's Blockbook explorer upon startup.
* Validate "to address" against coin network parameters before sending.
* Show transaction fee and total cost on send coins component.
* Remove wallet and all coins from storage.
* Replace Ionic Slides with official Swiper.js library.
* Re-implemented multiple-asset support.
* Correctly set multiple asset balances on launch.
* Different colour wallet cards depending on the coin.

### Work in Progress
* PGP Signed pages
* Fetching entire transaction state through WebSockets

## [1.1.4](https://github.com/feirm/app/commits/1.1.4) - 05-01-2020
### Changed
* Fix bug which skipped over BIP32 indexes.
* Make use of unused (skipped) BIP32 indexes.
* Improved error handling for wallet encryption feature.

## [1.1.3](https://github.com/feirm/app/commits/1.1.3) - 04-01-2020
### Changed
* Show PWA version on page when a new update is available.
* Fix transaction creation issue with encrypted wallets.

## [1.1.2](https://github.com/feirm/app/commits/1.1.2) - 04-01-2020
### Changed
* Fix issue with deriving new coin wallets due to an invalid mnemonic.
* Remove unused/void settings button on coins due to no functionality.

## [1.1.1](https://github.com/feirm/app/commits/1.1.1) - 04-01-2020
### Changed
* Fix issue with verifying wallet mnemonic on backup screen.

## [1.1.0](https://github.com/feirm/app/commits/1.1.0) - 04-01-2020
### Added
* Display the USD value of 1 XFE on the Discover page.
* Display a notice message if no contacts or transaction history are present for a user.
* Encryption and decryption of an entire wallet using Argon2 and AES-CBC - secured via a 6-digit PIN code.
* Prompt for PIN entry each time the Feirm PWA opens in order to unlock the wallet.
* Wipe Feirm PWA state after 3 incorrect unlock attempts.

### Changed
* Partial re-design of the user registration pages (username, password and PIN).
* Re-design of the PIN entry numeric pad.
* Convert the PIN entry numeric pad into a re-usable component.
* Fixed the value of the "max balance" label. All funds from a specific wallet can now be sent.
* Handle empty QR code data gracefully.
* Re-design of the profile page to make use of more icons and other Ionic Framework elements.


## [1.0.0](https://github.com/feirm/app/commits/1.0.0) - 01-01-2020
* Initial release 🥳