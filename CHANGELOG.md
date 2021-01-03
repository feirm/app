# Changelog

All notable changes to the Feirm PWA will be documented in this file.

## [Unreleased]
### Added
* Display the USD value of 1 XFE on the Discover page.
* Display a notice message if no contacts or transaction history are present for a user.
* Encryption and decryption of an entire wallet using Argon2 and AES-CBC - secured via a 6-digit PIN code.
* Prompt for PIN entry each time the Feirm PWA opens in order to unlock the wallet.

### Changed
* Partial re-design of the user registration pages (username, password and PIN).
* Re-design of the PIN entry numeric pad.
* Convert the PIN entry numeric pad into a re-usable component.
* Fixed the value of the "max balance" label. All funds from a specific wallet can now be sent.
* Handle empty QR code data gracefully.
* Re-design of the profile page to make use of more icons and other Ionic Framework elements.


## [1.0.0](https://github.com/feirm/app/commits/1.0.0) - 01-01-2020
* Initial release 🥳