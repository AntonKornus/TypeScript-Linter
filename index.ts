const core = require('@actions/core');
const tsLinter = require('tslint');
const glob = require("glob");
const fs = require('fs');

try {
    const lintAction = (() => {
        const configFile: object = core.getInput('config');
        const pattern: string = core.getInput('pattern');
        const files: Array<string> = glob.sync(pattern);
        console.log('Found ' + files.length + ' files.');

        const options: object = {fix: false, formatter: 'json'}
        const linter = new tsLinter.Linter(options);
        files.map(file => {
            console.log('Checking: ' + file);
            const fileContent: string = fs.readFileSync(file, {encoding: 'utf8'});
            const configuration: object = tsLinter.Configuration.findConfiguration(configFile, file).results;
            linter.lint(file, fileContent, configuration);
        });
        console.log(linter.getResult());
        return linter.getResult();
    })();

    const result: Array<object> = [];
    lintAction.failures.map(failure => {
        result.push({
            file: failure.getFileName(),
            rule: failure.getRuleName(),
            description: failure.getFailure(),
            position: failure.getStartPosition().getLineAndCharacter()
        });
    });

    if (result.length) {
        console.log(result);
        core.setFailed();
    }
} catch (error) {
    core.setFailed(error.message);
}
