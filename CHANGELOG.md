# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.5] - 2023-10-10

### Added
- Dropdown menu for model selection, displaying all available models from OpenRouter
- Settings to adjust model parameters:
  - Frequency penalty
  - Presence penalty
  - Top P

### Changed
- Moved adjustable model parameters (temperature, max_tokens) from options to main properties for easier access
- Updated TypeScript types to align with n8n-workflow version 1.48.0

### Fixed
- Resolved ESLint issues and improved code formatting

## [0.2.0] - 2023-05-14

### Added
- Support for streaming responses from the OpenRouter API
- Additional options for API requests:
  - Temperature
  - Max tokens
- Improved error handling and input validation
- Dropdown selector for OpenRouter models

### Changed
- Updated the node icon to use an SVG file
- Improved description and formatting of node properties

## [0.1.0] - 2023-05-01

### Added
- Initial release of the OpenRouter node for n8n
- Basic chat completion functionality using the OpenRouter API
