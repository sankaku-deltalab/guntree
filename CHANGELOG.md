# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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

[Unreleased]: https://github.com/sankaku-deltalab/guntree/compare/0.6.0...HEAD
[0.6.0]: https://github.com/sankaku-deltalab/guntree/compare/0.5.0...0.6.0
[0.5.0]: https://github.com/sankaku-deltalab/guntree/compare/0.4.3...0.5.0
[0.4.3]: https://github.com/sankaku-deltalab/guntree/compare/0.4.2...0.4.3
[0.4.2]: https://github.com/sankaku-deltalab/guntree/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/sankaku-deltalab/guntree/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/sankaku-deltalab/guntree/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/sankaku-deltalab/guntree/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/sankaku-deltalab/guntree/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/sankaku-deltalab/guntree/releases/tag/0.1.0
