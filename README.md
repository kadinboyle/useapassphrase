


# My Fork of 'Use A Passphrase (.com)'

This site is intended to both generate simple passphrases as well as advocate
for the use of random passphrases over human-generated passwords.

[Original Project by Mike-Hearn](https://github.com/mike-hearn/useapassphrase)

# Modifications I've made

- Updated NPM Package versions
- Altered application code and UI to allow a larger range of word selections, minimum now is 5 words
- Added functionality to randomly substitute characters for randomly selected symbols in the password or simply append them
- Replaced the old worldlist with the offical (and much stronger) [Diceware EFF wordlist](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases)
- Minor styling updates to accomodate for symbol modification and longer passwords


# Running It Locally

It requires grunt-cli (`npm install -g grunt-cli`), after which you can just
run `npm install` and then `grunt`.

If you have Docker & Docker Compose installed, you should theoretically just be
able to run `docker-compose up` to build the /dist directory, which will create
the index.html file that is entirely self-contained (i.e. it makes no external
calls).
