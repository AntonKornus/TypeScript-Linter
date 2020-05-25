# TypeScript-Linter
This action checks TypeScript files according to your rules.

## Example usage
```
on: [push]
jobs:
  linter-action:
    runs-on: ubuntu-latest
    name: Linter action
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 1
      - name: Linter action
        id: linter
        uses: AntonKornus/TypeScript-Linter@master
        with:
          config: 'tsconfig.json'
          rules: 'tslint.json'
          working-directory: ''
```
