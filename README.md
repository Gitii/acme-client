<div id="top"></div>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Gitii/acme-client">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Gitii's ACME tools</h3>

  <p align="center">
    A small collection collection of packages and tools designed for easy certificate handling using Let's encrypt.  
    It provides an easy-to-use dockerized applciation that orders certificates and stores them in any s3-compliant storage.
    <br />
    <a href="https://github.com/Gitii/acme-client"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Gitii/acme-client">View Demo</a>
    ·
    <a href="https://github.com/Gitii/acme-client/issues">Report Bug</a>
    ·
    <a href="https://github.com/Gitii/acme-client/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->

## About The Project

This `monorepo` contains several small packages that are designed to make the usage of Let's encrypt easier:

* A dockerized application that renews certificates and stores them on any s3-compliant storage server
* A package that implements the storage plugin using [minio](https://www.npmjs.com/package/minio) s3-compliant sdk
* A package that implements the resolver plugin using [hetzner-dns](https://www.npmjs.com/package/hetzner-dns)
* A package that uses [node-acme-client](https://github.com/publishlab/node-acme-client) to `order` Let's encrypt
  certificates

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

* [minio](https://www.npmjs.com/package/minio)
* [hetzner-dns](https://www.npmjs.com/package/hetzner-dns)
* [node-acme-client](https://github.com/publishlab/node-acme-client)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

There are no ready-to-be used docker images in docker-hub.  
You need to checkout this repository and use the provided build scripts to build your own copy.

This application uses [Hetzner's DNS CONSOLE](https://www.hetzner.com/dns-console). You can register for free and esily
manage your dns entries.  
For storage you need an s3-compliant storage (for example AWS S3 or a self-hosted minio server).

### Prerequisites

You need

* latest version of node 14
* yarn

### Installation

1. Get a free API access token at [DNS CONSOLE](https://docs.hetzner.com/dns-console/dns/general/api-access-token/)
2. Clone the repo
   ```sh
   git clone https://github.com/Gitii/acme-client.git
   ```
3. Install NPM packages
   ```sh
   yarn install
   ```
4. Build packages and docker image
   ```sh
   yarn build:image
   ```
5. Enter your token. The token should be placed into a `docker swarm secret`. During development a file mount is
   sufficient. See the sample `docker-compose.yml` for a simple sample setup.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

The application accepts multiple environment variables, that customize it's behaviour. All are required.

| name                  | value                                      |  example           |
|-----------------------|--------------------------------------------|--------------------|
| `MAINTAINER_EMAIL`    | e-mail address. This mail address will be shared with Let's encrypt.                             | `foo.bar@test.com` |
| `STORAGE_BUCKET_NAME` | name of the bucket on the storage server   | `test`             |
| `STORAGE_REGION_NAME` | name of the region of the server           | `eu-central-1`     |
| `STORAGE_ENDPOINT`    | full url of the storage server             | `http://minio:9000`|
| `STORAGE_PATH`        | path in which the certificates in the bucket will be stored  | `a/subfolder/and/another`     |
| `ACCESS_KEY_FILE`     | path to the file in which the access key is stored           | `/run/secrets/secret_key`     |
| `SECRET_KEY_FILE`     | path to the file in which the secret key is stored           | `eu-central-1`                |
| `CHALLENGE_TOKEN_FILE` | path to the file in which the challenge token (hetzner api key) is stored          | `/run/secrets/token`     |
| `CERT_<key>`          | Specifies a site. The name of the environment variable must start with `CERT_` followed by a `key` (letters and digits only). The `value` is the fully qualified domain name. There can be multiple `CERT_`-env variables.           | `CERT_google`: `google.com`     |

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [x] Intial release with `s3` and `hetnzer dns` support
- [ ] READMEs for all packages
- [ ] Full debug support
- [ ] 100% test coverage
- [ ] Provide more `StoragePlugins`:
    - [ ] filesystem based storage ()
- [ ] Provide more `ResolverPlugins`
    - [ ] http-01 challenge
    - [ ] Other dns providers?

See the [open issues](https://github.com/Gitii/acme-client/issues) for a full list of proposed features (and known
issues).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any
contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also
simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->

## Contact

Project Link: [https://github.com/Gitii/acme-client](https://github.com/Gitii/acme-client)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

* [minio](https://www.npmjs.com/package/minio) for the minio sdk
* [hetzner-dns](https://www.npmjs.com/package/hetzner-dns) for the api client
* [node-acme-client](https://github.com/publishlab/node-acme-client) for the api client

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge

[contributors-url]: https://github.com/Gitii/acme-client/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge

[forks-url]: https://github.com/Gitii/acme-client/network/members

[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge

[stars-url]: https://github.com/Gitii/acme-client/stargazers

[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge

[issues-url]: https://github.com/Gitii/acme-client/issues

[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge

[license-url]: https://github.com/Gitii/acme-client/blob/master/LICENSE.txt

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555

[linkedin-url]: https://linkedin.com/in/linkedin_username
