# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.9.0] - 2020-03-15
### Changed
- Update Player, FiringState usage
- Update ReadMe
- Update guns name

## [0.8.0] - 2020-01-16
### Changed
- FireData contain muzzle name

## [0.7.1] - 2020-01-15
### Fixed
- Add owner to index

## [0.7.0] - 2020-01-15
### Changed
- Update ReadMe
- Update player usage

## [0.6.6] - 2019-12-01
### Fixed
- Fix angle inverting (mirror, alternate and invert)

## [0.6.5] - 2019-11-29
### Fixed
- Fix guns exporting

## [0.6.4] - 2019-11-29
### Fixed
- Fix parameter changing

## [0.6.3] - 2019-07-17
### Changed
- Update dependencies

## [0.6.2] - 2019-05-04
### Changed
- Update dependencies

## [0.6.1] - 2019-05-03
### Fixed
- Use npm script `prepare` instead of `prepublish`

## [0.6.0] - 2019-05-03
### Changed
- Update to run CI test on only master and develop branches
- Update linter to eslint
- Update code to apply eslint
- Move `Bullet` from `gun` to `bullet` file
- Add doccomment
- Update `addTranslation` argument from array to object
- Update `nWayAngle` lazy evaluative argument
- Update ReadMe

### Added
- Add bullet to contents

### Fixed
- Fix `spread` gun option.

## [0.5.0] - 2019-04-25
### Fix
- Fix circular reference in Player and FiringState

### Changed
- Update ReadMe

## [0.4.3] - 2019-04-25
### Changed
- Update FiringState to used dependency injection
- Update Player to used dependency injection
- Delete initial parameters and texts from Player
- Add initial parameters to FireData

## [0.4.2] - 2019-04-25
### Fixed
- Fix .gitlab-ci.yml
- Fix document generating
- Fix tests

### Changed
- Update packages
- Update Repeat gun

## [0.4.1] - 2019-04-23
### Fixed
- Fix .gitlab-ci.yml

## [0.4.0] - 2019-04-23
### Added
- Add .gitlab-ci.yml

## [0.3.0] - 2019-04-23
### Added
- Add addTranslation gun
- Add Nop gun
- Add typedoc

### Fixed
- Fix repeat gun
- Fix FireData transform updating
- Fix importing
- Fix FiringState to copy muzzle
- Fix transform updating

### Changed
- Update index.ts to export muzzle

### Removed
- Delete test of Parameter

## [0.2.0] - 2019-04-04
### Changed
- Use muzzle instead of player owner

### Added
- Add new guns

## [0.1.0] - 2019-01-21
### Added
- Initial release

[Unreleased]: https://github.com/sankaku-deltalab/guntree/compare/0.9.0...HEAD
[0.9.0]: https://github.com/sankaku-deltalab/guntree/compare/0.8.0...0.9.0
[0.8.0]: https://github.com/sankaku-deltalab/guntree/compare/0.7.1...0.8.0
[0.7.1]: https://github.com/sankaku-deltalab/guntree/compare/0.7.0...0.7.1
[0.7.0]: https://github.com/sankaku-deltalab/guntree/compare/0.6.6...0.7.0
[0.6.6]: https://github.com/sankaku-deltalab/guntree/compare/0.6.5...0.6.6
[0.6.5]: https://github.com/sankaku-deltalab/guntree/compare/0.6.4...0.6.5
[0.6.4]: https://github.com/sankaku-deltalab/guntree/compare/0.6.3...0.6.4
[0.6.3]: https://github.com/sankaku-deltalab/guntree/compare/0.6.2...0.6.3
[0.6.2]: https://github.com/sankaku-deltalab/guntree/compare/0.6.1...0.6.2
[0.6.1]: https://github.com/sankaku-deltalab/guntree/compare/0.6.0...0.6.1
[0.6.0]: https://github.com/sankaku-deltalab/guntree/compare/0.5.0...0.6.0
[0.5.0]: https://github.com/sankaku-deltalab/guntree/compare/0.4.3...0.5.0
[0.4.3]: https://github.com/sankaku-deltalab/guntree/compare/0.4.2...0.4.3
[0.4.2]: https://github.com/sankaku-deltalab/guntree/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/sankaku-deltalab/guntree/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/sankaku-deltalab/guntree/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/sankaku-deltalab/guntree/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/sankaku-deltalab/guntree/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/sankaku-deltalab/guntree/releases/tag/0.1.0
