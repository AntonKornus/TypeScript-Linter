# TypeScript-Linter
This action checks TypeScript files according to your rules.

Was made as simple as possible to get maximum stability and speed.

In order to get it works your `node_modules` and config files: `tsconfig.json`, `tslint.json` 
should be in the root folder of your project. Also you can specify any folder to check, using `folder` option.

Next step create `.github/workflows/any-name.yml` in the root folder of your project and place there code from example below:

## Example usage
```
on: [push]
jobs:
  linter-action:
    runs-on: ubuntu-latest
    name: Linter action
    steps:
      - uses: actions/checkout@v2
      - name: Prepare
        run: npm ci # you can use any custom command, just be sure it includes npm install
      - name: Linter action
        id: linter
        uses: AntonKornus/TypeScript-Linter@1.0.0
        with:
          folder: src # optional
```
