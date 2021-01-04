# Changelog

All notable changes to the Feirm PWA will be documented in this file.

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